import { Test } from '@nestjs/testing';
import { AggregateModule } from './aggregate.module';
import { ConsumerModule } from './consumer.module';
import { ConsumerService } from './consumer.service';
import { GlobalConfigModule } from './global-config.module';
import { GreetingModule } from './greeting.module';
import { GreetingService } from './greeting.service';
import { NeedsConfigModule } from './needs-config.module';
import { NeedsConfigService } from './needs-config.service';

// Proves the documented module wiring actually holds at runtime.
describe('Modules', () => {
  it('feature + shared module: a consumer uses a provider exported by an imported module', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConsumerModule],
    }).compile();

    expect(moduleRef.get(ConsumerService).welcome('Ada')).toBe('Hello, Ada!');
  });

  it('shared modules are singletons: all importers share one GreetingService instance', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GreetingModule, ConsumerModule],
    }).compile();

    const greeting = moduleRef.get(GreetingService);
    const consumer = moduleRef.get(ConsumerService);

    consumer.welcome('Ada'); // +1 via ConsumerModule's reference
    consumer.welcome('Lin'); // +1
    greeting.greet('Bo'); //    +1 via the direct reference

    // If the instance weren't shared, the direct ref's counter would be 1, not 3.
    expect(greeting.callCount()).toBe(3);
  });

  it('re-export: importing AggregateModule exposes GreetingModule transitively', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AggregateModule],
    }).compile();

    expect(moduleRef.get(GreetingService).greet('Zed')).toBe('Hello, Zed!');
  });

  it('module class can resolve its own provider', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GreetingModule],
    }).compile();

    expect(moduleRef.get(GreetingModule).selfCheck()).toBe(true);
  });

  it('@Global module: a provider is injectable without importing the global module', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GlobalConfigModule, NeedsConfigModule], // NeedsConfigModule does NOT import the global one
    }).compile();

    expect(moduleRef.get(NeedsConfigService).appName()).toBe(
      'nest-boilerplate',
    );
  });
});
