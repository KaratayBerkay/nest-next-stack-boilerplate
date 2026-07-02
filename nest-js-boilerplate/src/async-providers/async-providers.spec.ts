import { Test } from '@nestjs/testing';
import { AsyncProvidersModule } from './async-providers.module';
import { ConnectionConsumerService } from './connection-consumer.service';
import { ASYNC_CONNECTION } from './tokens';
import type { AsyncConnection } from './async-connection';

// Proves the documented async-provider behavior: Nest awaits the factory's Promise before the
// token is injectable, and dependents see the resolved value (not the Promise).
describe('Asynchronous providers', () => {
  it('the token resolves to the awaited value, not a Promise', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AsyncProvidersModule],
    }).compile();

    const connection = moduleRef.get<AsyncConnection>(ASYNC_CONNECTION);
    expect(connection).not.toBeInstanceOf(Promise);
    expect(connection.ping()).toBe('pong');
  });

  it('a dependent provider is instantiated only after the async factory resolves', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AsyncProvidersModule],
    }).compile();

    // Would throw if the consumer had been handed an unresolved Promise instead of the connection.
    expect(moduleRef.get(ConnectionConsumerService).check()).toBe('pong');
  });
});
