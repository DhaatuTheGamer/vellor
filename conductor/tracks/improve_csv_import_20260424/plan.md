# Implementation Plan: Improve CSV Import Feature

## Phase 1: CSV Parser and Data Models
- [x] Task: Implement robust CSV parsing and data mapping logic bdc02dc
    - [x] Write tests for parsing basic student details, guardian details, and custom notes from CSV rows
    - [x] Write tests for parsing payments and lesson history from CSV rows
    - [x] Implement CSV parser utility with error handling (Lenient import strategy)
    - [x] Implement data mapping interfaces/types
- [ ] Task: Conductor - User Manual Verification 'Phase 1: CSV Parser and Data Models' (Protocol in workflow.md)

## Phase 2: Conflict Resolution Logic
- [ ] Task: Implement conflict detection and resolution engine
    - [ ] Write tests for duplicate detection (e.g., matching emails)
    - [ ] Write tests for conflict resolution strategies (skip, update)
    - [ ] Implement conflict detection functions matching existing storage records
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Conflict Resolution Logic' (Protocol in workflow.md)

## Phase 3: Interactive Mapping UI
- [ ] Task: Create UI components for CSV file upload and interactive column mapping
    - [ ] Write tests for file upload component
    - [ ] Write tests for interactive column mapping UI component
    - [ ] Implement the file upload component
    - [ ] Implement the interactive column mapping UI
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Interactive Mapping UI' (Protocol in workflow.md)

## Phase 4: Import Summary and Integration
- [ ] Task: Create Import Summary UI and integrate the entire flow
    - [ ] Write tests for the final Import Summary report UI (successes, errors, skipped)
    - [ ] Implement the Import Summary UI component
    - [ ] Integrate the file upload, mapping UI, conflict resolution prompt, and summary view into the existing Students page
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Import Summary and Integration' (Protocol in workflow.md)