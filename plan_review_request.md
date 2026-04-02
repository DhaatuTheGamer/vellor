The issue is about repeated string manipulation in the `SearchModal` filter logic.
Currently, it concatenates `s.firstName + ' ' + s.lastName` and applies `.toLowerCase()` for every student during every render/filter cycle when typing in the search input.
By pre-computing the searchable name, we can reduce this to a simple substring check.

My proposed plan is:
1. Update the `Student` interface in `types.ts` to include an optional `_searchableName?: string` property to store the pre-computed string. (Actually, it might be better to just compute it in the Redux/Zustand store or during data fetching, OR we could memoize it in the component).
Wait, the `Student` objects come from the store. If we compute it when we fetch/create the student, we'd need to modify where students are stored.
Alternatively, we can use `useMemo` in `SearchModal` to pre-compute the mapped students array with `_searchableName`, so it's only done when the `students` array from the store changes, not on every keystroke. Let's write a quick script to check how it's handled.

Wait, since it's an array of objects from the store, we can use `useMemo`:
```tsx
const searchableStudents = useMemo(() => {
  return students.map(s => ({ ...s, _searchableName: (s.firstName + ' ' + s.lastName).toLowerCase() }));
}, [students]);
```
Then filter `searchableStudents` using `query.toLowerCase()`.
This shifts the string concatenation and lowercase operations from being O(N) *on every keystroke* to O(N) *only when the students array changes*.

Let's do this:
1. Modify `components/ui/SearchModal.tsx` to pre-compute the searchable name for students using `useMemo` based on the `students` array.
2. Update the `students.filter` logic in `SearchModal.tsx` to search against this pre-computed name using the lowercase query.
3. Run formatting, tests and submit.
