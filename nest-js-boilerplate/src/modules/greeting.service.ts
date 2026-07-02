import { Injectable } from '@nestjs/common';

// A shared provider. The mutable `calls` counter lets the spec prove that importers of
// GreetingModule receive the SAME singleton instance (state set via one ref is seen via another).
@Injectable()
export class GreetingService {
  private calls = 0;

  greet(name: string): string {
    this.calls++;
    return `Hello, ${name}!`;
  }

  callCount(): number {
    return this.calls;
  }
}
