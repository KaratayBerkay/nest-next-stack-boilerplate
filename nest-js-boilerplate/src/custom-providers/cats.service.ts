import { Injectable } from '@nestjs/common';

export interface Cat {
  readonly name: string;
}

// A real provider — the demo module replaces it with a structurally-compatible mock via `useValue`
// to prove value providers (the docs' "override a class with a mock" use-case).
@Injectable()
export class CatsService {
  findAll(): Cat[] {
    return [{ name: 'real' }];
  }
}
