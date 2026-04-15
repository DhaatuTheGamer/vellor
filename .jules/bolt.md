## 2026-04-15 - SetupEncryption Salt Array Allocation
**Learning:** Decoding base64 salt strings by splitting into individual characters and mapping to charCodes creates unnecessary intermediate arrays, consuming memory and garbage collector cycles during the critical decryption path.
**Action:** Always pre-allocate a `Uint8Array` of the exact required length and use a single `for` loop with `charCodeAt` when converting strings to byte arrays for cryptographic operations to eliminate intermediate array allocations.
