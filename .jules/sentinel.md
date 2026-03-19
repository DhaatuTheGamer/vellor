## 2024-05-24 - Deprecated `escape` usage for Base64 Decoding
**Vulnerability:** Used `decodeURIComponent(escape(atob(encryptedBase64)))` to parse old data. The `escape` function is deprecated and does not safely or robustly handle UTF-8/Unicode strings, potentially leading to injection or data corruption.
**Learning:** Legacy string conversion tricks for converting binary Base64 strings to UTF-8 are unsafe.
**Prevention:** Use standard, robust encoding/decoding APIs (e.g., `Uint8Array` + `TextDecoder`) for parsing binary strings instead of deprecated string functions.
