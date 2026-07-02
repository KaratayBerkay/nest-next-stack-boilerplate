import { Controller, Get, Param } from '@nestjs/common';
import { GreetingLogicService } from './greeting-logic.service';

// The HTTP face of the shared logic. The controller is just a thin transport adapter — the reused
// part is GreetingLogicService.
@Controller('agnostic')
export class AgnosticController {
  constructor(private readonly logic: GreetingLogicService) {}

  @Get('greet/:name')
  greet(@Param('name') name: string): { message: string } {
    return { message: this.logic.greet(name) };
  }
}
