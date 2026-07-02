import {
  BeforeApplicationShutdown,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

// One provider implementing every Nest lifecycle hook, recording the order in which they fire.
// The docs promise a fixed sequence:
//   bootstrap:   onModuleInit -> onApplicationBootstrap
//   termination: onModuleDestroy -> beforeApplicationShutdown -> onApplicationShutdown
// The spec asserts exactly that order and that shutdown hooks receive the signal argument.
@Injectable()
export class LifecycleService
  implements
    OnModuleInit,
    OnApplicationBootstrap,
    OnModuleDestroy,
    BeforeApplicationShutdown,
    OnApplicationShutdown
{
  readonly events: string[] = [];
  private signal?: string;

  onModuleInit(): void {
    this.events.push('onModuleInit');
  }

  onApplicationBootstrap(): void {
    this.events.push('onApplicationBootstrap');
  }

  onModuleDestroy(): void {
    this.events.push('onModuleDestroy');
  }

  beforeApplicationShutdown(signal?: string): void {
    this.events.push('beforeApplicationShutdown');
    this.signal = signal;
  }

  onApplicationShutdown(signal?: string): void {
    this.events.push('onApplicationShutdown');
    this.signal = signal;
  }

  // The signal (e.g. 'SIGTERM') captured by the shutdown hooks, if any.
  getSignal(): string | undefined {
    return this.signal;
  }
}
