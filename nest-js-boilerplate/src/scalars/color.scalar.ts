import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import { Color } from './color';

// Class-based custom scalar — the primary pattern from docs.nestjs.com/graphql/scalars.
// `CustomScalar<T, K>`: T is the wire type (string), K the internal type (Color). The
// `() => Color` association lets any `@Field()`/`@Args()` typed as Color use this scalar
// by inference, mirroring how the docs' DateScalar binds to the Date class.
@Scalar('Color', () => Color)
export class ColorScalar implements CustomScalar<string, Color> {
  description = 'Hex color string ("#rrggbb") parsed to a Color value object';

  // Client -> server when the value arrives as a query variable.
  parseValue(value: unknown): Color {
    if (typeof value !== 'string') {
      throw new Error('Color must be a string');
    }
    return Color.fromHex(value);
  }

  // Server -> client.
  serialize(value: unknown): string {
    if (!(value instanceof Color)) {
      throw new Error('Color scalar can only serialize Color instances');
    }
    return value.toHex();
  }

  // Client -> server when the value is inlined as a literal in the query document.
  parseLiteral(ast: ValueNode): Color {
    if (ast.kind !== Kind.STRING) {
      throw new Error('Color literal must be a string');
    }
    return Color.fromHex(ast.value);
  }
}
