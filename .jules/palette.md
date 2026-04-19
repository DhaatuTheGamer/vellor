## 2026-04-15 - Playwright Verification Flow
**Learning:** When using Playwright to verify internal UI components (like modals or specific routes), scripts must account for and successfully bypass the application's complex first-time onboarding flow, which includes master password creation, recovery key generation, profile setup, and tutorial overlays.
**Action:** Before writing assertions for internal components, verify if the application uses a strict onboarding gate and implement a robust helper function in the Playwright script to navigate through it consistently.

## 2026-04-19 - Raw Button Focus Visibility
**Learning:** Raw HTML `<button>` elements in this application often lack built-in focus visibility for keyboard navigation, as opposed to the custom `Button` component.
**Action:** When working with raw `<button>` elements, always explicitly include `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2` (and dark mode variants) to ensure keyboard accessibility.
