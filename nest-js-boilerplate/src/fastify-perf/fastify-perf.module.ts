import { Module } from '@nestjs/common';
import { FastifyDemoController } from './fastify-demo.controller';

/**
 * Techniques › Performance / Fastify (#41). Standalone — the platform choice is
 * an app-level decision: the e2e bootstraps this module on a `FastifyAdapter`
 * (the main app stays on Express). Proves the alternative HTTP platform works
 * with ordinary Nest controllers.
 */
@Module({ controllers: [FastifyDemoController] })
export class FastifyPerfModule {}
