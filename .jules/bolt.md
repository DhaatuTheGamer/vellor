## 2026-04-15 - SetupEncryption Salt Array Allocation
**Learning:** Decoding base64 salt strings by splitting into individual characters and mapping to charCodes creates unnecessary intermediate arrays, consuming memory and garbage collector cycles during the critical decryption path.
**Action:** Always pre-allocate a `Uint8Array` of the exact required length and use a single `for` loop with `charCodeAt` when converting strings to byte arrays for cryptographic operations to eliminate intermediate array allocations.

## 2026-04-15 - Optimizing Date Comparisons in Loops
**Learning:** Instantiating `Date` objects or calling `Date.parse()` repeatedly inside high-frequency loops (like processing thousands of transactions for metrics or gamification checks) introduces significant CPU and GC overhead.
**Action:** For ISO 8601 formatted date strings (`YYYY-MM-DDTHH:mm:ss.sssZ`), use direct string prefix matching (e.g., `.startsWith('YYYY-MM')` for month checks) and lexicographical string comparisons (e.g., `t.date < nowString`) to eliminate costly date parsing inside the loop.
