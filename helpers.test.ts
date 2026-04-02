import { describe, it, expect, beforeAll } from 'vitest';
import { formatCurrency, formatPhoneNumber, getPaymentStatusColor, formatRelativeTime, generatePortalLink } from './helpers';
import { PaymentStatus, Student, Transaction, AppSettings, Theme } from './types';

import { webcrypto } from 'crypto';

describe('Helpers', () => {
    beforeAll(() => {
        if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
          Object.defineProperty(globalThis, 'crypto', {
            value: webcrypto,
          });
        }
    });

    it('formats currency correctly', () => {
        expect(formatCurrency(150, '$')).toBe('$150.00');
        expect(formatCurrency(0, '£')).toBe('£0.00');
        expect(formatCurrency(12.3, '€')).toBe('€12.30');
    });

    it('formats phone numbers correctly', () => {
        expect(formatPhoneNumber(undefined)).toBe('N/A');
        expect(formatPhoneNumber({ countryCode: '+1', number: '1234567890' })).toBe('+1 1234567890');
        expect(formatPhoneNumber({ countryCode: '+44', number: '' })).toBe('N/A');
    });

    it('gets correct payment status colors', () => {
        expect(getPaymentStatusColor(PaymentStatus.Paid)).toBe('green');
        expect(getPaymentStatusColor(PaymentStatus.Due)).toBe('red');
        expect(getPaymentStatusColor(PaymentStatus.PartiallyPaid)).toBe('yellow');
        expect(getPaymentStatusColor(PaymentStatus.Overpaid)).toBe('amber');
    });

    it('formats relative time correctly for recent dates', () => {
        const now = new Date();
        const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
        expect(formatRelativeTime(thirtySecondsAgo.toISOString())).toBe('30s ago');
    });
});

describe('generatePortalLink', () => {
    const mockStudent: Student = {
        id: 'student-1',
        firstName: 'John',
        lastName: 'Doe',
        contact: {
            email: 'john.doe@example.com'
        },
        tuition: {
            subjects: ['Math', 'Science'],
            defaultRate: 50,
            rateType: 'hourly',
            typicalLessonDuration: 60
        },
        createdAt: '2023-01-01T00:00:00Z'
    };

    const mockTransactions: Transaction[] = [
        {
            id: 'tx-1',
            studentId: 'student-1',
            date: '2023-10-01T10:00:00Z',
            lessonDuration: 60,
            lessonFee: 50,
            amountPaid: 50,
            status: PaymentStatus.Paid,
            createdAt: '2023-10-01T10:00:00Z'
        },
        {
            id: 'tx-2',
            studentId: 'student-1',
            date: '2023-10-15T10:00:00Z',
            lessonDuration: 60,
            lessonFee: 50,
            amountPaid: 0,
            status: PaymentStatus.Due,
            createdAt: '2023-10-15T10:00:00Z'
        }
    ];

    const mockSettings: AppSettings = {
        theme: Theme.Light,
        currencySymbol: '$',
        userName: 'Tutor Tom'
    };

    it('generates a valid portal link with encrypted payload', async () => {
        const link = await generatePortalLink(mockStudent, mockTransactions, mockSettings);

        const baseUrl = window.location.href.split('#')[0];
        expect(link.startsWith(baseUrl)).toBe(true);
        expect(link).toContain('#/portal?data=');
        expect(link).toContain('&k=');

        const url = new URL(link.replace('#/', ''));
        const encryptedData = url.searchParams.get('data')!;
        const exportedKey = url.searchParams.get('k')!;

        const { importKeyFromBase64, decryptObject } = await import('./src/crypto');
        const key = await importKeyFromBase64(exportedKey);
        const payload = await decryptObject(encryptedData, key);

        expect(payload).toMatchObject({
            tutorName: 'Tutor Tom',
            currencySymbol: '$',
            student: {
                firstName: 'John',
                lastName: 'Doe',
                subjects: ['Math', 'Science']
            }
        });

        // Transactions should be sorted by date descending (tx-2, then tx-1)
        expect(payload.transactions).toHaveLength(2);
        expect(payload.transactions[0].id).toBe('tx-2');
        expect(payload.transactions[1].id).toBe('tx-1');
    });

    it('sorts transactions by date descending', async () => {
        // Unordered transactions
        const unorderedTransactions: Transaction[] = [
            { ...mockTransactions[0], id: 'old', date: '2023-01-01T00:00:00Z' },
            { ...mockTransactions[0], id: 'new', date: '2023-12-31T00:00:00Z' },
            { ...mockTransactions[0], id: 'middle', date: '2023-06-15T00:00:00Z' },
        ];

        const link = await generatePortalLink(mockStudent, unorderedTransactions, mockSettings);
        const url = new URL(link.replace('#/', ''));
        const encryptedData = url.searchParams.get('data')!;
        const exportedKey = url.searchParams.get('k')!;

        const { importKeyFromBase64, decryptObject } = await import('./src/crypto');
        const key = await importKeyFromBase64(exportedKey);
        const payload = await decryptObject(encryptedData, key);

        expect(payload.transactions[0].id).toBe('new');
        expect(payload.transactions[1].id).toBe('middle');
        expect(payload.transactions[2].id).toBe('old');
    });

    it('handles empty transactions array', async () => {
        const link = await generatePortalLink(mockStudent, [], mockSettings);
        const url = new URL(link.replace('#/', ''));
        const encryptedData = url.searchParams.get('data')!;
        const exportedKey = url.searchParams.get('k')!;

        const { importKeyFromBase64, decryptObject } = await import('./src/crypto');
        const key = await importKeyFromBase64(exportedKey);
        const payload = await decryptObject(encryptedData, key);

        expect(payload.transactions).toHaveLength(0);
        expect(payload.transactions).toEqual([]);
    });
});
