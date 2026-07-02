import { Injectable } from '@nestjs/common';
import { Hero } from './hero.model';
import type { HeroView } from './hero.model';

/**
 * In-memory aggregate store. It keeps only persisted *state* and rebuilds a fresh `Hero`
 * (empty uncommitted-event buffer) on every `findOneById` — exactly what a DB-backed repo does
 * implicitly. Returning a fresh instance per command is what keeps a saga-triggered follow-up
 * command from re-publishing the originating command's still-in-flight events (see Hero docs).
 */
@Injectable()
export class HeroRepository {
  private readonly state = new Map<string, HeroView>();

  findOneById(id: string): Hero {
    return new Hero(id, this.state.get(id));
  }

  persist(hero: Hero): void {
    this.state.set(hero.id, hero.toView());
  }
}
