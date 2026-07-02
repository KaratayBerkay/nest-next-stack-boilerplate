import { Injectable } from '@nestjs/common';

// Pure, platform-agnostic logic — no req/res, no Express/Fastify APIs, no transport coupling. The
// kind of "reusable logical part" the docs say can run unchanged across any application type.
@Injectable()
export class GreetingLogicService {
  greet(name: string): string {
    return `Hello, ${name}!`;
  }
}
