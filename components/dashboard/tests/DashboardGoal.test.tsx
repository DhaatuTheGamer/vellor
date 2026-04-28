
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardGoal } from '../DashboardGoal';
import '@testing-library/jest-dom';

const mockUpdateSettings = vi.fn();

vi.mock('../../../store', () => ({
  useStore: vi.fn((selector) => {
    const state = {
      settings: {
        monthlyGoal: 1000,
        currencySymbol: '$',
      },
      updateSettings: mockUpdateSettings,
    };
    return selector(state);
  }),
  useData: {
    derived: vi.fn(() => ({
      totalPaidThisMonth: 500,
    })),
  },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, ...props }: any) => <div className={className} onClick={onClick} data-testid={props['data-testid']}>{children}</div>,
  },
}));

vi.mock('../../ui', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  Icon: ({ iconName, className }: any) => <span className={className} data-testid={`icon-${iconName}`}>{iconName}</span>,
}));

vi.mock('../../../helpers', () => ({
  formatCurrency: (amount: number, symbol: string) => `${symbol}${amount.toFixed(2)}`,
}));

describe('DashboardGoal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and displays current goal and progress', () => {
    render(<DashboardGoal itemVariants={{}} />);

    expect(screen.getByText('Monthly Goal')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getByText('/ $1000.00')).toBeInTheDocument();
    expect(screen.queryByText('Goal Achieved!')).not.toBeInTheDocument();
  });

  it('enters edit mode when clicking on the goal', () => {
    render(<DashboardGoal itemVariants={{}} />);

    const goalText = screen.getByText('/ $1000.00');
    fireEvent.click(goalText);

    const input = screen.getByLabelText('Monthly goal');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(1000);
  });

  it('saves the new goal when blurring the input', () => {
    render(<DashboardGoal itemVariants={{}} />);

    fireEvent.click(screen.getByText('/ $1000.00'));

    const input = screen.getByLabelText('Monthly goal');
    fireEvent.change(input, { target: { value: '1500' } });
    fireEvent.blur(input);

    expect(mockUpdateSettings).toHaveBeenCalledWith({ monthlyGoal: 1500 });
    expect(screen.queryByLabelText('Monthly goal')).not.toBeInTheDocument();
  });

  it('saves the new goal when pressing Enter', () => {
    render(<DashboardGoal itemVariants={{}} />);

    fireEvent.click(screen.getByText('/ $1000.00'));

    const input = screen.getByLabelText('Monthly goal');
    fireEvent.change(input, { target: { value: '2000' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockUpdateSettings).toHaveBeenCalledWith({ monthlyGoal: 2000 });
  });

  it('enters edit mode when pressing Enter on the goal text', () => {
    render(<DashboardGoal itemVariants={{}} />);

    const goalText = screen.getByText('/ $1000.00');
    fireEvent.keyDown(goalText, { key: 'Enter', code: 'Enter' });

    const input = screen.getByLabelText('Monthly goal');
    expect(input).toBeInTheDocument();
  });

  it('displays "Goal Achieved!" when the goal is met', async () => {
    // Override the mock to return totalPaidThisMonth >= monthlyGoal
    const { useData } = await import('../../../store');
    (useData.derived as any).mockReturnValueOnce({
      totalPaidThisMonth: 1200,
    });

    render(<DashboardGoal itemVariants={{}} />);
    expect(screen.getByText('Goal Achieved!')).toBeInTheDocument();
  });
});
