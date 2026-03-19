import { describe, it, expect } from 'vitest';
import { exportKeyToBase64 } from './crypto';

describe('crypto utilities', () => {
  describe('exportKeyToBase64', () => {
    it('should export a CryptoKey to a base64 string', async () => {
      // 1. Create a raw key buffer (32 bytes for AES-256)
      const rawKey = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        rawKey[i] = i;
      }

      // 2. Import the raw buffer into a CryptoKey object
      // We must use 'extractable: true' so that exportKeyToBase64 can export it.
      const key = await crypto.subtle.importKey(
        "raw",
        rawKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      // 3. Export the key using the function under test
      const base64Str = await exportKeyToBase64(key);

      // 4. Verify the output is the expected base64 encoding of our known rawKey
      // Our known rawKey has bytes 0, 1, 2, ..., 31.
      // We previously verified that base64 encoding of this buffer is AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=
      expect(base64Str).toBe("AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=");
    });

    it('should throw an error if the key is not extractable', async () => {
      const rawKey = new Uint8Array(32);

      const unextractableKey = await crypto.subtle.importKey(
        "raw",
        rawKey,
        { name: "AES-GCM", length: 256 },
        false, // NOT extractable
        ["encrypt", "decrypt"]
      );

      // Depending on the environment, exporting an unextractable key throws a DOMException or Error.
      await expect(exportKeyToBase64(unextractableKey)).rejects.toThrow();
    });
  });
});
