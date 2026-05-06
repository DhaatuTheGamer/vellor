import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DashboardCharts } from '../DashboardCharts';
import { PaymentStatus } from '../../../types';
import '@testing-library/jest-dom';

// Mock recharts
vi.mock('recharts', async () => {
  const OriginalRechartsModule = await vi.importActual('recharts');
  return {
    ...OriginalRechartsModule as object,
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    AreaChart: ({ children, data }: any) => <div data-testid="area-chart" data-chart-data={JSON.stringify(data)}>{children}</div>,
    Area: () => <div data-testid="area" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
  };
});

// Mock store
vi.mock('../../../store', () => ({
  useStore: vi.fn((selector) => {
    const today = new Date();

    // Create a transaction from 2 months ago
    const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 15);

    // Create a transaction from this month
    const thisMonth = new Date();

    const state = {
      settings: {
        currencySymbol: '$',
      },
      students: [
        { id: 's1', createdAt: twoMonthsAgo.toISOString() },
        { id: 's2', createdAt: thisMonth.toISOString() }
      ],
      transactions: [
        { id: 't1', amountPaid: 150, status: PaymentStatus.Paid, date: twoMonthsAgo.toISOString() },
        { id: 't2', amountPaid: 200, status: PaymentStatus.Paid, date: thisMonth.toISOString() },
        { id: 't3', amountPaid: 50, status: PaymentStatus.Due, date: thisMonth.toISOString() } // Should not be included in income
      ],
    };
    return selector(state);
  }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className} data-testid="motion-div">{children}</div>,
  },
}));

vi.mock('../../ui', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  Icon: ({ iconName, className }: any) => <span className={className} data-testid={`icon-${iconName}`}>{iconName}</span>,
}));

describe('DashboardCharts', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Suppress console.error for unrecognized tags
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      const msg = args[0];
      if (typeof msg === 'string' && (msg.includes('is unrecognized in this browser') || msg.includes('is using incorrect casing'))) {
        return;
      }
      console.warn(...args);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly with default income view', () => {
    render(<DashboardCharts itemVariants={{}} />);

    // Check titles and tabs
    expect(screen.getByText('Income Overview')).toBeInTheDocument();

    const incomeTab = screen.getByRole('tab', { name: 'View Income Overview' });
    const studentsTab = screen.getByRole('tab', { name: 'View Student Growth' });

    expect(incomeTab).toHaveAttribute('aria-selected', 'true');
    expect(studentsTab).toHaveAttribute('aria-selected', 'false');

    // Check chart elements
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('switches to students view when clicking the students tab', () => {
    render(<DashboardCharts itemVariants={{}} />);

    const studentsTab = screen.getByRole('tab', { name: 'View Student Growth' });
    fireEvent.click(studentsTab);

    expect(screen.getByText('Student Growth')).toBeInTheDocument();
    expect(studentsTab).toHaveAttribute('aria-selected', 'true');

    const incomeTab = screen.getByRole('tab', { name: 'View Income Overview' });
    expect(incomeTab).toHaveAttribute('aria-selected', 'false');
  });

  it('calculates chart data correctly for income and students', () => {
    render(<DashboardCharts itemVariants={{}} />);

    const chartDataElement = screen.getByTestId('area-chart');
    const chartData = JSON.parse(chartDataElement.getAttribute('data-chart-data') || '[]');

    expect(chartData).toHaveLength(6);

    // Find current month data
    const lastItem = chartData[5];
    expect(lastItem.income).toBe(200); // Only Paid transaction is included (t2), Due (t3) is excluded
    expect(lastItem.students).toBe(2); // Total students up to this month

    // Find 2 months ago data
    const twoMonthsAgoItem = chartData[3];
    expect(twoMonthsAgoItem.income).toBe(150);
    expect(twoMonthsAgoItem.students).toBe(1); // Only 1 student was created by 2 months ago
  });
});
