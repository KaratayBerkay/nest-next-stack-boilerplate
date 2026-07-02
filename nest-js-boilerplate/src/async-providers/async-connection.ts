export interface AsyncConnection {
  readonly establishedAt: number;
  ping(): string;
}

// Simulates an async resource (e.g. a DB handshake) the app must wait for before serving requests.
// The async `useFactory` awaits this; Nest awaits the factory before instantiating any dependent.
export async function createConnection(): Promise<AsyncConnection> {
  await new Promise((resolve) => setTimeout(resolve, 10));
  return {
    establishedAt: Date.now(),
    ping: () => 'pong',
  };
}
