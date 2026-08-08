import { decryptMessageBody } from './message-body.util';

describe('decryptMessageBody', () => {
  const buildStorageCrypto = () => ({
    toEnvelope: jest.fn(),
    decryptForRoom: jest.fn(),
    decryptFromStorage: jest.fn(),
  });

  it('never decrypts a tombstoned message — body is null, attachments stripped', () => {
    const storageCrypto = buildStorageCrypto();
    const message = {
      id: 'm1',
      v: 'v1',
      ct: 'ct1',
      nonce: 'n1',
      senderId: 'u1',
      deletedAt: new Date('2026-08-08T00:00:00Z'),
      attachments: [{ url: 'https://r2/x.pdf' }],
    };

    const result = decryptMessageBody(message, 'u2', storageCrypto as never);

    expect(result.body).toBeNull();
    expect(result.attachments).toEqual([]);
    expect(result.v).toBeUndefined();
    expect(result.ct).toBeUndefined();
    expect(result.nonce).toBeUndefined();
    expect(storageCrypto.toEnvelope).not.toHaveBeenCalled();
    expect(storageCrypto.decryptForRoom).not.toHaveBeenCalled();
    expect(storageCrypto.decryptFromStorage).not.toHaveBeenCalled();
  });

  it('returns the message unchanged when there is no envelope to decrypt', () => {
    const storageCrypto = buildStorageCrypto();
    storageCrypto.toEnvelope.mockReturnValue(null);
    const message = { id: 'm1', v: null, ct: null, nonce: null };

    const result = decryptMessageBody(message, 'u1', storageCrypto as never);

    expect(result).toBe(message);
  });

  it('decrypts via the room key first', () => {
    const storageCrypto = buildStorageCrypto();
    storageCrypto.toEnvelope.mockReturnValue({
      v: 'v1',
      ct: 'ct1',
      nonce: 'n1',
    });
    storageCrypto.decryptForRoom.mockReturnValue({ text: 'hello' });
    const message = {
      id: 'm1',
      v: 'v1',
      ct: 'ct1',
      nonce: 'n1',
      senderId: 'u1',
    };

    const result = decryptMessageBody(message, 'u2', storageCrypto as never);

    expect(result.body).toBe('hello');
    expect(storageCrypto.decryptFromStorage).not.toHaveBeenCalled();
  });

  it('falls back to the sender key, then the reader key, then gives up', () => {
    const storageCrypto = buildStorageCrypto();
    storageCrypto.toEnvelope.mockReturnValue({
      v: 'v1',
      ct: 'ct1',
      nonce: 'n1',
    });
    storageCrypto.decryptForRoom.mockImplementation(() => {
      throw new Error('not a room message');
    });
    storageCrypto.decryptFromStorage
      .mockImplementationOnce(() => {
        throw new Error('wrong key (sender)');
      })
      .mockImplementationOnce(() => ({ text: 'recovered via reader key' }));
    const message = {
      id: 'm1',
      v: 'v1',
      ct: 'ct1',
      nonce: 'n1',
      senderId: 'u1',
    };

    const result = decryptMessageBody(message, 'u2', storageCrypto as never);

    expect(result.body).toBe('recovered via reader key');
    expect(storageCrypto.decryptFromStorage).toHaveBeenNthCalledWith(
      1,
      'u1',
      expect.anything(),
    );
    expect(storageCrypto.decryptFromStorage).toHaveBeenNthCalledWith(
      2,
      'u2',
      expect.anything(),
    );
  });

  it('returns the original message when every decryption attempt fails', () => {
    const storageCrypto = buildStorageCrypto();
    storageCrypto.toEnvelope.mockReturnValue({
      v: 'v1',
      ct: 'ct1',
      nonce: 'n1',
    });
    storageCrypto.decryptForRoom.mockImplementation(() => {
      throw new Error('nope');
    });
    storageCrypto.decryptFromStorage.mockImplementation(() => {
      throw new Error('nope');
    });
    const message = {
      id: 'm1',
      v: 'v1',
      ct: 'ct1',
      nonce: 'n1',
      senderId: 'u1',
    };

    const result = decryptMessageBody(message, 'u2', storageCrypto as never);

    expect(result).toBe(message);
  });
});
