import { Injectable } from '@nestjs/common';

// A singleton provider aliased by `useExisting`. Because the alias and the class token resolve to
// the SAME instance, state written through one token is visible through the other.
@Injectable()
export class LoggerService {
  private readonly lines: string[] = [];

  log(message: string): void {
    this.lines.push(message);
  }

  history(): string[] {
    return this.lines;
  }
}
