import { Injectable } from '@nestjs/common';

// A plain singleton provider retrieved via ModuleRef#get().
@Injectable()
export class SingletonTool {
  name(): string {
    return 'tool';
  }
}
