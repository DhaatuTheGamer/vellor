import { describe, it, expect } from 'vitest';
import { backupSchema } from './validation';
import { Theme, PaymentStatus, AchievementId } from '../types';

describe('Zod Validation - Data Management Import', () => {
    const validData = {
        students: [
            {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                country: 'United States',
                contact: { email: 'john@example.com' },
                tuition: { subjects: ['Math'], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
                createdAt: new Date().toISOString()
            }
        ],
        transactions: [
            {
                id: 't1',
                studentId: '1',
                date: new Date().toISOString(),
                lessonDuration: 60,
                lessonFee: 50,
                amountPaid: 50,
                status: PaymentStatus.Paid,
                createdAt: new Date().toISOString()
            }
        ],
        settings: {
            theme: Theme.Dark,
            currencySymbol: '$',
            userName: 'Tutor',
            monthlyGoal: 1000
        },
        gamification: {
            points: 100,
            level: 1,
            levelName: 'Novice',
            streak: 2,
            lastActiveDate: null
        },
        achievements: [
            {
                id: AchievementId.FirstStudentAdded,
                name: 'First Student Added',
                description: 'You added your first student',
                achieved: true,
                icon: 'user'
            }
        ]
    };

    it('should successfully parse valid data structure', () => {
        expect(() => backupSchema.parse(validData)).not.toThrow();
        const parsed = backupSchema.parse(validData);
        expect(parsed.students[0].firstName).toBe('John');
    });

    it('should throw an error for missing required fields in students', () => {
        const invalidData = {
            ...validData,
            students: [
                {
                    id: '1',
                    // firstName is missing
                    lastName: 'Doe',
                    contact: {},
                    tuition: { subjects: ['Math'], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
                    createdAt: new Date().toISOString()
                }
            ]
        };

        expect(() => backupSchema.parse(invalidData)).toThrowError(/firstName/);
    });

    it('should throw an error for malformed nested fields (tuition rateType)', () => {
        const invalidData = {
            ...validData,
            students: [
                {
                    id: '1',
                    firstName: 'John',
                    lastName: 'Doe',
                    contact: {},
                    tuition: {
                        subjects: ['Math'],
                        defaultRate: 50,
                        rateType: 'yearly', // Invalid enum value
                        typicalLessonDuration: 60
                    },
                    createdAt: new Date().toISOString()
                }
            ]
        };

        expect(() => backupSchema.parse(invalidData)).toThrowError(/Invalid option: expected one of/);
    });

    it('should throw an error for totally malformed payloads', () => {
        const malformedData = {
            maliciousField: true,
            alert: 'bwahaha'
        };

        // This should throw because it misses students, transactions, and settings completely
        expect(() => backupSchema.parse(malformedData)).toThrowError();
    });

    it('should throw an error if an array field is replaced by an object', () => {
        const invalidData = {
            ...validData,
            students: { malicious: 'data' }
        };

        expect(() => backupSchema.parse(invalidData)).toThrowError();
    });
});
