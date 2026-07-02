import { Module } from '@nestjs/common';
import { GreetingService } from './greeting.service';

// Feature module that EXPORTS its provider, so every module importing GreetingModule shares the
// same GreetingService singleton. Its constructor injects that provider too — the docs note a
// module class "can inject providers" (it just can't itself be injected elsewhere).
@Module({
  providers: [GreetingService],
  exports: [GreetingService],
})
export class GreetingModule {
  constructor(private readonly greeting: GreetingService) {}

  // Proves the module class resolved its own provider (exercised when the module boots).
  selfCheck(): boolean {
    return this.greeting instanceof GreetingService;
  }
}
