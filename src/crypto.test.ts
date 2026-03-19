import { describe, it, expect } from 'vitest';
import {
  generateSalt,
  deriveKey,
  encryptObject,
  decryptObject,
  exportKeyToBase64,
  importKeyFromBase64
} from './crypto';

describe('crypto module', () => {
  describe('generateSalt', () => {
    it('should return a Uint8Array of length 16', () => {
      const salt = generateSalt();
      expect(salt).toBeInstanceOf(Uint8Array);
      expect(salt).toHaveLength(16);
    });

    it('should generate different salts on subsequent calls', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).not.toEqual(salt2);
    });
  });

  describe('deriveKey', () => {
    it('should derive a CryptoKey from a password and salt', async () => {
      const password = 'test-password';
      const salt = generateSalt();
      const key = await deriveKey(password, salt);
      expect(key.type).toBe('secret');
      expect(key.algorithm.name).toBe('AES-GCM');
      // AES-GCM 256 key length is 256 bits
      expect((key.algorithm as any).length).toBe(256);
      expect(key.extractable).toBe(true);
      expect(key.usages).toContain('encrypt');
      expect(key.usages).toContain('decrypt');
    });

    it('should derive the same key for the same password and salt', async () => {
      const password = 'test-password';
      const salt = new Uint8Array(16).fill(1);
      const key1 = await deriveKey(password, salt);
      const key2 = await deriveKey(password, salt);

      const exported1 = await crypto.subtle.exportKey('raw', key1);
      const exported2 = await crypto.subtle.exportKey('raw', key2);
      expect(new Uint8Array(exported1)).toEqual(new Uint8Array(exported2));
    });

    it('should derive different keys for different passwords', async () => {
      const salt = new Uint8Array(16).fill(1);
      const key1 = await deriveKey('pass1', salt);
      const key2 = await deriveKey('pass2', salt);

      const exported1 = await crypto.subtle.exportKey('raw', key1);
      const exported2 = await crypto.subtle.exportKey('raw', key2);
      expect(new Uint8Array(exported1)).not.toEqual(new Uint8Array(exported2));
    });
  });

  describe('encryption/decryption', () => {
    it('should encrypt and decrypt an object correctly', async () => {
      const password = 'test-password';
      const salt = generateSalt();
      const key = await deriveKey(password, salt);
      const originalObj = { foo: 'bar', baz: 123 };

      const encrypted = await encryptObject(originalObj, key);
      expect(typeof encrypted).toBe('string');

      const decrypted = await decryptObject(encrypted, key);
      expect(decrypted).toEqual(originalObj);
    });

    it('should fail to decrypt with the wrong key', async () => {
      const password = 'test-password';
      const salt = generateSalt();
      const key1 = await deriveKey(password, salt);
      const key2 = await deriveKey('wrong-password', salt);
      const originalObj = { foo: 'bar' };

      const encrypted = await encryptObject(originalObj, key1);

      // decryptObject has a fallback for unencrypted or old data,
      // but with a wrong key it should either return null or fail.
      // In the current implementation, it catches errors and tries fallbacks.
      const result = await decryptObject(encrypted, key2);
      expect(result).not.toEqual(originalObj);
    });
  });

  describe('key export/import', () => {
    it('should export and import a key to/from base64', async () => {
      const password = 'test-password';
      const salt = generateSalt();
      const originalKey = await deriveKey(password, salt);

      const base64 = await exportKeyToBase64(originalKey);
      expect(typeof base64).toBe('string');

      const importedKey = await importKeyFromBase64(base64);
      expect(importedKey.type).toBe('secret');
      expect(importedKey.algorithm.name).toBe('AES-GCM');

      const exportedRaw1 = await crypto.subtle.exportKey('raw', originalKey);
      const exportedRaw2 = await crypto.subtle.exportKey('raw', importedKey);
      expect(new Uint8Array(exportedRaw1)).toEqual(new Uint8Array(exportedRaw2));
    });
  });
});
