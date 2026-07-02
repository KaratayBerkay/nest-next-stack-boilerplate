import { Injectable } from '@nestjs/common';
import { SingletonTool } from './singleton-tool.service';

// Deliberately NOT listed in any module's providers — ModuleRef#create() instantiates it on
// demand, still resolving its constructor dependencies from the container.
@Injectable()
export class UnregisteredFactory {
  constructor(private readonly tool: SingletonTool) {}

  build(): string {
    return `factory-using-${this.tool.name()}`;
  }
}
