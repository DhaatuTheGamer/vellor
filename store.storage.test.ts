import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageEngine, setGlobalMasterKey } from './store';
import localforage from 'localforage';
import { encryptObject, decryptObject } from './src/crypto';

// Mock localforage
vi.mock('localforage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
}));

// Mock crypto module
vi.mock('./src/crypto', () => ({
  encryptObject: vi.fn(),
  decryptObject: vi.fn()
}));

// Mock canvas-confetti to avoid issues in Node test env
vi.mock('canvas-confetti', () => ({
  default: vi.fn()
}));

describe('Custom storageEngine', () => {
  const dummyKey = {} as CryptoKey;
  const dummyObject = { test: 'data' };
  const rawString = 'raw_data_string';
  const encryptedString = 'encrypted_string';

  beforeEach(() => {
    vi.clearAllMocks();
    setGlobalMasterKey(null);
  });

  describe('getItem', () => {
    it('returns null if no raw data is returned from localforage', async () => {
      vi.mocked(localforage.getItem).mockResolvedValueOnce(null);

      const result = await storageEngine.getItem('test-key');
      expect(result).toBeNull();
      expect(localforage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('returns null if raw data exists but globalMasterKey is not set', async () => {
      vi.mocked(localforage.getItem).mockResolvedValueOnce(rawString);

      const result = await storageEngine.getItem('test-key');
      expect(result).toBeNull();
      expect(localforage.getItem).toHaveBeenCalledWith('test-key');
      expect(decryptObject).not.toHaveBeenCalled();
    });

    it('returns decrypted and stringified data when globalMasterKey is set', async () => {
      setGlobalMasterKey(dummyKey);
      vi.mocked(localforage.getItem).mockResolvedValueOnce(encryptedString);
      vi.mocked(decryptObject).mockResolvedValueOnce(dummyObject);

      const result = await storageEngine.getItem('test-key');
      expect(result).toBe(JSON.stringify(dummyObject));
      expect(localforage.getItem).toHaveBeenCalledWith('test-key');
      expect(decryptObject).toHaveBeenCalledWith(encryptedString, dummyKey);
    });

    it('throws an error if decryption fails', async () => {
      setGlobalMasterKey(dummyKey);
      vi.mocked(localforage.getItem).mockResolvedValueOnce(encryptedString);
      const error = new Error('Decryption Error');
      vi.mocked(decryptObject).mockRejectedValueOnce(error);

      // We spy on console.error to avoid test output noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(storageEngine.getItem('test-key')).rejects.toThrow('Decryption Error');
      expect(consoleSpy).toHaveBeenCalledWith("Decryption failed", error);

      consoleSpy.mockRestore();
    });
  });

  describe('setItem', () => {
    it('writes raw value directly to localforage when globalMasterKey is not set', async () => {
      const valueToSave = JSON.stringify(dummyObject);
      await storageEngine.setItem('test-key', valueToSave);

      expect(encryptObject).not.toHaveBeenCalled();
      expect(localforage.setItem).toHaveBeenCalledWith('test-key', valueToSave);
    });

    it('encrypts the value and saves to localforage when globalMasterKey is set', async () => {
      setGlobalMasterKey(dummyKey);
      const valueToSave = JSON.stringify(dummyObject);
      vi.mocked(encryptObject).mockResolvedValueOnce(encryptedString);

      await storageEngine.setItem('test-key', valueToSave);

      expect(encryptObject).toHaveBeenCalledWith(dummyObject, dummyKey);
      expect(localforage.setItem).toHaveBeenCalledWith('test-key', encryptedString);
    });
  });

  describe('removeItem', () => {
    it('calls localforage.removeItem with the correct key', async () => {
      await storageEngine.removeItem('test-key');
      expect(localforage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });
});
