1. **Optimize array allocation in StudentForm.tsx**
   - Use `replace_with_git_merge_diff` to modify `components/students/StudentForm.tsx` by replacing the `e.target.value.split(',').reduce(...)` with a manual string iteration using `indexOf`. This avoids allocating an intermediate array of strings and reduces garbage collection overhead.

2. **Verify changes**
   - Run `pnpm lint` to ensure no TypeScript or linting errors were introduced.
   - Run `pnpm test` to run the test suite and ensure no regressions in behavior.

3. **Cleanup temporary benchmark scripts**
   - Run `run_in_bash_session` to `rm bench*.ts memory_bench*` to ensure the workspace is clean.
   - Run `ls` to verify they are removed.

4. **Complete pre commit steps**
   - Call `pre_commit_instructions` to retrieve and follow any repository-specific pre-commit requirements, ensuring proper testing, verification, review, and reflection are done.

5. **Submit PR**
   - Use `submit` to create a PR with the title "⚡ Bolt: Avoid intermediate array allocation in StudentForm" and detail the performance improvements in the description.
