import { describe, it, expect, beforeAll } from 'vitest';
import {
  importKeyFromBase64,
  decryptObject,
  encryptObject,
  generateSalt,
  deriveKey
} from './crypto';
import { webcrypto } from 'crypto';

describe('Crypto module', () => {
  beforeAll(() => {
    if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
      Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
      });
    }
  });

  describe('importKeyFromBase64', () => {
    it('successfully imports a valid base64 key', async () => {
      const validBase64Key = '0RGoNs9kNzJa3LLq+i/hoUbA39sfrGJs5YpYj7vRYa4=';
      const key = await importKeyFromBase64(validBase64Key);
      expect(key).toBeDefined();
      expect(key.type).toBe('secret');
      expect(key.algorithm.name).toBe('AES-GCM');
      expect(key.usages).toContain('encrypt');
      expect(key.usages).toContain('decrypt');
    });

    it('throws an error for invalid base64 string', async () => {
      const invalidBase64 = 'invalid-base64-string!@#';
      await expect(importKeyFromBase64(invalidBase64)).rejects.toThrow();
    });

    it('throws an error for incorrect key length', async () => {
      const shortBase64 = btoa('test');
      await expect(importKeyFromBase64(shortBase64)).rejects.toThrow();
    });
  });

  describe('decryptObject', () => {
    let key: CryptoKey;

    beforeAll(async () => {
      const salt = generateSalt();
      key = await deriveKey('password', salt);
    });

    it('successfully decrypts an encrypted object (happy path)', async () => {
      const data = { message: 'hello world', nested: { value: 42 } };
      const encrypted = await encryptObject(data, key);
      const decrypted = await decryptObject(encrypted, key);
      expect(decrypted).toEqual(data);
    });

    it('successfully decrypts a legacy unencrypted base64 string (fallback path)', async () => {
      const data = { legacy: 'data' };
      // Simulate legacy data: just JSON.stringify then btoa
      const legacyString = btoa(JSON.stringify(data));
      const decrypted = await decryptObject(legacyString, key);
      expect(decrypted).toEqual(data);
    });

    it('returns null for invalid data that cannot be decrypted or parsed (error path)', async () => {
      // Invalid base64 that atob fails on
      const invalidBase64 = '!!!not-base64!!!';
      const result1 = await decryptObject(invalidBase64, key);
      expect(result1).toBeNull();

      // Valid base64 but not JSON
      const notJsonBase64 = btoa('just a string, not json');
      const result2 = await decryptObject(notJsonBase64, key);
      expect(result2).toBeNull();
    });

    it('returns null if decryption fails with wrong key', async () => {
      const data = { secret: 'top secret' };
      const encrypted = await encryptObject(data, key);

      const otherSalt = generateSalt();
      const otherKey = await deriveKey('wrong-password', otherSalt);

      const result = await decryptObject(encrypted, otherKey);
      // Decrypt fails -> enters catch -> try atob/JSON.parse -> fails because encrypted is {iv, ct} -> returns null
      expect(result).toBeNull();
    });
  });
});
