import { Controller, Get } from '@nestjs/common';

// Exists so getControllers() has something to discover.
@Controller('discovery')
export class DiscoveryDemoController {
  @Get('ping')
  ping(): string {
    return 'pong';
  }
}
