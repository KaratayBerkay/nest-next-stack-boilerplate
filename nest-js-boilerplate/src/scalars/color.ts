// A tiny value object that backs the custom `Color` GraphQL scalar. Over the wire a color
// is a "#rrggbb" hex string; inside resolvers it's a structured Color instance. Keeping the
// (de)serialization here makes the scalar itself a thin adapter.
export class Color {
  constructor(
    readonly r: number,
    readonly g: number,
    readonly b: number,
  ) {}

  static fromHex(hex: string): Color {
    const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
    if (!match) {
      throw new Error(`Invalid color: expected "#rrggbb" hex, got ${hex}`);
    }
    return new Color(
      parseInt(match[1], 16),
      parseInt(match[2], 16),
      parseInt(match[3], 16),
    );
  }

  toHex(): string {
    const channel = (n: number) =>
      Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
    return `#${channel(this.r)}${channel(this.g)}${channel(this.b)}`;
  }
}
