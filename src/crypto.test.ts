import { describe, it, expect, beforeAll } from 'vitest';
import { encryptObject, decryptObject, deriveKey, generateSalt } from './crypto';

describe('crypto utilities', () => {
  let testKey: CryptoKey;

  beforeAll(async () => {
    // Generate a test key using deriveKey as would be done in the app
    const salt = generateSalt();
    testKey = await deriveKey('test-password', salt);
  });

  describe('encryptObject', () => {
    it('encrypts an object to a valid base64 string containing iv and ct', async () => {
      const testObj = { message: 'secret data', count: 42 };

      const encryptedBase64 = await encryptObject(testObj, testKey);

      // Basic checks on the returned string
      expect(typeof encryptedBase64).toBe('string');
      expect(encryptedBase64.length).toBeGreaterThan(0);

      // It should be valid base64
      let decodedJson: string;
      try {
        decodedJson = atob(encryptedBase64);
      } catch (e) {
        throw new Error('Result is not valid base64');
      }

      // It should parse to a JSON object
      let parsedObj: any;
      try {
        parsedObj = JSON.parse(decodedJson);
      } catch (e) {
        throw new Error('Decoded base64 is not valid JSON');
      }

      // It should contain 'iv' and 'ct' arrays
      expect(parsedObj).toHaveProperty('iv');
      expect(Array.isArray(parsedObj.iv)).toBe(true);
      expect(parsedObj.iv.length).toBe(12); // AES-GCM IV is 12 bytes

      expect(parsedObj).toHaveProperty('ct');
      expect(Array.isArray(parsedObj.ct)).toBe(true);
      expect(parsedObj.ct.length).toBeGreaterThan(0);

      // The decrypted result should match the original object
      const decryptedObj = await decryptObject(encryptedBase64, testKey);
      expect(decryptedObj).toEqual(testObj);
    });

    it('encrypts different objects to different ciphertexts even with same key', async () => {
      const testObj = { data: 'test' };

      const encrypted1 = await encryptObject(testObj, testKey);
      const encrypted2 = await encryptObject(testObj, testKey);

      // Because IV is random, the same object should result in different encrypted strings
      expect(encrypted1).not.toBe(encrypted2);

      // Both should decrypt correctly
      const decrypted1 = await decryptObject(encrypted1, testKey);
      const decrypted2 = await decryptObject(encrypted2, testKey);

      expect(decrypted1).toEqual(testObj);
      expect(decrypted2).toEqual(testObj);
    });
  });
});
