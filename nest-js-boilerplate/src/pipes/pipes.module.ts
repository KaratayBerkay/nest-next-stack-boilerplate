import { Module } from '@nestjs/common';
import { PipesController } from './pipes.controller';

// Self-contained feature module for the docs.nestjs.com/pipes patterns. Pipes here are bound at
// parameter scope inside the controller (so each route isolates one built-in pipe, plus one custom
// PipeTransform on a body). Pipes can also be bound at method/controller scope via @UsePipes or
// globally via app.useGlobalPipes / an APP_PIPE provider — the global ValidationPipe (#26) is the
// app-wide example; this module covers the built-in parse pipes and the custom-pipe mechanics.
@Module({ controllers: [PipesController] })
export class PipesModule {}
