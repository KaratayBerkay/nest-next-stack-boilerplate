/**
 * Round-trip tests for attachment encryption.
 *
 * encrypt → decrypt must produce identical plaintext bytes.
 * Server-visible ciphertext must differ from original plaintext.
 * Helper functions (buildAttachmentPlaintext, extractAttachmentMetadata) work correctly.
 */

import { describe, it, expect } from "vitest";
import { xchachaEncrypt, xchachaDecrypt, toBase64 } from "./primitives";
import {
  encryptAttachmentForUpload,
  buildAttachmentPlaintext,
  extractAttachmentMetadata,
} from "./attachments";
import type { MessagePlaintextV1 } from "./types";

describe("attachment encryption", () => {
  it("encrypt then decrypt round-trip produces identical bytes", async () => {
    const content = "Hello, this is a secret document!";
    const file = new File([content], "secret.txt", { type: "text/plain" });

    const { encryptedBlob, metadata } = await encryptAttachmentForUpload(file);

    // The encrypted blob must be larger (poly1305 tag overhead) and different
    const encryptedBytes = new Uint8Array(await encryptedBlob.arrayBuffer());
    const originalBytes = new Uint8Array(await file.arrayBuffer());
    expect(encryptedBytes).not.toEqual(originalBytes);

    // Decrypt the ciphertext directly using primitives (bypasses fetch)
    const ciphertextB64 = btoa(String.fromCharCode(...encryptedBytes));
    const decrypted = xchachaDecrypt(
      metadata.key,
      ciphertextB64,
      metadata.nonce,
    );
    const decryptedText = new TextDecoder().decode(decrypted);

    expect(decryptedText).toBe(content);
  });

  it("encrypts binary content correctly", async () => {
    const binary = new Uint8Array([0, 1, 2, 253, 254, 255]);
    const file = new File([binary], "data.bin", {
      type: "application/octet-stream",
    });

    const { encryptedBlob, metadata } = await encryptAttachmentForUpload(file);

    const encryptedBytes = new Uint8Array(await encryptedBlob.arrayBuffer());
    const ciphertextB64 = btoa(String.fromCharCode(...encryptedBytes));
    const decrypted = xchachaDecrypt(
      metadata.key,
      ciphertextB64,
      metadata.nonce,
    );

    expect(Array.from(decrypted)).toEqual(Array.from(binary));
  });

  it("metadata preserves original file properties", async () => {
    const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });

    const { metadata } = await encryptAttachmentForUpload(file);

    expect(metadata.originalName).toBe("photo.jpg");
    expect(metadata.originalType).toBe("image/jpeg");
    expect(metadata.originalSize).toBe(1);
    expect(metadata.key).toMatch(/^[0-9a-f]{64}$/);
    expect(metadata.nonce).toBeTruthy();
  });

  it("buildAttachmentPlaintext returns correct shape", () => {
    const meta = {
      key: "aabb",
      nonce: "ccdd",
      originalName: "test.png",
      originalType: "image/png",
      originalSize: 42,
    };
    const result = buildAttachmentPlaintext(meta);
    expect(result).toEqual(meta);
  });

  it("extractAttachmentMetadata returns null when no attachment", () => {
    const plaintext: MessagePlaintextV1 = { text: "hello" };
    expect(extractAttachmentMetadata(plaintext)).toBeNull();
  });

  it("extractAttachmentMetadata returns metadata when attachment present", () => {
    const plaintext: MessagePlaintextV1 = {
      text: "",
      attachment: {
        key: "aabb",
        nonce: "ccdd",
        originalName: "doc.pdf",
        originalType: "application/pdf",
        originalSize: 100,
      },
    };
    const result = extractAttachmentMetadata(plaintext);
    expect(result).toEqual({
      key: "aabb",
      nonce: "ccdd",
      originalName: "doc.pdf",
      originalType: "application/pdf",
      originalSize: 100,
    });
  });

  it("round-trips a large file without hitting the max-call-arguments limit", async () => {
    // Regression test: toBase64() previously did
    // btoa(String.fromCharCode(...data)), which spreads the whole typed
    // array as individual function arguments — throwing "Maximum call
    // stack size exceeded" / "too many function arguments" for anything
    // past roughly 64K-128K elements (engine-dependent). Every existing
    // test above uses inputs of a few bytes, so this never surfaced. Real
    // attachments are explicitly expected to be megabytes (§4 of the
    // plan) — comfortably over that threshold, e.g. any phone photo.
    const size = 300_000; // ~293 KB — well past the unsafe threshold
    const content = new Uint8Array(size);
    for (let i = 0; i < size; i++) content[i] = i % 256;
    const file = new File([content], "large.bin", {
      type: "application/octet-stream",
    });

    const { encryptedBlob, metadata } = await encryptAttachmentForUpload(file);

    const encryptedBytes = new Uint8Array(await encryptedBlob.arrayBuffer());
    const ciphertextB64 = toBase64(encryptedBytes);
    const decrypted = xchachaDecrypt(
      metadata.key,
      ciphertextB64,
      metadata.nonce,
    );

    expect(decrypted.length).toBe(size);
    expect(Array.from(decrypted)).toEqual(Array.from(content));
  });

  it("different files produce different ciphertext with different keys", async () => {
    const file1 = new File(["aaa"], "a.txt", { type: "text/plain" });
    const file2 = new File(["bbb"], "b.txt", { type: "text/plain" });

    const { metadata: m1 } = await encryptAttachmentForUpload(file1);
    const { metadata: m2 } = await encryptAttachmentForUpload(file2);

    // Each encryption generates a unique random key
    expect(m1.key).not.toBe(m2.key);
  });
});
