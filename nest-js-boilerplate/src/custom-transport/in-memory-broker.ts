import type { ReadPacket, WritePacket } from '@nestjs/microservices';

/**
 * The server side a {@link InMemoryClient} reaches through the broker. The broker is the
 * "connection" of this custom transport: instead of a socket/broker over the network, the client
 * and the strategy share one in-process channel.
 */
export interface BoundServer {
  handleMessage: (
    packet: ReadPacket,
    respond: (data: WritePacket) => void,
  ) => void;
  handleEvent: (packet: ReadPacket) => void;
}

/**
 * custom transporter (#81) — a tiny in-process message bus that stands in for a real broker
 * (Google Cloud Pub/Sub, Kinesis, …). A {@link InMemoryServer} binds itself here when it starts
 * (`app.listen()`); a {@link InMemoryClient} routes messages/events through it. This keeps the
 * proof self-contained (no external infra) while exercising the *real* `@nestjs/microservices`
 * `Server`/`ClientProxy` machinery end-to-end.
 */
export class InMemoryBroker {
  private server: BoundServer | null = null;

  bindServer(server: BoundServer): void {
    this.server = server;
  }

  unbindServer(): void {
    this.server = null;
  }

  get isBound(): boolean {
    return this.server !== null;
  }

  routeMessage(packet: ReadPacket, respond: (data: WritePacket) => void): void {
    if (!this.server) {
      throw new Error(
        'InMemoryBroker: no server bound — call app.listen() first.',
      );
    }
    this.server.handleMessage(packet, respond);
  }

  routeEvent(packet: ReadPacket): void {
    if (!this.server) {
      throw new Error(
        'InMemoryBroker: no server bound — call app.listen() first.',
      );
    }
    this.server.handleEvent(packet);
  }
}
