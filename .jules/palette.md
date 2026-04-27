## 2024-04-27 - Input Accessibility Attributes
**Learning:** Some custom input components and form fields in the auth flow lacked proper ARIA labels or id-htmlFor linkages, which impacts screen reader users and click-to-focus behavior.
**Action:** When creating or modifying custom input components, ensure that labels are explicitly linked to inputs using `htmlFor` and `id`, or that inputs have `aria-label`s if visual labels are omitted.
