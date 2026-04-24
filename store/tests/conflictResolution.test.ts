import { describe, it, expect } from 'vitest';
import { findConflicts, resolveConflict, ConflictStrategy } from '../../helpers/conflictResolution';
import { Student } from '../../types';

describe('conflictResolution', () => {
    const existingStudents: Student[] = [
        { 
            id: '1', 
            firstName: 'John', 
            lastName: 'Doe', 
            contact: { email: 'john@example.com' },
            tuition: { subjects: ['Math'], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
            createdAt: '2023-01-01T00:00:00Z'
        }
    ];

    describe('findConflicts', () => {
        it('should identify a conflict by email', () => {
            const importedStudent: Partial<Student> = {
                firstName: 'Johnny',
                lastName: 'Doe',
                contact: { email: 'john@example.com' }
            };

            const conflicts = findConflicts(importedStudent, existingStudents);
            expect(conflicts).toHaveLength(1);
            expect(conflicts[0].existing.id).toBe('1');
        });

        it('should not identify a conflict if email is different', () => {
            const importedStudent: Partial<Student> = {
                firstName: 'Jane',
                lastName: 'Doe',
                contact: { email: 'jane@example.com' }
            };

            const conflicts = findConflicts(importedStudent, existingStudents);
            expect(conflicts).toHaveLength(0);
        });

        it('should ignore empty emails for conflict detection', () => {
            const importedStudent: Partial<Student> = {
                firstName: 'John',
                lastName: 'Smith',
                contact: { email: '' }
            };
            const existingWithEmptyEmail: Student[] = [
                { ...existingStudents[0], id: '2', contact: { email: '' } }
            ];

            const conflicts = findConflicts(importedStudent, existingWithEmptyEmail);
            expect(conflicts).toHaveLength(0);
        });
    });

    describe('resolveConflict', () => {
        const importedStudent: Partial<Student> = {
            firstName: 'Johnny',
            lastName: 'Doe',
            contact: { email: 'john@example.com' },
            notes: 'Updated note'
        };
        const existingStudent = existingStudents[0];

        it('should return null for SKIP strategy', () => {
            const result = resolveConflict(importedStudent, existingStudent, ConflictStrategy.Skip);
            expect(result).toBeNull();
        });

        it('should return merged student for OVERWRITE strategy', () => {
            const result = resolveConflict(importedStudent, existingStudent, ConflictStrategy.Overwrite);
            expect(result).toMatchObject({
                id: '1',
                firstName: 'Johnny',
                notes: 'Updated note'
            });
            // Should keep existing fields not in imported
            expect(result?.tuition.subjects).toEqual(['Math']);
        });

        it('should return existing student for PROMPT strategy (handled as no-op here)', () => {
            const result = resolveConflict(importedStudent, existingStudent, ConflictStrategy.Prompt);
            expect(result).toEqual(existingStudent);
        });
    });
});
