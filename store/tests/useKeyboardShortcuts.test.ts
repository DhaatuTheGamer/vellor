import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as storeMod from '../../store';
import { PaymentStatus } from '../../types';
import * as globalHover from '../../helpers/globalHover';

// Mock the store
vi.mock('../../store', () => ({
  useStore: vi.fn(),
}));

vi.mock('../../helpers/globalHover', () => ({
  currentHoveredTransactionId: null,
  currentHoveredStudentId: null,
}));

describe('useKeyboardShortcuts', () => {
  let mockOnOpenSearch: any;
  let mockOnOpenQuickLog: any;
  let mockOnOpenHelp: any;
  let mockUpdateTransaction: any;
  let mockAddToast: any;
  let mockStore: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockOnOpenSearch = vi.fn();
    mockOnOpenQuickLog = vi.fn();
    mockOnOpenHelp = vi.fn();
    mockUpdateTransaction = vi.fn();
    mockAddToast = vi.fn();

    mockStore = {
      transactions: [],
      updateTransaction: mockUpdateTransaction,
      addToast: mockAddToast
    };

    vi.spyOn(storeMod, 'useStore').mockImplementation(() => mockStore);
    (globalHover as any).currentHoveredTransactionId = null;
    (globalHover as any).currentHoveredStudentId = null;
    
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      writable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers and unregisters the keydown event listener', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardShortcuts(mockOnOpenSearch, mockOnOpenQuickLog, mockOnOpenHelp));

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('ignores shortcuts if user is typing in an input field', () => {
    renderHook(() => useKeyboardShortcuts(mockOnOpenSearch, mockOnOpenQuickLog, mockOnOpenHelp));

    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    Object.defineProperty(event, 'target', { value: { tagName: 'INPUT' }, enumerable: true });
    window.dispatchEvent(event);

    expect(mockOnOpenSearch).not.toHaveBeenCalled();
  });

  it('opens search on cmd+k', () => {
    renderHook(() => useKeyboardShortcuts(mockOnOpenSearch, mockOnOpenQuickLog, mockOnOpenHelp));
    
    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    Object.defineProperty(event, 'target', { value: { tagName: 'BODY' }, enumerable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockOnOpenSearch).toHaveBeenCalled();
  });

  it('opens quick log on cmd+l', () => {
    renderHook(() => useKeyboardShortcuts(mockOnOpenSearch, mockOnOpenQuickLog, mockOnOpenHelp));
    
    const event = new KeyboardEvent('keydown', { key: 'l', metaKey: true });
    Object.defineProperty(event, 'target', { value: { tagName: 'BODY' }, enumerable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockOnOpenQuickLog).toHaveBeenCalled();
  });

  it('opens help on cmd+/', () => {
    renderHook(() => useKeyboardShortcuts(mockOnOpenSearch, mockOnOpenQuickLog, mockOnOpenHelp));
    
    const event = new KeyboardEvent('keydown', { key: '/', metaKey: true });
    Object.defineProperty(event, 'target', { value: { tagName: 'BODY' }, enumerable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockOnOpenHelp).toHaveBeenCalled();
  });

  it('marks hovered transaction as paid on shift+p', () => {
    (globalHover as any).currentHoveredTransactionId = 'tx-1';
    mockStore.transactions = [
      { id: 'tx-1', status: PaymentStatus.Due, lessonFee: 50 },
    ];
    
    renderHook(() => useKeyboardShortcuts(mockOnOpenSearch, mockOnOpenQuickLog, mockOnOpenHelp));
    
    const event = new KeyboardEvent('keydown', { key: 'p', shiftKey: true });
    Object.defineProperty(event, 'target', { value: { tagName: 'BODY' }, enumerable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockUpdateTransaction).toHaveBeenCalledWith('tx-1', {
      amountPaid: 50,
      status: PaymentStatus.Paid
    });
    expect(mockAddToast).toHaveBeenCalledWith('Transaction marked as paid!', 'success');
  });

  it('marks all due transactions for hovered student as paid on shift+p', () => {
    (globalHover as any).currentHoveredStudentId = 'student-1';
    mockStore.transactions = [
      { id: 'tx-1', studentId: 'student-1', status: PaymentStatus.Due, lessonFee: 50 },
      { id: 'tx-2', studentId: 'student-1', status: PaymentStatus.Due, lessonFee: 60 },
      { id: 'tx-3', studentId: 'student-2', status: PaymentStatus.Due, lessonFee: 40 },
    ];
    
    renderHook(() => useKeyboardShortcuts(mockOnOpenSearch, mockOnOpenQuickLog, mockOnOpenHelp));
    
    const event = new KeyboardEvent('keydown', { key: 'p', shiftKey: true });
    Object.defineProperty(event, 'target', { value: { tagName: 'BODY' }, enumerable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockUpdateTransaction).toHaveBeenCalledTimes(2);
    expect(mockUpdateTransaction).toHaveBeenCalledWith('tx-1', { amountPaid: 50, status: PaymentStatus.Paid });
    expect(mockUpdateTransaction).toHaveBeenCalledWith('tx-2', { amountPaid: 60, status: PaymentStatus.Paid });
    expect(mockAddToast).toHaveBeenCalledWith('Marked 2 lesson(s) as paid!', 'success');
  });
});

