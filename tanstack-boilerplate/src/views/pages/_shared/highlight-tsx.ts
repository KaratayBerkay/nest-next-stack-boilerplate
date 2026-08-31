/**
 * Minimal, dependency-free TSX tokenizer for the template browser's code
 * view. Not a grammar — just enough token classes (comments, strings,
 * keywords, numbers) to make source readable, styled via theme tokens.
 */

export type TsxTokenType =
  "comment" | "string" | "keyword" | "number" | "plain";

export interface TsxToken {
  type: TsxTokenType;
  text: string;
}

const KEYWORDS =
  "import|export|from|const|let|var|function|return|if|else|for|while|" +
  "switch|case|break|continue|new|typeof|interface|type|extends|implements|" +
  "class|default|async|await|try|catch|finally|throw|in|of|as|satisfies|" +
  "readonly|enum|null|undefined|true|false|this|void|delete|instanceof|" +
  "keyof|never|unknown|string|number|boolean";

const TOKEN_RE = new RegExp(
  // 1: comments (block or line)
  "(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)" +
    // 2: strings (double, single, or template literal)
    "|(\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*'|`(?:[^`\\\\]|\\\\[\\s\\S])*`)" +
    // 3: keywords
    `|\\b(${KEYWORDS})\\b` +
    // 4: numbers
    "|(\\b\\d[\\d_]*(?:\\.[\\d_]+)?\\b)",
  "g",
);

export function tokenizeTsx(code: string): TsxToken[] {
  const tokens: TsxToken[] = [];
  let lastIndex = 0;
  for (const match of code.matchAll(TOKEN_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ type: "plain", text: code.slice(lastIndex, index) });
    }
    const type: TsxTokenType = match[1]
      ? "comment"
      : match[2]
        ? "string"
        : match[3]
          ? "keyword"
          : "number";
    tokens.push({ type, text: match[0] });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < code.length) {
    tokens.push({ type: "plain", text: code.slice(lastIndex) });
  }
  return tokens;
}

export const TSX_TOKEN_CLASSES: Record<TsxTokenType, string> = {
  comment: "text-muted italic",
  string: "text-success",
  keyword: "text-brand",
  number: "text-warning",
  plain: "",
};
