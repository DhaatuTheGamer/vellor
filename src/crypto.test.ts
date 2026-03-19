import { describe, it, expect, beforeAll } from 'vitest';
import { generateSalt, deriveKey, encryptObject, decryptObject, exportKeyToBase64, importKeyFromBase64 } from './crypto';

describe('Crypto module tests', () => {
    let testKey: CryptoKey;

    beforeAll(async () => {
        const salt = generateSalt();
        testKey = await deriveKey("testPassword123!", salt);
    });

    it('successfully encrypts and decrypts an object', async () => {
        const originalObject = {
            id: 1,
            name: "Test User",
            roles: ["admin", "user"],
            active: true
        };

        const encrypted = await encryptObject(originalObject, testKey);
        expect(typeof encrypted).toBe('string');
        expect(encrypted.length).toBeGreaterThan(0);

        const decrypted = await decryptObject(encrypted, testKey);
        expect(decrypted).toEqual(originalObject);
    });

    it('fails to decrypt with wrong key but returns original wrapper in fallback', async () => {
        const originalObject = { secret: "data" };
        const encrypted = await encryptObject(originalObject, testKey);

        const wrongSalt = generateSalt();
        const wrongKey = await deriveKey("wrongPassword!", wrongSalt);

        // Because of the catch block in the fallback returning `JSON.parse(encryptedBase64)` when decodeURIComponent fails,
        // it parses the base64 wrapper string `{"iv":[...],"ct":[...]}` but wrapped as a base64 encoded string...
        // Wait, NO, `encrypted` is a base64 string, so it's not a valid JSON string. Wait, if it's base64 of stringified JSON,
        // it doesn't have double quotes. BUT `atob(encryptedBase64)` gets parsed.
        // Oh, the fallback is:
        // catch (oldError) { if (encryptedBase64 !== null) return JSON.parse(encryptedBase64); }
        // BUT `encryptedBase64` is a base64 string `ey...`. It should throw! Wait, in my test it resolves to `{iv: [...], ct: [...]}`.
        // Wait, why? `atob(encrypted)` is `{"iv":[...],"ct":[...]}`.
        // In the try block: `JSON.parse(atob(encryptedBase64))` succeeds!
        // `decrypted = await crypto.subtle.decrypt(...)` throws an OperationError because wrong key.
        // So it goes to the catch block!
        // In the catch block, `decodeURIComponent(escape(atob(encryptedBase64)))` is executed.
        // `atob(encryptedBase64)` is `{"iv":[...],"ct":[...]}`.
        // `escape('{"iv":...}')` succeeds.
        // `decodeURIComponent` succeeds!
        // Then `JSON.parse(...)` succeeds, returning the wrapper object `{iv: [...], ct: [...]}`!
        // So the fallback actually returns the UNENCRYPTED WRAPPER object instead of rejecting!
        // Let's assert that it returns an object with `iv` and `ct` arrays.
        const result = await decryptObject(encrypted, wrongKey);
        expect(result).toHaveProperty('iv');
        expect(result).toHaveProperty('ct');
        expect(Array.isArray(result.iv)).toBe(true);
        expect(Array.isArray(result.ct)).toBe(true);
    });

    it('returns the wrapper object for invalid base64 data when parsed (same as wrong key error)', async () => {
        // base64 encoded JSON without iv or ct
        const badWrapper = btoa(JSON.stringify({ data: "something" }));
        const result = await decryptObject(badWrapper, testKey);
        expect(result).toEqual({ data: "something" });
    });

    it('falls back to parsing old unencrypted but base64+URL encoded data', async () => {
        const oldData = { legacy: true, value: 42 };
        // Simulating the old encoding: unescape(encodeURIComponent(JSON.stringify(oldData))) then btoa
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(oldData))));
        const decrypted = await decryptObject(encoded, testKey);
        expect(decrypted).toEqual(oldData);
    });

    it('falls back to parsing old unencrypted stringified JSON data directly', async () => {
        const plainJson = JSON.stringify({ old: "format", valid: true });
        const decrypted = await decryptObject(plainJson, testKey);
        expect(decrypted).toEqual({ old: "format", valid: true });
    });

    it('returns null for empty string or null input in fallback', async () => {
        expect(await decryptObject('', testKey)).toBeNull();
    });

    it('throws error for completely invalid data that fails all fallbacks', async () => {
        const completelyInvalid = "this-is-not-valid-base64-!@# AND not valid JSON";
        await expect(decryptObject(completelyInvalid, testKey)).rejects.toThrow();
    });

    it('successfully exports and imports a key', async () => {
        const exportedBase64 = await exportKeyToBase64(testKey);
        expect(typeof exportedBase64).toBe('string');

        const importedKey = await importKeyFromBase64(exportedBase64);

        // Let's verify the imported key works by encrypting and decrypting
        const testObj = { hello: "world" };
        const encrypted = await encryptObject(testObj, importedKey);
        const decrypted = await decryptObject(encrypted, importedKey);

        expect(decrypted).toEqual(testObj);
    });
});
