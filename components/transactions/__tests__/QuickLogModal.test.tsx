import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { QuickLogModal } from '../QuickLogModal';
import { useStore } from '../../../store';
import { AttendanceStatus } from '../../../types';
import { useTranslation } from 'react-i18next';

// Mock the store
vi.mock('../../../store', () => ({
  useStore: vi.fn(),
}));

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, className }: any) => (
      <div onClick={onClick} className={className} data-testid="motion-div">
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the UI components used by QuickLogModal
vi.mock('../../ui', () => ({
  Icon: ({ iconName }: any) => <span data-testid={`icon-${iconName}`} />,
  Button: ({ children, onClick, type, className }: any) => (
    <button onClick={onClick} type={type} className={className} data-testid="mock-button">
      {children}
    </button>
  ),
  Input: ({ label, name, type, value, onChange, min, step, required, placeholder }: any) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        step={step}
        required={required}
        placeholder={placeholder}
        data-testid={`input-${name}`}
      />
    </div>
  ),
  Select: ({ label, name, value, onChange, options, required }: any) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        data-testid={`select-${name}`}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

const mockStudents = [
  {
    id: 'student-1',
    firstName: 'John',
    lastName: 'Doe',
    tuition: { rateType: 'hourly', defaultRate: 50, typicalLessonDuration: 60 },
  },
  {
    id: 'student-2',
    firstName: 'Jane',
    lastName: 'Smith',
    tuition: { rateType: 'per_lesson', defaultRate: 45, typicalLessonDuration: 45 },
  },
];

describe('QuickLogModal', () => {
  const mockAddTransaction = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        students: mockStudents,
        addTransaction: mockAddTransaction,
      };
      return selector(state);
    });
  });

  it('renders nothing when isOpen is false', () => {
    render(<QuickLogModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Quick Log')).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    render(<QuickLogModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Quick Log')).toBeInTheDocument();
    expect(screen.getByTestId('select-studentId')).toBeInTheDocument();
    expect(screen.getByTestId('select-attendance')).toBeInTheDocument();
    expect(screen.getByTestId('input-duration')).toBeInTheDocument();
    expect(screen.getByTestId('input-amountPaid')).toBeInTheDocument();
    expect(screen.getByText('Log Lesson')).toBeInTheDocument();
  });

  it('auto-fills duration when a student is selected', async () => {
    const user = userEvent.setup();
    render(<QuickLogModal isOpen={true} onClose={mockOnClose} />);

    const studentSelect = screen.getByTestId('select-studentId');
    await user.selectOptions(studentSelect, 'student-1');

    expect((screen.getByTestId('input-duration') as HTMLInputElement).value).toBe('60');
  });

  it('handles submission correctly for hourly student', async () => {
    const user = userEvent.setup();
    render(<QuickLogModal isOpen={true} onClose={mockOnClose} />);

    await user.selectOptions(screen.getByTestId('select-studentId'), 'student-1');

    // Duration should be auto-filled to 60. Let's change it to 120.
    const durationInput = screen.getByTestId('input-duration');
    await user.clear(durationInput);
    await user.type(durationInput, '120');

    const amountInput = screen.getByTestId('input-amountPaid');
    await user.type(amountInput, '100');

    // Submit form
    const submitBtn = screen.getByTestId('mock-button');
    await act(async () => {
        // Need to find the form and submit it, or click the button.
        // The mock button doesn't automatically trigger form submit in some RTL setups,
        // so we can simulate the form submit event.
        // Actually, user.click works if the button has type="submit".
        await user.click(submitBtn);
    });

    expect(mockAddTransaction).toHaveBeenCalledTimes(1);
    const passedData = mockAddTransaction.mock.calls[0][0];

    expect(passedData.studentId).toBe('student-1');
    expect(passedData.lessonDuration).toBe(120);
    // 120 mins = 2 hours. rate = 50. 2 * 50 = 100
    expect(passedData.lessonFee).toBe(100);
    expect(passedData.amountPaid).toBe(100);
    expect(passedData.attendance).toBe(AttendanceStatus.Present);
    expect(passedData.notes).toBe('Quick logged lesson');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders correctly in isMakeup mode', () => {
    render(<QuickLogModal isOpen={true} onClose={mockOnClose} isMakeup={true} />);
    expect(screen.getByText('Schedule Make-up')).toBeInTheDocument();

    // Attendance should not be visible
    expect(screen.queryByTestId('select-attendance')).not.toBeInTheDocument();

    // amountPaid should be set to 0 initially
    expect((screen.getByTestId('input-amountPaid') as HTMLInputElement).value).toBe('0');
    expect(screen.getByText('Schedule')).toBeInTheDocument();
  });

  it('handles submission correctly in isMakeup mode', async () => {
    const user = userEvent.setup();
    render(<QuickLogModal isOpen={true} onClose={mockOnClose} isMakeup={true} defaultStudentId="student-2" />);

    expect((screen.getByTestId('input-duration') as HTMLInputElement).value).toBe('');

    const durationInput = screen.getByTestId('input-duration');
    await user.type(durationInput, '45');

    const submitBtn = screen.getByTestId('mock-button');
    await act(async () => {
        await user.click(submitBtn);
    });

    expect(mockAddTransaction).toHaveBeenCalledTimes(1);
    const passedData = mockAddTransaction.mock.calls[0][0];

    expect(passedData.studentId).toBe('student-2');
    expect(passedData.lessonDuration).toBe(45);
    expect(passedData.lessonFee).toBe(45);
    expect(passedData.amountPaid).toBe(0);
    expect(passedData.notes).toBe('Scheduled Make-up Class');
    expect(passedData.status).toBe('Scheduled');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
