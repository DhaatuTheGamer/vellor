## 2024-04-03 - React.memo Broken by Inline Callbacks
**Learning:** Even if list item components (`StudentListItem`, `TransactionListItem`) are wrapped in `React.memo`, passing un-memoized inline callbacks or arrow functions from the parent list component will break the memoization. This causes the entire list to re-render on any parent state change (e.g., typing in a search bar), leading to noticeable UI lag with large lists.
**Action:** Always wrap event handler callbacks in `useCallback` when passing them down to child components that rely on `React.memo` to prevent unnecessary re-renders.
