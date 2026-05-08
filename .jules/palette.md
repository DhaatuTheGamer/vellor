## 2024-05-24 - Accessibility Anti-Pattern: Redundant ARIA Labels
**Learning:** Adding an `aria-label` that exactly matches the visible text content of an element (e.g., `<button aria-label="About">About</button>`) is an accessibility anti-pattern. Redundant ARIA labels do not improve the experience and can interfere with translation tools.
**Action:** Only add `aria-label` to interactive elements lacking descriptive text, like icon-only buttons. Purely decorative elements should instead receive `aria-hidden="true"`.
