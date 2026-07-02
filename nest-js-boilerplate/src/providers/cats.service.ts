import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

// The docs' canonical provider: an @Injectable() class the Nest IoC container can manage and
// inject. Holds simple in-memory state so consumers have something to delegate to.
@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat): void {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
