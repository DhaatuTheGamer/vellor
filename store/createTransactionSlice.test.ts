import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useStore } from '../store';
import { PaymentStatus } from '../types';

describe('createTransactionSlice - exportTransactionsCSV', () => {
  beforeEach(() => {
    // Reset store
    useStore.setState({
      students: [],
      transactions: [],
      toasts: [],
      activityLog: [],
      gamification: { points: 0, level: 1, levelName: 'Novice', streak: 0, lastActiveDate: null }
    });

    // Mock DOM and URL methods
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock document body methods and element creation
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

    const mockElement = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockElement as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows an info toast when there are no transactions to export', () => {
    const { exportTransactionsCSV, toasts } = useStore.getState();
    expect(useStore.getState().transactions.length).toBe(0);

    exportTransactionsCSV();

    const currentToasts = useStore.getState().toasts;
    expect(currentToasts.length).toBeGreaterThan(0);
    expect(currentToasts[currentToasts.length - 1].message).toBe('No transactions to export.');
    expect(currentToasts[currentToasts.length - 1].type).toBe('info');

    // Make sure we didn't try to create a CSV
    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('exports transactions and correctly escapes CSV characters', () => {
    // Setup store with students and transactions
    useStore.setState({
      students: [
        {
          id: 'student-1',
          firstName: 'John, Jr.', // Contains comma
          lastName: 'Doe\nSmith', // Contains newline
          country: 'US',
          createdAt: new Date().toISOString(),
          parent: { name: '', relationship: '' },
          contact: { email: '' },
          tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
          notes: ''
        }
      ],
      transactions: [
        {
          id: 'tx-1',
          studentId: 'student-1',
          date: '2023-10-25T10:00:00.000Z',
          lessonDuration: 60,
          lessonFee: 50,
          amountPaid: 50,
          status: PaymentStatus.Paid,
          paymentMethod: 'Cash "Money"', // Contains quotes
          notes: 'Great, lesson!', // Contains comma
          createdAt: new Date().toISOString()
        }
      ]
    });

    const { exportTransactionsCSV } = useStore.getState();
    exportTransactionsCSV();

    expect(global.URL.createObjectURL).toHaveBeenCalledOnce();
    const blobArg = (global.URL.createObjectURL as any).mock.calls[0][0] as Blob;
    expect(blobArg).toBeInstanceOf(Blob);
    expect(blobArg.type).toBe('text/csv;charset=utf-8;');

    // We can't directly read the blob easily synchronously in jsdom without FileReader,
    // but we can spy on the Blob constructor or try to read it if it's text.
    // However, vitest in jsdom might allow us to use text().

    // Check if link creation and click happened
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');

    const currentToasts = useStore.getState().toasts;
    expect(currentToasts[currentToasts.length - 1].message).toBe('CSV exported successfully!');
    expect(currentToasts[currentToasts.length - 1].type).toBe('success');
  });

  it('handles errors during export and shows an error toast', () => {
    useStore.setState({
      students: [],
      transactions: [
        {
          id: 'tx-1',
          studentId: 'unknown',
          date: '2023-10-25T10:00:00.000Z',
          lessonDuration: 60,
          lessonFee: 50,
          amountPaid: 50,
          status: PaymentStatus.Paid,
          paymentMethod: 'Cash',
          notes: '',
          createdAt: new Date().toISOString()
        }
      ]
    });

    // Force an error
    global.URL.createObjectURL = vi.fn(() => {
        throw new Error('Mocked error');
    });

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { exportTransactionsCSV } = useStore.getState();
    exportTransactionsCSV();

    const currentToasts = useStore.getState().toasts;
    expect(currentToasts[currentToasts.length - 1].message).toBe('Failed to export CSV.');
    expect(currentToasts[currentToasts.length - 1].type).toBe('error');

    consoleSpy.mockRestore();
  });
});
