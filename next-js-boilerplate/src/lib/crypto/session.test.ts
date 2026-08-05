import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { x25519 } from "@noble/curves/ed25519.js";
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import {
  performHandshake,
  encryptForServer,
  decryptFromServer,
  type WireEnvelopeV2,
} from "./session";
import { storeKeys, clearDeviceToken } from "./device-storage";

const WIRE_CRYPTO_CONTEXT = "session-crypto-v1";
const TOKEN = "tok-1";

function deviceHashOf(token: string): string {
  return bytesToHex(sha256(new TextEncoder().encode(token)));
}

function buildAad(context: string, direction: string, seq: number): string {
  return `${WIRE_CRYPTO_CONTEXT}|${context}|${direction}|${seq}`;
}

// Derive the shared key the same way the browser does after the handshake,
// using the client keypair persisted to localStorage by performHandshake.
function sharedKeyAfterHandshake(clientPrivHex: string, serverPubHex: string) {
  const shared = x25519.getSharedSecret(
    hexToBytes(clientPrivHex),
    hexToBytes(serverPubHex),
  );
  return hkdf(
    sha256,
    shared,
    new Uint8Array(0),
    new TextEncoder().encode(`${WIRE_CRYPTO_CONTEXT}:${deviceHashOf(TOKEN)}`),
    32,
  );
}

function decryptEnvelope(
  key: Uint8Array,
  aad: string,
  envelope: { nonce: string; ct: string },
): unknown {
  const cipher = xchacha20poly1305(
    key,
    Uint8Array.from(atob(envelope.nonce), (c) => c.charCodeAt(0)),
    new TextEncoder().encode(aad),
  );
  const plain = cipher.decrypt(
    Uint8Array.from(atob(envelope.ct), (c) => c.charCodeAt(0)),
  );
  return JSON.parse(new TextDecoder().decode(plain));
}

function encryptEnvelope(
  key: Uint8Array,
  aad: string,
  payload: unknown,
): WireEnvelopeV2 {
  const nonce = crypto.getRandomValues(new Uint8Array(24));
  const cipher = xchacha20poly1305(key, nonce, new TextEncoder().encode(aad));
  const ct = cipher.encrypt(new TextEncoder().encode(JSON.stringify(payload)));
  return {
    v: 2,
    nonce: btoa(String.fromCharCode(...nonce)),
    ct: btoa(String.fromCharCode(...ct)),
  };
}

const serverPriv = x25519.utils.randomSecretKey();
const serverPubHex = bytesToHex(x25519.getPublicKey(serverPriv));

let fetchMock: ReturnType<typeof vi.fn>;

function stubHandshake(c2sSeq: number, s2cSeq: number) {
  fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      serverPublicKey: serverPubHex,
      ok: true,
      device: true,
      c2sSeq,
      s2cSeq,
    }),
  });
  vi.stubGlobal("fetch", fetchMock);
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  clearDeviceToken();
});

describe("wire-crypto seq adoption on handshake", () => {
  it("adopts the server c2s counter exactly when the client ran AHEAD (lost frames)", async () => {
    localStorage.setItem("crypto:device-token", JSON.stringify(TOKEN));
    // Client believes it sent 9 frames; the server only ever counted 5 —
    // frames 6..9 were lost in transit (a deploy killed the socket).
    // Pre-fix Math.max() kept sendSeq at 9 and deadlocked every later frame.
    const aheadPriv = x25519.utils.randomSecretKey();
    await storeKeys(TOKEN, {
      clientPrivKey: bytesToHex(aheadPriv),
      clientPubKey: bytesToHex(x25519.getPublicKey(aheadPriv)),
      sendSeq: 9,
      recvSeq: 2,
    });
    stubHandshake(5, 6);

    await performHandshake("sid-1");

    const stored = JSON.parse(
      localStorage.getItem(`crypto:keys:${TOKEN}`)!,
    ) as {
      clientPrivKey: string;
    };
    const key = sharedKeyAfterHandshake(stored.clientPrivKey, serverPubHex);

    // Exact adoption → sendSeq 5 → this frame MUST be seq 6.
    const envelope = encryptForServer({
      type: "room-message",
      text: "hello",
    });
    expect(
      decryptEnvelope(key, buildAad(deviceHashOf(TOKEN), "c2s", 6), envelope),
    ).toEqual({ type: "room-message", text: "hello" });

    // recvSeq also adopts exactly: a server s2c frame at seq 7 decrypts.
    const serverFrame = encryptEnvelope(
      key,
      buildAad(deviceHashOf(TOKEN), "s2c", 7),
      { type: "room-message", text: "from-server" },
    );
    expect(decryptFromServer(serverFrame)).toEqual({
      type: "room-message",
      text: "from-server",
    });
  });

  it("adopts the server c2s counter exactly when the client is BEHIND (multi-tab)", async () => {
    localStorage.setItem("crypto:device-token", JSON.stringify(TOKEN));
    // Another tab advanced the server counter to 5; this tab only sent 2.
    const behindPriv = x25519.utils.randomSecretKey();
    await storeKeys(TOKEN, {
      clientPrivKey: bytesToHex(behindPriv),
      clientPubKey: bytesToHex(x25519.getPublicKey(behindPriv)),
      sendSeq: 2,
      recvSeq: 1,
    });
    stubHandshake(5, 6);

    await performHandshake("sid-1");

    const stored = JSON.parse(
      localStorage.getItem(`crypto:keys:${TOKEN}`)!,
    ) as {
      clientPrivKey: string;
    };
    const key = sharedKeyAfterHandshake(stored.clientPrivKey, serverPubHex);

    const envelope = encryptForServer({ type: "room-message", text: "hi" });
    expect(
      decryptEnvelope(key, buildAad(deviceHashOf(TOKEN), "c2s", 6), envelope),
    ).toEqual({ type: "room-message", text: "hi" });
  });

  it("starts at seq 1 on a first-ever handshake (server counter 0)", async () => {
    localStorage.setItem("crypto:device-token", JSON.stringify(TOKEN));
    stubHandshake(0, 0);

    await performHandshake("sid-1");

    const stored = JSON.parse(
      localStorage.getItem(`crypto:keys:${TOKEN}`)!,
    ) as {
      clientPrivKey: string;
    };
    const key = sharedKeyAfterHandshake(stored.clientPrivKey, serverPubHex);

    const envelope = encryptForServer({ type: "room-message", text: "first" });
    expect(
      decryptEnvelope(key, buildAad(deviceHashOf(TOKEN), "c2s", 1), envelope),
    ).toEqual({ type: "room-message", text: "first" });
  });
});
