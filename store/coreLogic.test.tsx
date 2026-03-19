import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStore, useDerivedData } from '../store';
import { PaymentStatus, AchievementId } from '../types';

// Mock confetti to prevent errors in Node environment
vi.mock('canvas-confetti', () => {
   return { default: vi.fn() };
});

beforeEach(() => {
  // Reset store
  useStore.setState({
    students: [],
    transactions: [],
    achievements: useStore.getState().achievements.map(a => ({ ...a, achieved: false })),
    gamification: { points: 0, level: 1, levelName: 'Novice Tutor', streak: 0, lastActiveDate: null }
  });
  useStore.getState().clearActivityLog();
});

describe('useDerivedData Hook', () => {
  it('calculates total unpaid correctly', () => {
    useStore.setState({
      transactions: [
        { id: '1', studentId: 's1', date: '2023-10-01', lessonDuration: 60, lessonFee: 50, amountPaid: 0, status: PaymentStatus.Due, paymentMethod: '', createdAt: '' },
        { id: '2', studentId: 's1', date: '2023-10-02', lessonDuration: 60, lessonFee: 40, amountPaid: 20, status: PaymentStatus.PartiallyPaid, paymentMethod: '', createdAt: '' },
        { id: '3', studentId: 's2', date: '2023-10-03', lessonDuration: 60, lessonFee: 100, amountPaid: 100, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' }
      ]
    });
    
    const { result } = renderHook(() => useDerivedData());
    expect(result.current.totalUnpaid).toBe(70); // 50 (Due) + 20 (Remaining of PartiallyPaid)
  });

  it('calculates total paid this month correctly', () => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    useStore.setState({
      transactions: [
        // Paid this month
        { id: '1', studentId: 's1', date: today.toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 50, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' },
        // Partially paid this month
        { id: '2', studentId: 's1', date: today.toISOString(), lessonDuration: 60, lessonFee: 40, amountPaid: 20, status: PaymentStatus.PartiallyPaid, paymentMethod: '', createdAt: '' },
        // Paid last month (should NOT be included)
        { id: '3', studentId: 's2', date: lastMonth.toISOString(), lessonDuration: 60, lessonFee: 100, amountPaid: 100, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' },
        // Due this month (should NOT be included)
        { id: '4', studentId: 's1', date: today.toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 0, status: PaymentStatus.Due, paymentMethod: '', createdAt: '' },
      ]
    });
    
    const { result } = renderHook(() => useDerivedData());
    expect(result.current.totalPaidThisMonth).toBe(70); // 50 + 20
  });

  it('identifies overdue payments correctly (due date strictly before today)', () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    useStore.setState({
      transactions: [
        // Overdue
        { id: 'ol1', studentId: 's1', date: yesterday.toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 0, status: PaymentStatus.Due, paymentMethod: '', createdAt: '' },
        { id: 'ol2', studentId: 's1', date: yesterday.toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 20, status: PaymentStatus.PartiallyPaid, paymentMethod: '', createdAt: '' },
        // Not Overdue (Paid)
        { id: 'no1', studentId: 's1', date: yesterday.toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 50, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' },
        // Not Overdue (Due today or tomorrow)
        { id: 'no2', studentId: 's1', date: today.toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 0, status: PaymentStatus.Due, paymentMethod: '', createdAt: '' },
        { id: 'no3', studentId: 's1', date: tomorrow.toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 0, status: PaymentStatus.Due, paymentMethod: '', createdAt: '' },
      ]
    });
    
    const { result } = renderHook(() => useDerivedData());
    expect(result.current.overduePayments).toHaveLength(2);
    expect(result.current.overduePayments.map(t => t.id)).toContain('ol1');
    expect(result.current.overduePayments.map(t => t.id)).toContain('ol2');
  });
});

describe('Gamification Logic (checkAndAwardAchievements)', () => {
    it('awards First Student Added achievement', () => {
        useStore.setState({
            students: [{ id: '1', firstName: 'John', lastName: 'Doe', country: 'US', createdAt: '' } as any]
        });
        
        // Initial state should be false
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.FirstStudentAdded)?.achieved).toBe(false);

        // Run logic
        useStore.getState().checkAndAwardAchievements();

        // Should now be true
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.FirstStudentAdded)?.achieved).toBe(true);
    });

    it('awards Century Club achievement when exactly 100 transactions exist', () => {
        const hundredTxs = Array.from({ length: 100 }, (_, i) => ({
             id: String(i), studentId: 's1', date: new Date().toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 50, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' 
        }));
        
        useStore.setState({ transactions: hundredTxs });
        
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.CenturyClub)?.achieved).toBe(false);
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.CenturyClub)?.achieved).toBe(true);
    });

    it('handles multiple achievements awarded at once', () => {
        // Condition: 10 students, 10 payments, first $100 earned
        const students = Array.from({ length: 10 }, (_, i) => ({ id: String(i), firstName: 'John', lastName: 'Doe', country: 'US', createdAt: '' } as any));
        const txs = Array.from({ length: 10 }, (_, i) => ({
             id: String(i), studentId: String(i), date: new Date().toISOString(), lessonDuration: 60, lessonFee: 10, amountPaid: 10, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' 
        }));

        useStore.setState({ students, transactions: txs });
        useStore.getState().checkAndAwardAchievements();

        const state = useStore.getState();
        expect(state.achievements.find(a => a.id === AchievementId.FirstStudentAdded)?.achieved).toBe(true);
        expect(state.achievements.find(a => a.id === AchievementId.StudentRosterStarter)?.achieved).toBe(true);
        expect(state.achievements.find(a => a.id === AchievementId.TenStudentsEnrolled)?.achieved).toBe(true);
        expect(state.achievements.find(a => a.id === AchievementId.FirstPaymentLogged)?.achieved).toBe(true);
        expect(state.achievements.find(a => a.id === AchievementId.TenPaymentsLogged)?.achieved).toBe(true);
        expect(state.achievements.find(a => a.id === AchievementId.First100Earned)?.achieved).toBe(true);
    });

    it('awards DebtDemolisher when overdue payments are cleared and there is at least one paid transaction', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 5);

        // Initial state with an overdue payment
        useStore.setState({
            transactions: [
                { id: '1', studentId: 's1', date: pastDate.toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 0, status: PaymentStatus.Due, paymentMethod: '', createdAt: '' }
            ]
        });
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.DebtDemolisher)?.achieved).toBe(false);

        // Clear overdue payment and add a paid one
        useStore.setState({
            transactions: [
                { id: '1', studentId: 's1', date: pastDate.toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 50, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' }
            ]
        });
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.DebtDemolisher)?.achieved).toBe(true);
    });

    it('awards SevenDayStreak, ThirtyDayStreak, and HundredDayStreak achievements based on streak', () => {
        // Test 7-Day
        useStore.setState({ gamification: { ...useStore.getState().gamification, streak: 7 } });
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.SevenDayStreak)?.achieved).toBe(true);

        // Test 30-Day
        useStore.setState({ gamification: { ...useStore.getState().gamification, streak: 30 } });
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.ThirtyDayStreak)?.achieved).toBe(true);

        // Test 100-Day
        useStore.setState({ gamification: { ...useStore.getState().gamification, streak: 100 } });
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.HundredDayStreak)?.achieved).toBe(true);
    });

    it('awards ProfileCompleted achievement', () => {
        useStore.setState({ settings: { userName: 'Tutor', email: '', phone: { number: '' }, theme: 'light', currencySymbol: '$' } });
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.ProfileCompleted)?.achieved).toBe(false);

        useStore.setState({ settings: { userName: 'Jane Doe', email: 'jane@example.com', phone: { number: '1234567890' }, theme: 'light', currencySymbol: '$' } });
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.ProfileCompleted)?.achieved).toBe(true);
    });

    it('awards FirstGoalMet achievement', () => {
        const today = new Date();
        useStore.setState({
            settings: { monthlyGoal: 500, userName: 'Tutor', theme: 'light', currencySymbol: '$' },
            transactions: [
                { id: '1', studentId: 's1', date: today.toISOString(), lessonDuration: 60, lessonFee: 500, amountPaid: 500, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' }
            ]
        });
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.FirstGoalMet)?.achieved).toBe(true);
    });

    it('awards MarathonSession achievement', () => {
        useStore.setState({
            transactions: [
                { id: '1', studentId: 's1', date: new Date().toISOString(), lessonDuration: 180, lessonFee: 150, amountPaid: 150, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' }
            ]
        });
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.MarathonSession)?.achieved).toBe(true);
    });

    it('awards BonusEarned achievement', () => {
        useStore.setState({
            transactions: [
                { id: '1', studentId: 's1', date: new Date().toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 60, status: PaymentStatus.Overpaid, paymentMethod: '', createdAt: '' }
            ]
        });
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.BonusEarned)?.achieved).toBe(true);
    });

    it('awards BusyBee achievement for 3+ lessons in a day', () => {
        const todayStr = new Date().toISOString().split('T')[0];
        useStore.setState({
            transactions: [
                { id: '1', studentId: 's1', date: `${todayStr}T10:00:00Z`, lessonDuration: 60, lessonFee: 50, amountPaid: 50, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' },
                { id: '2', studentId: 's2', date: `${todayStr}T12:00:00Z`, lessonDuration: 60, lessonFee: 50, amountPaid: 50, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' },
                { id: '3', studentId: 's3', date: `${todayStr}T14:00:00Z`, lessonDuration: 60, lessonFee: 50, amountPaid: 50, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' }
            ]
        });
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.BusyBee)?.achieved).toBe(true);
    });

    it('awards SubjectMaster achievement for teaching 3+ unique subjects', () => {
        useStore.setState({
            students: [
                { id: '1', firstName: 'John', lastName: 'Doe', tuition: { subjects: ['Math', 'Science'] }, createdAt: '' } as any,
                { id: '2', firstName: 'Jane', lastName: 'Doe', tuition: { subjects: ['Math', 'History'] }, createdAt: '' } as any,
            ]
        });
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.SubjectMaster)?.achieved).toBe(true);
    });

    it('awards LoyalScholar achievement when a student has 10+ transactions', () => {
        const tenTxs = Array.from({ length: 10 }, (_, i) => ({
             id: String(i), studentId: 'loyal-student', date: new Date().toISOString(), lessonDuration: 60, lessonFee: 50, amountPaid: 50, status: PaymentStatus.Paid, paymentMethod: '', createdAt: ''
        }));

        useStore.setState({ transactions: tenTxs });
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.LoyalScholar)?.achieved).toBe(true);
    });

    it('awards HighTicket achievement', () => {
        useStore.setState({
            transactions: [
                { id: '1', studentId: 's1', date: new Date().toISOString(), lessonDuration: 60, lessonFee: 200, amountPaid: 200, status: PaymentStatus.Paid, paymentMethod: '', createdAt: '' }
            ]
        });
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.HighTicket)?.achieved).toBe(true);
    });

    it('awards LevelFive achievement', () => {
        useStore.setState({ gamification: { ...useStore.getState().gamification, level: 5 } });
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.LevelFive)?.achieved).toBe(true);
    });

    it('awards RateDiversifier achievement', () => {
        useStore.setState({
            students: [
                { id: '1', firstName: 'John', lastName: 'Doe', tuition: { rateType: 'hourly' }, createdAt: '' } as any,
                { id: '2', firstName: 'Jane', lastName: 'Doe', tuition: { rateType: 'per_lesson' }, createdAt: '' } as any,
                { id: '3', firstName: 'Jack', lastName: 'Doe', tuition: { rateType: 'monthly' }, createdAt: '' } as any,
            ]
        });
        useStore.getState().checkAndAwardAchievements();
        expect(useStore.getState().achievements.find(a => a.id === AchievementId.RateDiversifier)?.achieved).toBe(true);
    });
});
