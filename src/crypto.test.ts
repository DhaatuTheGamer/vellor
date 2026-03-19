import { describe, it, expect } from 'vitest';
import { decryptObject, deriveKey, generateSalt } from './crypto';

describe('decryptObject fallback tests', () => {
  it('should fallback to decodeURIComponent(escape(atob())) for old encoded data', async () => {
    const salt = generateSalt();
    const key = await deriveKey('test-password', salt);

    const obj = { message: 'hello world', emoji: '👋' };
    const oldEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(obj))));

    const result = await decryptObject(oldEncoded, key);
    expect(result).toEqual(obj);
  });

  it('should fallback to raw JSON string', async () => {
    const salt = generateSalt();
    const key = await deriveKey('test-password', salt);

    const obj = { data: 'legacy data' };
    const rawJson = JSON.stringify(obj);

    const result = await decryptObject(rawJson, key);
    expect(result).toEqual(obj);
  });

  it('should return null for empty string', async () => {
    const salt = generateSalt();
    const key = await deriveKey('test-password', salt);

    const result = await decryptObject('', key);
    expect(result).toBeNull();
  });
});
