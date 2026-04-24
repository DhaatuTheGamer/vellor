# Specification: Improve CSV Import Feature

## 1. Overview
The goal of this track is to enhance the existing CSV import functionality in Vellor. The improved feature will support bulk importing of students along with related entities such as payments, lesson history, guardian details, and custom notes. It will feature an interactive mapping UI and robust conflict resolution.

## 2. Functional Requirements
- **Interactive Mapping UI:** Users must be able to upload a CSV and visually map their CSV column headers to the corresponding Vellor data fields.
- **Supported Entities:** The import process must support mapping to:
  - Basic Student Details (Name, Email, etc.)
  - Guardian/Parent Details (Contact email, phone number)
  - Custom Notes
  - Payments/Transactions
  - Lesson History/Attendance
- **Conflict Resolution:** When an imported record matches an existing student (e.g., by email), the system must pause and prompt the user to resolve the conflict (e.g., skip, update, or create a new entry).
- **Partial Import & Error Handling:** The system will process valid rows and skip invalid ones. Upon completion, a summary report must be generated detailing successful imports and listing any rows that failed (e.g., due to malformed data), allowing the user to correct and re-import them.

## 3. Non-Functional Requirements
- **Performance:** Processing large CSV files should not block the main UI thread. Consider using Web Workers or asynchronous chunking if necessary.
- **Privacy & Security:** All data parsing and mapping must be done client-side to maintain Vellor's 100% offline, local-first privacy promise. No CSV data should be transmitted to any external server.

## 4. Acceptance Criteria
- [ ] User can upload a CSV and see an interactive UI for column mapping.
- [ ] Mapped columns for students, payments, lesson history, guardian details, and notes are parsed and saved correctly in local storage.
- [ ] User is prompted specifically for duplicate/conflicting records before final commit.
- [ ] A final import summary is displayed, listing successful rows and identifying any failed rows with reasons.
- [ ] System handles parsing completely client-side.

## 5. Out of Scope
- Syncing import mappings across devices.
- Auto-detecting complex, multi-table relationship structures outside of standard student/parent/payment mappings.
- Importing formats other than CSV (e.g., Excel/XML).