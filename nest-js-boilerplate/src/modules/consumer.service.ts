import { Injectable } from '@nestjs/common';
import { GreetingService } from './greeting.service';

// Lives in ConsumerModule and depends on GreetingService — which ConsumerModule only gets by
// IMPORTING GreetingModule (cross-module DI works only through exports/imports).
@Injectable()
export class ConsumerService {
  constructor(private readonly greeting: GreetingService) {}

  welcome(name: string): string {
    return this.greeting.greet(name);
  }
}
