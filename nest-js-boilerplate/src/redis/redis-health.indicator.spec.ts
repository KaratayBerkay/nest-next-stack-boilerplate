import { HealthCheckError } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis-health.indicator';

describe('RedisHealthIndicator', () => {
  let indicator: RedisHealthIndicator;
  let mockClient: { ping: jest.Mock };

  beforeEach(() => {
    mockClient = { ping: jest.fn() };
    indicator = new RedisHealthIndicator(mockClient as never);
  });

  describe('pingCheck', () => {
    it('reports "up" when Redis responds to PING', async () => {
      mockClient.ping.mockResolvedValue('PONG');

      const result = await indicator.pingCheck('redis');

      expect(result).toEqual({ redis: { status: 'up' } });
      expect(mockClient.ping).toHaveBeenCalledTimes(1);
    });

    it('throws a HealthCheckError with a "down" status when the connection is refused', async () => {
      mockClient.ping.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(indicator.pingCheck('redis')).rejects.toThrow(
        HealthCheckError,
      );

      try {
        await indicator.pingCheck('redis');
        throw new Error('expected pingCheck to throw');
      } catch (err) {
        expect(err).toBeInstanceOf(HealthCheckError);
        const healthCheckError = err as HealthCheckError;
        expect(healthCheckError.message).toBe('Redis ping failed');
        expect(healthCheckError.causes).toEqual({
          redis: { status: 'down' },
        });
      }
    });

    it('throws a HealthCheckError when the ping times out', async () => {
      mockClient.ping.mockRejectedValue(new Error('Command timed out'));

      await expect(indicator.pingCheck('redis')).rejects.toThrow(
        HealthCheckError,
      );
    });

    it('uses the provided key to namespace the result', async () => {
      mockClient.ping.mockResolvedValue('PONG');

      const result = await indicator.pingCheck('custom-redis-key');

      expect(result).toEqual({ 'custom-redis-key': { status: 'up' } });
    });
  });
});
