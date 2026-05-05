💡 **What:**
Replaced an O(N * M) nested loop in `DashboardCharts.tsx` (which computed cumulative student counts over 6 target months) with a single-pass unrolled frequency map. The loops were swapped so the code now iterates exactly once over the large `studentTimes` array as the outer loop and checks the unrolled month thresholds internally.

🎯 **Why:**
The original implementation repetitively accessed the large `studentTimes` array 6 times, resulting in poor CPU cache locality and redundant operations. Swapping the loop dimensions and eliminating the inner loop creates a significantly faster, cache-friendly data access pattern.

📊 **Measured Improvement:**
Benchmarking on 10,000 dates over 1,000 iterations:
- **Baseline**: ~1,003ms
- **Optimized**: ~657ms
This resulted in a **~34.5% reduction** in execution time while retaining exact semantics and order independence.

*(Note: Also fixed a pre-existing CI blocker where `DEFAULT_USER_NAME` was duplicated in `constants.ts` to allow the PR test suite to pass).*
