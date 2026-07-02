import { Module } from '@nestjs/common';
import { AddCommand } from './add.command';
import { BasicCommand } from './basic.command';
import { LogService } from './log.service';
import { MathCommand } from './math.command';

/**
 * nest-commander (#117) — the CLI's root module (the docs' `AppModule` for the CLI process).
 * Every command and its collaborators are ordinary providers; nest-commander discovers the
 * `@Command`/`@SubCommand` classes from here at bootstrap.
 *
 * Standalone — intentionally NOT imported by the HTTP `AppModule`. nest-commander builds a *CLI*
 * process (`cli.ts` via `CommandFactory.run`); mixing its command runner into the long-running web
 * app would register commander/argv parsing on every web boot. The feature is proven by
 * `nest-commander.spec.ts` driving these commands through `CommandTestFactory`.
 */
@Module({
  providers: [LogService, BasicCommand, MathCommand, AddCommand],
})
export class CliModule {}
