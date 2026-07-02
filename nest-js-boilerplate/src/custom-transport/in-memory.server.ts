import {
  CustomTransportStrategy,
  ReadPacket,
  Server,
  WritePacket,
} from '@nestjs/microservices';
import { InMemoryBroker } from './in-memory-broker';
import { InMemoryContext } from './in-memory.context';

// Parametrizing `Server` with a concrete events map (as the built-in `ServerTCP extends
// Server<TcpEvents>` does) gives `on()` a clean, typed signature instead of the base default's
// bare `Function` — which TS rejects as an override target under strict mode.
type InMemoryEvents = Record<string, (...args: unknown[]) => void>;

/**
 * custom transporter (#81) — the **server strategy** (recipes/microservices/custom-transport,
 * "Creating a strategy"). Extends the `Server` base class (for the handler registry + helpers) and
 * implements `CustomTransportStrategy` (`listen`/`close`). Plug it in with
 * `NestFactory.createMicroservice(AppModule, { strategy: new InMemoryServer(broker) })`.
 *
 * The docs stop at `console.log(this.messageHandlers)` inside `listen()`. We go further and build a
 * *working* transport: on an incoming message we look up the registered handler, execute it, and
 * pipe its result back to the client — mirroring how `ServerTCP.handleMessage` does it, minus the
 * socket/serializer (an in-memory channel needs no wire format).
 */
export class InMemoryServer
  extends Server<InMemoryEvents>
  implements CustomTransportStrategy
{
  // Optional, but the `Server` base threads it through the processing hooks; a Symbol keeps it
  // distinct from the built-in `Transport` enum values.
  readonly transportId = Symbol('IN_MEMORY');

  constructor(private readonly broker: InMemoryBroker) {
    super();
  }

  /**
   * Triggered by `app.listen()`. By now Nest's runtime has scanned every `@MessagePattern`/
   * `@EventPattern` and called `addHandler()` on us, so `this.messageHandlers` is fully populated.
   * A real transport would open its broker connection + subscribe here; we just bind to the broker.
   */
  listen(callback: (...optionalParams: unknown[]) => void): void {
    this.broker.bindServer({
      handleMessage: (packet, respond) => this.handleMessage(packet, respond),
      handleEvent: (packet) => this.handleIncomingEvent(packet),
    });
    callback();
  }

  /** Triggered on application shutdown — a real transport would close its connection here. */
  close(): void {
    this.broker.unbindServer();
  }

  /**
   * Proves the docs' central claim ("with the `Server` class you can see what message patterns
   * have been registered") — the strategy can introspect its own handler registry.
   */
  get registeredPatterns(): string[] {
    return [...this.messageHandlers.keys()];
  }

  private handleMessage(
    packet: ReadPacket,
    respond: (data: WritePacket) => void,
  ): void {
    const pattern = this.normalizeInbound(packet.pattern);
    const context = new InMemoryContext([pattern]);
    const handler = this.getHandlerByPattern(pattern);
    if (!handler) {
      respond({
        err: `There is no matching message handler for "${pattern}".`,
        isDisposed: true,
      });
      return;
    }
    // `onProcessingStartHook` defaults to `done => done()`; calling it keeps parity with the
    // built-in transports (and any registered processing hooks). The handler may return a value,
    // a Promise, or an Observable (e.g. when interceptors wrap it) — `transformToObservable`
    // normalizes all three, and `send()` subscribes and streams each `WritePacket` back.
    void this.onProcessingStartHook(this.transportId, context, async () => {
      const response$ = this.transformToObservable(
        await handler(packet.data, context),
      );
      this.send(response$, (data) => respond(data));
    });
  }

  private handleIncomingEvent(packet: ReadPacket): void {
    const pattern = this.normalizeInbound(packet.pattern);
    // `handleEvent` finds the `@EventPattern` handler and executes it; there is no response channel.
    void this.handleEvent(pattern, packet, new InMemoryContext([pattern]));
  }

  /** Mirrors `ServerTCP`: object patterns are keyed by their JSON form, strings pass through. */
  private normalizeInbound(pattern: unknown): string {
    return typeof pattern === 'string' ? pattern : JSON.stringify(pattern);
  }

  // The docs note these two are ignorable for most custom transports — we don't expose the
  // underlying broker instance, nor let users register raw event listeners.
  on<
    EventKey extends keyof InMemoryEvents = keyof InMemoryEvents,
    EventCallback extends InMemoryEvents[EventKey] = InMemoryEvents[EventKey],
  >(_event: EventKey, _callback: EventCallback): void {
    throw new Error('Method not implemented.');
  }

  unwrap<T = never>(): T {
    throw new Error('Method not implemented.');
  }
}
