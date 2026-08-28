import { describe, expect, it } from "vitest";
import {
  extractLinks,
  isSafeExternalUrl,
  MAX_LINK_CARDS,
} from "./link-preview";

describe("isSafeExternalUrl", () => {
  it("allows plain https URLs on public domains", () => {
    expect(isSafeExternalUrl("https://example.com")).toBe(true);
    expect(isSafeExternalUrl("https://docs.example.co.uk/path?q=1#frag")).toBe(
      true,
    );
    expect(isSafeExternalUrl("https://xn--bcher-kva.ch/x")).toBe(true);
  });

  it("rejects non-https schemes", () => {
    expect(isSafeExternalUrl("http://example.com")).toBe(false);
    expect(isSafeExternalUrl("ftp://example.com")).toBe(false);
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("not a url")).toBe(false);
  });

  it("rejects localhost and bare intranet hostnames", () => {
    expect(isSafeExternalUrl("https://localhost")).toBe(false);
    expect(isSafeExternalUrl("https://localhost:3000")).toBe(false);
    expect(isSafeExternalUrl("https://foo.localhost")).toBe(false);
    expect(isSafeExternalUrl("https://intranet-server")).toBe(false);
  });

  it("rejects explicit ports even on public domains", () => {
    expect(isSafeExternalUrl("https://example.com:8443/x")).toBe(false);
    // The parser strips a default :443, so that stays allowed.
    expect(isSafeExternalUrl("https://example.com:443/x")).toBe(true);
  });

  it("rejects IP literals", () => {
    expect(isSafeExternalUrl("https://192.168.1.10/admin")).toBe(false);
    expect(isSafeExternalUrl("https://[::1]/")).toBe(false);
  });

  it("rejects embedded credentials — the trusted.com@evil.io phishing shape", () => {
    expect(isSafeExternalUrl("https://trusted.com@evil.io/login")).toBe(false);
    expect(isSafeExternalUrl("https://user:pass@example.com")).toBe(false);
  });

  it("rejects reserved / internal TLDs and malformed hosts", () => {
    expect(isSafeExternalUrl("https://printer.local")).toBe(false);
    expect(isSafeExternalUrl("https://build.internal")).toBe(false);
    expect(isSafeExternalUrl("https://wiki.corp")).toBe(false);
    expect(isSafeExternalUrl("https://hidden.onion")).toBe(false);
    expect(isSafeExternalUrl("https://a..com")).toBe(false);
    expect(isSafeExternalUrl("https://example.com.")).toBe(false);
    expect(isSafeExternalUrl("https://weird.c0m")).toBe(false);
  });
});

describe("extractLinks", () => {
  it("finds URLs inside prose and classifies them", () => {
    const links = extractLinks(
      "check https://example.com/a and also http://legacy.example.com",
    );
    expect(links).toEqual([
      { url: "https://example.com/a", clickable: true },
      { url: "http://legacy.example.com", clickable: false },
    ]);
  });

  it("trims trailing sentence punctuation but keeps balanced parens", () => {
    expect(extractLinks("see https://example.com/a.")[0].url).toBe(
      "https://example.com/a",
    );
    expect(extractLinks("(see https://example.com/a)")[0].url).toBe(
      "https://example.com/a",
    );
    expect(extractLinks("https://en.example.org/wiki/Foo_(bar)")[0].url).toBe(
      "https://en.example.org/wiki/Foo_(bar)",
    );
  });

  it("dedupes repeats and caps the number of cards", () => {
    expect(
      extractLinks("https://example.com https://example.com"),
    ).toHaveLength(1);
    const many = Array.from(
      { length: 6 },
      (_, i) => `https://example${i}.com`,
    ).join(" ");
    expect(extractLinks(many)).toHaveLength(MAX_LINK_CARDS);
  });

  it("returns nothing for plain text", () => {
    expect(extractLinks("no links here, just words.")).toEqual([]);
  });
});
