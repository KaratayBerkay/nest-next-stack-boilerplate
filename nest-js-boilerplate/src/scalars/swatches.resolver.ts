import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Color } from './color';
import { Swatch } from './models/swatch.model';

const SAMPLE_DATE = new Date('2026-06-23T10:00:00.000Z');

@Resolver(() => Swatch)
export class SwatchesResolver {
  // Read path: exercises serialize() for every scalar (Color -> hex, JSON object passes
  // through, Date -> ISO-8601 string).
  @Query(() => Swatch, { name: 'swatch' })
  swatch(): Swatch {
    return {
      id: 1,
      color: new Color(0x1a, 0x2b, 0x3c),
      metadata: { tags: ['brand', 'primary'], score: 9.5 },
      createdAt: SAMPLE_DATE,
    };
  }

  // Write path: the `color` arg is parsed into a real Color instance (parseValue for
  // variables, parseLiteral for inline literals). We mutate the instance and serialize it
  // back, so the round-tripped hex proves the value truly became a Color server-side.
  @Mutation(() => Swatch)
  lighten(
    @Args('color', { type: () => Color }) color: Color,
    @Args('amount', { type: () => Int, defaultValue: 16 }) amount: number,
  ): Swatch {
    const lighter = new Color(
      color.r + amount,
      color.g + amount,
      color.b + amount,
    );
    return {
      id: 2,
      color: lighter,
      metadata: { from: color.toHex(), amount },
      createdAt: SAMPLE_DATE,
    };
  }
}
