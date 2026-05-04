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

## 2026-04-20 - Index-based array loops and string concatenation over `for...of` and template literals
**Learning:** For high-frequency array iteration, converting a `for...of` loop to an index-based `for` loop (`for (let i = 0, len = arr.length; i < len; i++)`) combined with avoiding template literals in favor of standard string concatenation (`str1 + ' ' + str2`) can improve execution time significantly by reducing allocation and iteration overhead.
**Action:** When working on performance-critical mapping loops, replace `for...of` and template literals with index-based loops and string concatenation to save CPU cycles.
## 2026-04-20 - Avoid intermediate mapping for searchableName computation
**Learning:** Replacing `.map()` with a pre-allocated `for` loop (e.g., `const result = new Array(len)`) eliminates intermediate array allocations and provides measurable performance improvements for large data sets.
**Action:** When working on array transformations in performance-critical paths, consider using pre-allocated `for` loops instead of native higher-order functions like `.map()`.

## 2026-04-20 - Array.prototype.filter vs For Loop Optimization
**Learning:** `Array.prototype.filter` creates intermediate arrays and has callback function overhead which can be avoided by constructing arrays directly with a standard `for` loop.
**Action:** When working on performance-critical loops filtering arrays (such as the `activityLog` in zustand), prefer using a standard `for` loop pushing to a pre-allocated array instead of `.filter` to avoid intermediate allocations and function invocation overhead.
## 2026-04-22 - Zustand State Array Update Optimization
**Learning:** When updating items in an array within Zustand state setters, unconditionally cloning the entire array (e.g., `const newItems = [...state.items]`) *before* iterating to find a match introduces unnecessary O(N) allocation overhead for non-matching updates.
**Action:** When updating state arrays, iterate over the current array and only create a shallow copy *after* a match is found.
## 2026-04-20 - Replacing chained array methods in keydown handlers
**Learning:** Sequential `.filter().forEach()` operations inside high-frequency global event handlers (like global keyboard shortcuts) create unnecessary intermediate arrays, resulting in wasted memory allocations and garbage collection spikes which can cause input jank.
**Action:** When performing array operations within global or document-level event listeners, replace chained higher-order functions with a single pass index-based `for` loop to eliminate intermediate allocations and maintain optimal responsiveness.
## 2026-04-20 - Lexicographical Date string comparison vs Date.parse
**Learning:** Calling `Date.parse()` on strings repeatedly inside high frequency loops or rendering pipelines introduces significant garbage collection and parsing overhead.
**Action:** Since ISO 8601 strings sort lexicographically perfectly with time, convert target thresholds to ISO strings once before a loop, and then compare raw array string fields directly instead of parsing each one into a unix timestamp. This provides an order-of-magnitude speedup.
## 2026-04-25 - String allocation optimization: split().map().filter() vs slice
**Learning:** Chaining `.split('\n')` followed by `.map()` and `.filter()` to parse large multi-line strings (like CSV files) allocates massive intermediate arrays for every line and character transformation. This spikes memory usage and causes garbage collection pauses that slow down data import operations.
**Action:** When parsing large delimited strings, replace higher-order chained methods with a single manual `while` loop that uses `indexOf()` and `slice()` to extract sub-strings directly into the final array, eliminating all intermediate array allocations.
## 2026-04-28 - Bulk Zustand Actions
**Learning:** Calling single-item state setters (like `addStudent`) inside a loop for large imports triggers N+1 state updates, crippling React render performance. Bulk actions are essential for high-throughput imports.
**Action:** Implement array-based bulk actions (e.g. `addStudents`) that perform a single `set()` update to the store state when handling CSV imports or batch operations.
## 2026-05-04 - Array mapping inside PDF Generation (jsPDF/autoTable)
**Learning:** Utilizing `.map()` to generate massive 2D arrays directly inside configuration objects for libraries like `jspdf-autotable` creates significant intermediate array allocations during bulk report generation.
**Action:** When preparing large tabular data (like transaction histories) for PDF reports, use a pre-allocated `new Array(len)` combined with a standard index-based `for` loop instead of `.map()` to drastically reduce garbage collection overhead and memory spikes during the render pipeline.

## 2026-05-03 - replace_with_git_merge_diff dangers
**Learning:** Using `replace_with_git_merge_diff` with a massive `SEARCH` block that spans multiple functions or methods is extremely dangerous. If the `REPLACE` block only contains the modified portion, it will inadvertently delete all other functions captured in the `SEARCH` block, causing catastrophic regressions.
**Action:** When using `replace_with_git_merge_diff`, restrict the `SEARCH` block to be as small and tightly scoped as possible around the exact lines being modified to prevent accidental code deletion.
