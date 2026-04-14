## 2026-04-14 - Keyboard Accessibility for Clickable Non-Button Elements
**Learning:** Adding an `onClick` handler to a generic element (like a `div`, `span`, or `Card`) makes it clickable for mouse users but completely inaccessible to keyboard users, breaking the tab order and preventing interaction.
**Action:** When making non-button elements interactive with `onClick`, always add `role="button"`, `tabIndex={0}`, an `onKeyDown` handler to trigger the action on 'Enter' or 'Space', and visible focus styles (e.g., `focus-visible:ring-2`).
