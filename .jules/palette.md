## 2024-03-20 - Adding Confirmation to Destructive Actions
**Learning:** Instantly executing destructive actions like "Clear All Activity" can lead to accidental data loss. Providing a confirmation modal before proceeding creates a safer and more confident user experience.
**Action:** Whenever implementing a button that deletes multiple items or clears history, introduce a confirmation modal using the `ConfirmationModal` component to explicitly ask the user for confirmation.
