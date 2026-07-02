import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { InMemoryBroker } from './in-memory-broker';

/**
 * custom transporter (#81) — the **client proxy** (recipes/microservices/custom-transport,
 * "Client proxy"). `ClientProxy.send()`/`emit()` drive the two abstract methods below:
 * `publish()` for request-response, `dispatchEvent()` for fire-and-forget events. We forward each
 * packet through the shared {@link InMemoryBroker} to the {@link InMemoryServer}.
 */
export class InMemoryClient extends ClientProxy {
  /**
   * Records every teardown invocation. The function `publish()` returns is RxJS's teardown for the
   * `send()` stream — it runs whenever a subscription ends (normal completion, error, or an early
   * unsubscribe such as a `timeout()`). Tests assert on this to prove the documented teardown.
   */
  readonly teardownLog: string[] = [];

  constructor(private readonly broker: InMemoryBroker) {
    super();
  }

  connect(): Promise<void> {
    return Promise.resolve();
  }

  close(): void {}

  /**
   * Request-response. `send()` calls this (after `connect()`), passing a `callback` built by
   * `createObserver` that maps each `WritePacket` onto the returned Observable's next/error/
   * complete. We hand the packet + callback to the broker, which routes it to the server; the
   * server's response comes back through that same callback. The returned function is the teardown.
   */
  protected publish(
    packet: ReadPacket,
    callback: (packet: WritePacket) => void,
  ): () => void {
    this.broker.routeMessage(packet, callback);
    return () => {
      this.teardownLog.push(String(packet.pattern));
    };
  }

  /**
   * Event dispatch — fire-and-forget, no response channel. `emit()` calls this.
   * Typed `Promise<any>` to match the framework's abstract contract (`ClientProxy` declares
   * `dispatchEvent<T = any>` and `ClientTCP` returns `Promise<any>` too); the resolved value is
   * irrelevant for events.
   */
  protected dispatchEvent(packet: ReadPacket): Promise<any> {
    this.broker.routeEvent(packet);
    return Promise.resolve();
  }

  unwrap<T = never>(): T {
    throw new Error('Method not implemented.');
  }
}
