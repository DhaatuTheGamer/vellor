## 2026-04-15 - SetupEncryption Salt Array Allocation
**Learning:** Decoding base64 salt strings by splitting into individual characters and mapping to charCodes creates unnecessary intermediate arrays, consuming memory and garbage collector cycles during the critical decryption path.
**Action:** Always pre-allocate a `Uint8Array` of the exact required length and use a single `for` loop with `charCodeAt` when converting strings to byte arrays for cryptographic operations to eliminate intermediate array allocations.

## 2026-04-15 - Optimizing Date Comparisons in Loops
**Learning:** Instantiating `Date` objects or calling `Date.parse()` repeatedly inside high-frequency loops (like processing thousands of transactions for metrics or gamification checks) introduces significant CPU and GC overhead.
**Action:** For ISO 8601 formatted date strings (`YYYY-MM-DDTHH:mm:ss.sssZ`), use direct string prefix matching (e.g., `.startsWith('YYYY-MM')` for month checks) and lexicographical string comparisons (e.g., `t.date < nowString`) to eliminate costly date parsing inside the loop.
## 2026-04-19 - Local Date vs UTC ISO Date Comparisons
**Learning:** When attempting to optimize date comparisons by replacing `Date.parse()` with string comparisons, be extremely careful about the format and timezone of the strings being compared. In this codebase, transaction dates (`t.date`) are often local `YYYY-MM-DD` strings. Generating a "today" string using `new Date().toISOString()` creates a UTC string, which can represent a different day than local time depending on the user's timezone (e.g. UTC+9 users will get "yesterday's" UTC date at local midnight). Comparing a local date string to a UTC ISO string causes critical timezone regressions in the application logic.
**Action:** Always ensure string dates are in exactly the same format and timezone before comparing them lexicographically. Construct the "today" string using local Date methods (`getFullYear`, `getMonth`, `getDate` with padding) rather than `.toISOString()` when comparing against local date strings.
## 2026-05-15 - Array map() micro-optimization rejection
**Learning:** Replacing `Array.prototype.map()` with pre-allocated `for` loops is a negligible micro-optimization in modern V8 (Node 20) and does not yield measurable performance improvements. Attempting this optimization was rejected in code review because it sacrifices code readability.
**Action:** Do not optimize standard array methods like `.map()` into `for` loops unless dealing with millions of records in a critical bottleneck. Focus on higher-level architectural optimizations.

## 2026-05-15 - React inline drag handlers
**Learning:** In heavy list components like `CalendarPage.tsx`, rendering inline lists of draggable items with inline `onDragStart` handlers creates new closures on every render, causing unnecessary reconciliations of DOM elements.
**Action:** Extract inline lists into `React.memo` components and use `useCallback` for event handlers to prevent unnecessary re-renders of list items during parent component updates.
