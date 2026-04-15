import { describe, it, expect, beforeEach } from 'vitest';
import { deriveKey, generateSalt, encryptObject, decryptObject, exportKeyToBase64, importKeyFromBase64 } from '../../src/crypto';

describe('crypto utilities', () => {
  // Ensure webcrypto is available in the test environment (e.g., jsdom or node)
  beforeEach(async () => {
    if (typeof globalThis.crypto === 'undefined') {
      const { webcrypto } = await import('crypto');
      // @ts-ignore
      globalThis.crypto = webcrypto;
    }
  });

  describe('deriveKey', () => {
    it('generates a valid CryptoKey from a password', async () => {
      const salt = generateSalt();
      const key = await deriveKey('my-strong-password', salt);
      expect(key).toBeInstanceOf(CryptoKey);
      expect(key.algorithm.name).toBe('AES-GCM');
      expect(salt.byteLength).toBe(16);
    });

    it('generates reproducible keys with the same password and salt', async () => {
      const salt = generateSalt();
      const key1 = await deriveKey('password123', salt);
      const key2 = await deriveKey('password123', salt);

      const exported1 = await crypto.subtle.exportKey('raw', key1);
      const exported2 = await crypto.subtle.exportKey('raw', key2);

      expect(new Uint8Array(exported1)).toEqual(new Uint8Array(exported2));
    });

    it('generates different keys for different passwords with the same salt', async () => {
      const salt = generateSalt();
      const key1 = await deriveKey('password123', salt);
      const key2 = await deriveKey('different-password', salt);

      const exported1 = await crypto.subtle.exportKey('raw', key1);
      const exported2 = await crypto.subtle.exportKey('raw', key2);

      expect(new Uint8Array(exported1)).not.toEqual(new Uint8Array(exported2));
    });
  });

  describe('encryptObject and decryptObject', () => {
    let key: CryptoKey;

    beforeEach(async () => {
      const salt = generateSalt();
      key = await deriveKey('test-password', salt);
    });

    it('successfully encrypts and decrypts an object', async () => {
      const data = { message: 'Hello World', count: 42, nested: { test: true } };

      const encryptedData = await encryptObject(data, key);
      expect(encryptedData).toBeTypeOf('string');
      
      const parsedIvAndCt = JSON.parse(atob(encryptedData));
      expect(parsedIvAndCt).toHaveProperty('iv');
      expect(parsedIvAndCt).toHaveProperty('ct');

      const decryptedData = await decryptObject(encryptedData, key);

      expect(decryptedData).toEqual(data);
    });

    it('throws an error when decrypting with the wrong key', async () => {
      const data = { secret: 'data' };
      const encryptedData = await encryptObject(data, key);

      const wrongSalt = generateSalt();
      const wrongKey = await deriveKey('wrong-password', wrongSalt);

      await expect(decryptObject(encryptedData, wrongKey)).rejects.toThrow();
    });

    it('throws an error when input data is tampered with', async () => {
      const data = { secret: 'data' };
      const encryptedData = await encryptObject(data, key);

      // Tamper with the base64 string predictably
      const tamperedData = encryptedData.substring(0, 10) + 'A' + encryptedData.substring(11);

      await expect(decryptObject(tamperedData, key)).rejects.toThrow();
    });
  });

  describe('exportKeyToBase64 and importKeyFromBase64', () => {
    it('successfully exports and imports a CryptoKey', async () => {
       const salt = generateSalt();
       const key = await deriveKey('export-test', salt);
       
       const exportedKeyString = await exportKeyToBase64(key);
       expect(typeof exportedKeyString).toBe('string');
       expect(exportedKeyString.length).toBeGreaterThan(0);

       const importedKey = await importKeyFromBase64(exportedKeyString);
       expect(importedKey).toBeInstanceOf(CryptoKey);
       expect(importedKey.algorithm.name).toBe('AES-GCM');
    });

    it('imported key can decrypt data encrypted by original key', async () => {
        const salt = generateSalt();
        const key = await deriveKey('export-test-2', salt);
        const data = { sensitive: 'info' };

        const encrypted = await encryptObject(data, key);
        
        const exportedKeyString = await exportKeyToBase64(key);
        const importedKey = await importKeyFromBase64(exportedKeyString);

        const decryptedData = await decryptObject(encrypted, importedKey);
        expect(decryptedData).toEqual(data);
    });
  });
});
