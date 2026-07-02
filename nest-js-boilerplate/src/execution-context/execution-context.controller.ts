import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { ContextProbeInterceptor } from './context-probe.interceptor';
import { Permissions } from './permissions.decorator';
import { Roles } from './roles.decorator';

// Metadata is applied at BOTH levels so the merge/override helpers have something to combine.
@UseInterceptors(ContextProbeInterceptor)
@Roles(['user']) // class-level default
@Controller('ctx')
export class ExecutionContextController {
  @Post('create')
  @Roles(['admin']) // method-level override
  @Permissions('write')
  create(@Body() body: { name: string }): { created: string } {
    return { created: body.name };
  }

  @Get('list')
  list(): { items: string[] } {
    // No method-level @Roles — proves getAllAndOverride falls back to the class metadata.
    return { items: ['a', 'b'] };
  }
}
