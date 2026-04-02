import { describe, it, expect, beforeAll } from 'vitest';
import { importKeyFromBase64, encryptObject, decryptObject, deriveKey, generateSalt } from './crypto';

// Polyfill for crypto.subtle in jsdom environment if needed, but vitest globals=true with jsdom usually provides it, or we can use Node's crypto
import { webcrypto } from 'crypto';

describe('generateSalt', () => {
  beforeAll(() => {
    // Ensure crypto is available in the test environment
    if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
      Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
      });
    }
  });

  it('returns a Uint8Array of length 16', () => {
    const salt = generateSalt();
    expect(salt).toBeInstanceOf(Uint8Array);
    expect(salt.length).toBe(16);
  });

  it('generates random values on subsequent calls', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();

    // They shouldn't be exactly the same
    expect(salt1).not.toEqual(salt2);
  });
});

describe('importKeyFromBase64', () => {
  beforeAll(() => {
    // Ensure crypto is available in the test environment (jsdom might not have it fully implemented)
    if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
      Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
      });
    }
  });

  it('successfully imports a valid base64 key', async () => {
    // A pre-generated 256-bit AES-GCM key exported to raw, then base64 encoded
    const validBase64Key = '0RGoNs9kNzJa3LLq+i/hoUbA39sfrGJs5YpYj7vRYa4=';

    const key = await importKeyFromBase64(validBase64Key);

    expect(key).toBeDefined();
    expect(key.type).toBe('secret');
    expect(key.algorithm.name).toBe('AES-GCM');

    // Check usages
    expect(key.usages).toContain('encrypt');
    expect(key.usages).toContain('decrypt');
  });

  it('throws an error for invalid base64 string', async () => {
    // This is not valid base64
    const invalidBase64 = 'invalid-base64-string!@#';

    // atob should throw DOMException
    await expect(importKeyFromBase64(invalidBase64)).rejects.toThrow();
  });

  it('throws an error for incorrect key length', async () => {
    // Valid base64, but not 256 bits (32 bytes). This is just 4 bytes "test".
    const shortBase64 = btoa('test');

    // importKey should throw when expecting a 256-bit AES key but given different length
    await expect(importKeyFromBase64(shortBase64)).rejects.toThrow();
  });
});

describe('encryptObject and decryptObject', () => {
  let testKey: CryptoKey;

  beforeAll(async () => {
    // Ensure crypto is available in the test environment
    if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
      Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
      });
    }

    const salt = generateSalt();
    testKey = await deriveKey('test-password', salt);
  });

  it('successfully encrypts and decrypts a simple object', async () => {
    const originalObject = { foo: 'bar', num: 42 };

    const encrypted = await encryptObject(originalObject, testKey);
    expect(typeof encrypted).toBe('string');
    expect(encrypted.length).toBeGreaterThan(0);

    const decrypted = await decryptObject(encrypted, testKey);
    expect(decrypted).toEqual(originalObject);
  });

  it('correctly handles Uint8Array using replacer logic', async () => {
    const originalObject = {
      data: new Uint8Array([1, 2, 3, 4, 5])
    };

    const encrypted = await encryptObject(originalObject, testKey);
    const decrypted = await decryptObject(encrypted, testKey);

    // During encryption, the replacer logic transforms Uint8Array into an object:
    // { dataType: 'Uint8Array', value: Array.from(value) }
    // When decrypting, this structure is maintained since we don't have a reviver for it
    expect(decrypted).toEqual({
      data: {
        dataType: 'Uint8Array',
        value: [1, 2, 3, 4, 5]
      }
    });
  });

  it('successfully encrypts and decrypts a complex object', async () => {
    const originalObject = {
      foo: 'bar',
      nested: {
        arr: [1, 2, 3],
        bool: true
      },
      nul: null
    };

    const encrypted = await encryptObject(originalObject, testKey);
    const decrypted = await decryptObject(encrypted, testKey);
    expect(decrypted).toEqual(originalObject);
  });

  it('throws error when decrypting with wrong key', async () => {
    const originalObject = { data: 'secret' };
    const encrypted = await encryptObject(originalObject, testKey);

    const wrongSalt = generateSalt();
    const wrongKey = await deriveKey('wrong-password', wrongSalt);

    // In src/crypto.ts:
    // catch (error) -> catch (oldError) -> throw error;
    // Decrypting with wrong key fails AES-GCM and throws "OperationError" during decrypt.
    await expect(decryptObject(encrypted, wrongKey)).rejects.toThrow();
  });

  it('throws error for invalid encrypted format', async () => {
    // Legacy reading decodes the base64, parses as JSON
    // If it's invalid base64, it throws DOMException.
    const corruptBase64 = "invalid-base64-!@#";
    await expect(decryptObject(corruptBase64, testKey)).rejects.toThrow();
  });

  it('throws error for corrupted encrypted data', async () => {
    const originalObject = { data: 'secret' };
    let encrypted = await encryptObject(originalObject, testKey);

    // Replace the ciphertext array with invalid data to cause subtle.decrypt to fail.
    // The base64 parses to JSON correctly, but it's not valid ciphertext.
    const parsed = JSON.parse(atob(encrypted));
    parsed.ct = new Array(parsed.ct.length).fill(0); // Corrupted cipher text
    const corruptedBase64 = btoa(JSON.stringify(parsed));

    await expect(decryptObject(corruptedBase64, testKey)).rejects.toThrow();
  });
});
