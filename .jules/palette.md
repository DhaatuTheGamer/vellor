## 2026-04-15 - Playwright Verification Flow
**Learning:** When using Playwright to verify internal UI components (like modals or specific routes), scripts must account for and successfully bypass the application's complex first-time onboarding flow, which includes master password creation, recovery key generation, profile setup, and tutorial overlays.
**Action:** Before writing assertions for internal components, verify if the application uses a strict onboarding gate and implement a robust helper function in the Playwright script to navigate through it consistently.

## 2026-04-19 - Raw Button Focus Visibility
**Learning:** Raw HTML `<button>` elements in this application often lack built-in focus visibility for keyboard navigation, as opposed to the custom `Button` component.
**Action:** When working with raw `<button>` elements, always explicitly include `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2` (and dark mode variants) to ensure keyboard accessibility.

## 2026-04-20 - Interactive List Items Keyboard Accessibility
**Learning:** Interactive custom components (like `<Card>`) used as clickable list items must have explicit keyboard accessibility attributes (e.g., `role="button"`, `tabIndex={0}`, `onKeyDown`) and visible focus styles to ensure they are accessible to keyboard users.
**Action:** When adding `onClick` to non-button components or creating clickable cards, always include `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind focus classes (`focus:outline-none focus-visible:ring-2 ...`).

## 2026-04-23 - Visual Feedback for Clipboard Operations
**Learning:** Users often copy important links or details (like Portal links or Contact cards) using navigator.clipboard.writeText, but the action happens silently without visual feedback. This leaves users unsure if the copy succeeded.
**Action:** Always pair clipboard copy actions with temporary visual feedback, such as changing the button icon to a checkmark and displaying 'Copied!' for a few seconds.

## 2026-04-25 - Tooltips for icon-only buttons
**Learning:** Found some icon-only buttons missing tooltips on hover (only having `aria-label`s for screen readers).
**Action:** Consistently ensure that all icon-only buttons have a `title` attribute so sighted users can understand the button's action without a text label.

## 2026-04-27 - Input Accessibility Attributes
**Learning:** Some custom input components and form fields in the auth flow lacked proper ARIA labels or id-htmlFor linkages, which impacts screen reader users and click-to-focus behavior.
**Action:** When creating or modifying custom input components, ensure that labels are explicitly linked to inputs using `htmlFor` and `id`, or that inputs have `aria-label`s if visual labels are omitted.
## 2026-04-30 - Crypto Loading States
**Learning:** Cryptographic operations (like deriving PBKDF2 keys) block the main thread and can take a noticeable amount of time, causing the UI to feel "frozen" to the user without visual feedback. While the sandbox hardware might be fast, real-world low-end devices will struggle.
**Action:** When implementing authentication or cryptography features, always provide an explicit `isLoading` state (e.g., using our `<Button>` component) to reassure the user that the application is processing their request.
