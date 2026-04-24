# Implementation Plan: Improve CSV Import Feature

## Phase 1: CSV Parser and Data Models [checkpoint: 19378a1]
- [x] Task: Implement robust CSV parsing and data mapping logic bdc02dc
    - [x] Write tests for parsing basic student details, guardian details, and custom notes from CSV rows
    - [x] Write tests for parsing payments and lesson history from CSV rows
    - [x] Implement CSV parser utility with error handling (Lenient import strategy)
    - [x] Implement data mapping interfaces/types
- [x] Task: Conductor - User Manual Verification 'Phase 1: CSV Parser and Data Models' (Protocol in workflow.md) 19378a1

## Phase 2: Conflict Resolution Logic [checkpoint: b94460b]
- [x] Task: Implement conflict detection and resolution engine 63fc83e
    - [x] Write tests for duplicate detection (e.g., matching emails)
    - [x] Write tests for conflict resolution strategies (skip, update)
    - [x] Implement conflict detection functions matching existing storage records
- [x] Task: Conductor - User Manual Verification 'Phase 2: Conflict Resolution Logic' (Protocol in workflow.md) b94460b

## Phase 3: Interactive Mapping UI
- [x] Task: Create UI components for CSV file upload and interactive column mapping f70ccd7
    - [x] Write tests for file upload component
    - [x] Write tests for interactive column mapping UI component
    - [x] Implement the file upload component
    - [x] Implement the interactive column mapping UI
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Interactive Mapping UI' (Protocol in workflow.md)

## Phase 4: Import Summary and Integration
- [ ] Task: Create Import Summary UI and integrate the entire flow
    - [ ] Write tests for the final Import Summary report UI (successes, errors, skipped)
    - [ ] Implement the Import Summary UI component
    - [ ] Integrate the file upload, mapping UI, conflict resolution prompt, and summary view into the existing Students page
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Import Summary and Integration' (Protocol in workflow.md)