/**
 * Event payload class — the documented pattern of passing a typed instance as the
 * second argument to `EventEmitter2.emit()`.
 */
export class OrderCreatedEvent {
  constructor(
    public readonly orderId: number,
    public readonly item: string,
  ) {}
}
