import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AchievementsPage } from '../AchievementsPage';
import { useStore } from '../../store';
import { AchievementId, PaymentStatus, Theme } from '../../types';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className} data-testid="motion-div">{children}</div>,
  },
}));

// Mock hooks from useData to avoid Context errors
vi.mock('../../store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../store')>();
  return {
    ...actual,
    useData: () => ({ gamification: actual.useStore.getState().gamification })
  };
});
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

describe('AchievementsPage', () => {
  beforeEach(() => {
    // Reset store before each test
    useStore.setState({
      students: [],
      transactions: [],
      achievements: [
        { id: AchievementId.FirstStudentAdded, name: 'First Student Added', description: 'Added first student', achieved: false, icon: 'user' },
        { id: AchievementId.FirstPaymentLogged, name: 'First Payment Logged', description: 'Logged first payment', achieved: true, dateAchieved: '2023-01-01T00:00:00Z', icon: 'currency-dollar' }
      ],
      gamification: { points: 150, level: 2, levelName: 'Apprentice', streak: 5, lastActiveDate: null },
      settings: { currencySymbol: '$', theme: Theme.Light, userName: 'Tutor' }
    });
  });

  const renderComponent = () => {
    return render(
      <HelmetProvider>
        <MemoryRouter>
          <AchievementsPage />
        </MemoryRouter>
      </HelmetProvider>
    );
  };

  it('renders the header and gamification stats correctly', () => {
    renderComponent();

    // Check header
    expect(screen.getByText('Achievements & Badges')).toBeInTheDocument();

    // Check gamification stats
    expect(screen.getByText('150')).toBeInTheDocument(); // Points
    expect(screen.getByText('Apprentice')).toBeInTheDocument(); // Level Name
    expect(screen.getByText('Level 2')).toBeInTheDocument(); // Level number

    // Check unlock ratio (1 out of 2 unlocked)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('/ 2')).toBeInTheDocument();
  });

  it('renders unlocked achievements correctly', () => {
    renderComponent();

    expect(screen.getByText('Unlocked Achievements')).toBeInTheDocument();
    expect(screen.getByText('First Payment Logged')).toBeInTheDocument();
    expect(screen.getByText('Logged first payment')).toBeInTheDocument();
  });

  it('renders locked achievements correctly with hints', () => {
    renderComponent();

    expect(screen.getByText('Locked Achievements')).toBeInTheDocument();
    expect(screen.getByText('First Student Added')).toBeInTheDocument();
    expect(screen.getByText('Added first student')).toBeInTheDocument();

    // Hint check
    expect(screen.getByText(/Go to the Students page and add your first student profile/i)).toBeInTheDocument();
  });

  it('includes custom achievement if defined in settings', () => {
    useStore.setState({
      settings: { theme: Theme.Light, currencySymbol: '$', userName: 'Tutor', customAchievement: 'Reach 100 students', customAchievementEarned: false }
    });

    renderComponent();

    expect(screen.getByText('Personal Goal')).toBeInTheDocument();
    expect(screen.getByText('Reach 100 students')).toBeInTheDocument();
  });

  it('shows no achievements message if array is empty', () => {
    useStore.setState({ achievements: [] });

    renderComponent();

    expect(screen.getByText('No achievements defined yet.')).toBeInTheDocument();
  });

  it('calculates total earned correctly for First100Earned hint', () => {
    useStore.setState({
      transactions: [
        { id: '1', studentId: '1', lessonDuration: 60, lessonFee: 50, amountPaid: 50, date: '2023-01-01', status: PaymentStatus.Paid, createdAt: '2023-01-01T00:00:00Z' },
        { id: '2', studentId: '1', lessonDuration: 60, lessonFee: 30, amountPaid: 30, date: '2023-01-02', status: PaymentStatus.Paid, createdAt: '2023-01-02T00:00:00Z' }
      ],
      achievements: [
        { id: AchievementId.First100Earned, name: 'First $100', description: 'Earn $100', achieved: false, icon: 'currency-dollar' }
      ]
    });

    renderComponent();

    expect(screen.getByText(/You've earned \$80\.00 so far/i)).toBeInTheDocument();
  });


  it('renders all unique hints for different achievement types', () => {
    useStore.setState({
      students: [{ id: '1', firstName: 'Student', lastName: '1', createdAt: '2023-01-01T00:00:00Z', notes: '', contact: { email: '' }, tuition: { typicalLessonDuration: 60, defaultRate: 50, subjects: [], rateType: 'hourly' } }],
      gamification: { points: 0, level: 1, levelName: '', streak: 3, lastActiveDate: null },
      achievements: [
        { id: AchievementId.StudentRosterStarter, name: 'Student Roster Starter', description: 'Reach 5 students', achieved: false, icon: 'users' },
        { id: AchievementId.DebtDemolisher, name: 'Debt Demolisher', description: 'Clear all debt', achieved: false, icon: 'banknotes' },
        { id: AchievementId.SevenDayStreak, name: 'Seven Day Streak', description: 'Log in 7 days in a row', achieved: false, icon: 'flame' },
        { id: 'UNKNOWN_ACHIEVEMENT' as AchievementId, name: 'Unknown', description: 'Unknown', achieved: false, icon: 'star' }
      ]
    });

    renderComponent();

    // Check various hints
    expect(screen.getByText(/You currently have 1 student\(s\)\. You need 5 to unlock this!/i)).toBeInTheDocument();
    expect(screen.getByText(/Find any 'Due' or 'Partially Paid' transactions/i)).toBeInTheDocument();
    expect(screen.getByText(/You are currently on a 3-day streak/i)).toBeInTheDocument();
    expect(screen.getByText(/Keep using the app to unlock this achievement!/i)).toBeInTheDocument();
  });
});
