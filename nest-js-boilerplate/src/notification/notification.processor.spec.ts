import type { Job } from 'bullmq';
import { NotificationProcessor } from './notification.processor';

function fakeJob(data: {
  type: 'FRIEND_POST';
  authorId: string;
  userIds: string[];
  title: string;
  postId: string;
}): Job<typeof data> & { updateData: jest.Mock } {
  const job = {
    data,
    updateData: jest.fn().mockResolvedValue(undefined),
  };
  return job as unknown as Job<typeof data> & { updateData: jest.Mock };
}

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;
  let mockNotifications: { create: jest.Mock };
  let mockRealtime: { emitToTopic: jest.Mock };

  beforeEach(() => {
    mockNotifications = { create: jest.fn() };
    mockRealtime = { emitToTopic: jest.fn() };
    processor = new NotificationProcessor(
      mockNotifications as never,
      mockRealtime as never,
    );
  });

  describe('process — FRIEND_POST', () => {
    it('creates a notification for every recipient and fans out over realtime once all succeed', async () => {
      mockNotifications.create.mockResolvedValue(undefined);
      const job = fakeJob({
        type: 'FRIEND_POST',
        authorId: 'author1',
        userIds: ['u1', 'u2', 'u3'],
        title: 'My Post',
        postId: 'p1',
      });

      await processor.process(job);

      expect(mockNotifications.create).toHaveBeenCalledTimes(3);
      expect(mockRealtime.emitToTopic).toHaveBeenCalledWith(
        'feed',
        expect.objectContaining({ type: 'New' }),
      );
      expect(job.updateData).not.toHaveBeenCalled();
    });

    it('shrinks the job to only the still-failing recipients instead of leaving BullMQ retry the full list — regression: Promise.all rejected on the first failure, so a retry re-ran every userId from scratch, duplicating a Notification row for every recipient who had already succeeded on the prior attempt', async () => {
      mockNotifications.create.mockImplementation(
        (input: { userId: string }) =>
          input.userId === 'u2'
            ? Promise.reject(new Error('transient db error'))
            : Promise.resolve(undefined),
      );
      const job = fakeJob({
        type: 'FRIEND_POST',
        authorId: 'author1',
        userIds: ['u1', 'u2', 'u3'],
        title: 'My Post',
        postId: 'p1',
      });

      await expect(processor.process(job)).rejects.toThrow(
        'transient db error',
      );

      expect(mockNotifications.create).toHaveBeenCalledTimes(3);
      expect(job.updateData).toHaveBeenCalledWith(
        expect.objectContaining({ userIds: ['u2'] }),
      );
      // A partial failure must not still claim success over realtime.
      expect(mockRealtime.emitToTopic).not.toHaveBeenCalled();
    });

    it('does not shrink or throw when every recipient succeeds even if results resolve out of order', async () => {
      mockNotifications.create.mockResolvedValue(undefined);
      const job = fakeJob({
        type: 'FRIEND_POST',
        authorId: 'author1',
        userIds: ['u1'],
        title: 'My Post',
        postId: 'p1',
      });

      await processor.process(job);

      expect(job.updateData).not.toHaveBeenCalled();
    });
  });

  describe('process — unknown job type', () => {
    it('logs and returns instead of throwing for an unrecognized type', async () => {
      const job = {
        data: { type: 'SOMETHING_ELSE' },
        updateData: jest.fn(),
      } as unknown as Job<never>;

      await expect(processor.process(job)).resolves.toBeUndefined();
      expect(mockNotifications.create).not.toHaveBeenCalled();
    });
  });
});
