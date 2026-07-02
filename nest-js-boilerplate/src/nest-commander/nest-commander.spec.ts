import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import type { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { CliModule } from './cli.module';
import { LogService } from './log.service';

// Proves nest-commander (#117). The documented Testing section uses `CommandTestFactory` (a thin
// wrapper over `Test.createTestingModule`): it builds the CLI's Nest context, lets us
// `.overrideProvider(LogService)` with a Jest mock, and `CommandTestFactory.run(app, argv)` parses
// the args through commander and dispatches to the matched command's `run`. Asserting the mock's
// calls proves @Option parsers, positional params, command routing and @SubCommand — without
// scraping stdout. A final subprocess test drives the *real* `CommandFactory.run` entrypoint
// (`cli.ts`) to prove bootstrap + the auto `--help`.
describe('nest-commander (#117)', () => {
  let logService: { log: jest.Mock };

  const buildApp = async (): Promise<TestingModule> => {
    logService = { log: jest.fn() };
    return CommandTestFactory.createTestingCommand({ imports: [CliModule] })
      .overrideProvider(LogService)
      .useValue(logService)
      .compile();
  };

  describe('BasicCommand @Option parsers + routing', () => {
    it('runs the --number path: parseNumber maps the value and positional params survive', async () => {
      const app = await buildApp();

      await CommandTestFactory.run(app, ['basic', '--number', '5', 'extra']);

      expect(logService.log).toHaveBeenCalledTimes(1);
      expect(logService.log).toHaveBeenCalledWith({
        param: ['extra'],
        number: 5,
      });
    });

    it('runs the --string path via the short -s flag', async () => {
      const app = await buildApp();

      await CommandTestFactory.run(app, ['basic', '-s', 'hello']);

      expect(logService.log).toHaveBeenCalledWith({
        param: [],
        string: 'hello',
      });
    });

    it('runs the --boolean path: parseBoolean (JSON.parse) yields a real boolean', async () => {
      const app = await buildApp();

      await CommandTestFactory.run(app, ['basic', '--boolean', 'true']);

      expect(logService.log).toHaveBeenCalledWith({ param: [], boolean: true });
    });

    it('falls through to runWithNone when no option is given', async () => {
      const app = await buildApp();

      await CommandTestFactory.run(app, ['basic']);

      expect(logService.log).toHaveBeenCalledWith({ param: [] });
    });
  });

  describe('@SubCommand', () => {
    it('routes "math add 2 3 4" to AddCommand.run with the positional params', async () => {
      const app = await buildApp();

      await CommandTestFactory.run(app, ['math', 'add', '2', '3', '4']);

      expect(logService.log).toHaveBeenCalledWith({ op: 'add', sum: 9 });
    });
  });

  describe('real CommandFactory.run entrypoint (cli.ts)', () => {
    it('bootstraps the CLI and auto-registers --help listing every command', () => {
      const out = execFileSync(
        process.execPath,
        ['-r', 'ts-node/register', join(__dirname, 'cli.ts'), '--help'],
        { encoding: 'utf8' },
      );

      expect(out).toContain('basic [options]');
      expect(out).toContain('math');
      expect(out).toContain('display help for command');
    });
  });
});
