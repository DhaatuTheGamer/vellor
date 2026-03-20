import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateInvoicePDF } from './pdf';
import { Transaction, Student, AppSettings, PaymentStatus, Theme } from './types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Mock the dependencies
const mockText = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetTextColor = vi.fn();
const mockSave = vi.fn();
const mockSplitTextToSize = vi.fn().mockImplementation((text) => [text]); // Mock returning array of strings

vi.mock('jspdf', () => {
  return {
    default: class {
      text = mockText;
      setFontSize = mockSetFontSize;
      setTextColor = mockSetTextColor;
      save = mockSave;
      splitTextToSize = mockSplitTextToSize;
      lastAutoTable = { finalY: 100 };
    }
  };
});

vi.mock('jspdf-autotable', () => {
  return {
    default: vi.fn()
  };
});

describe('generateInvoicePDF', () => {
  const mockTransaction: Transaction = {
    id: 'tx-1234567890',
    studentId: 'st-1',
    date: '2024-05-15T10:00:00.000Z',
    lessonDuration: 60,
    lessonFee: 100,
    amountPaid: 100,
    status: PaymentStatus.Paid,
    notes: 'Great lesson!',
    createdAt: '2024-05-15T10:00:00.000Z'
  };

  const mockStudent: Student = {
    id: 'st-1',
    firstName: 'John',
    lastName: 'Doe',
    contact: { email: 'john@example.com' },
    tuition: {
      subjects: ['Math'],
      defaultRate: 100,
      rateType: 'hourly',
      typicalLessonDuration: 60
    },
    createdAt: '2024-05-01T10:00:00.000Z'
  };

  const mockSettings: AppSettings = {
    theme: Theme.Light,
    currencySymbol: '$',
    userName: 'Jane Tutor',
    email: 'jane@example.com',
    phone: { countryCode: '+1', number: '555-0100' }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates and saves PDF with correct filename', () => {
    generateInvoicePDF(mockTransaction, mockStudent, mockSettings);
    expect(mockSave).toHaveBeenCalledWith('Invoice_John_2024-05-15.pdf');
  });

  it('includes basic invoice details', () => {
    generateInvoicePDF(mockTransaction, mockStudent, mockSettings);
    expect(mockText).toHaveBeenCalledWith('INVOICE', 14, 20);
    expect(mockText).toHaveBeenCalledWith('Invoice ID: TX-12345', 14, 30);
    // Note: Date formatting depends on local timezone of the test runner, so exact match might be tricky,
    // but we can check if it calls text with something containing 'Date: '
    expect(mockText).toHaveBeenCalledWith(expect.stringContaining('Date: '), 14, 35);
  });

  it('includes tutor and student details', () => {
    generateInvoicePDF(mockTransaction, mockStudent, mockSettings);
    expect(mockText).toHaveBeenCalledWith('Jane Tutor', 14, 62);
    expect(mockText).toHaveBeenCalledWith('jane@example.com', 14, 67);
    expect(mockText).toHaveBeenCalledWith('+1 555-0100', 14, 72);

    expect(mockText).toHaveBeenCalledWith('John Doe', 120, 62);
    expect(mockText).toHaveBeenCalledWith('john@example.com', 120, 67);
  });

  it('calls autoTable with correct data', () => {
    generateInvoicePDF(mockTransaction, mockStudent, mockSettings);
    expect(autoTable).toHaveBeenCalledWith(expect.any(Object), {
      startY: 85,
      head: [['Description', 'Duration/Period', 'Fee', 'Amount']],
      body: [
        [
          'Tutoring Lesson / Package',
          '60 mins/units',
          '$100',
          '$100'
        ]
      ],
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246] },
    });
  });

  it('renders notes when present', () => {
    generateInvoicePDF(mockTransaction, mockStudent, mockSettings);
    expect(mockText).toHaveBeenCalledWith('Notes:', 14, 140); // finalY is 110, + 30
    expect(mockSplitTextToSize).toHaveBeenCalledWith('Great lesson!', 180);
  });

  it('does not render notes section when notes are empty', () => {
    const noNotesTransaction = { ...mockTransaction, notes: undefined };
    generateInvoicePDF(noNotesTransaction, mockStudent, mockSettings);
    expect(mockText).not.toHaveBeenCalledWith('Notes:', expect.anything(), expect.anything());
    expect(mockSplitTextToSize).not.toHaveBeenCalled();
  });

  it('renders correct status color for Paid', () => {
    generateInvoicePDF(mockTransaction, mockStudent, mockSettings);
    expect(mockSetTextColor).toHaveBeenCalledWith(16, 185, 129); // Success color for Paid
    expect(mockText).toHaveBeenCalledWith('STATUS: PAID', 14, 126);
  });

  it('renders correct status color for PartiallyPaid', () => {
    const partialTransaction = { ...mockTransaction, status: PaymentStatus.PartiallyPaid, amountPaid: 50 };
    generateInvoicePDF(partialTransaction, mockStudent, mockSettings);
    expect(mockSetTextColor).toHaveBeenCalledWith(245, 158, 11); // Warning color
    expect(mockText).toHaveBeenCalledWith('STATUS: PARTIALLY PAID', 14, 126);
  });

  it('renders correct status color for Due', () => {
    const dueTransaction = { ...mockTransaction, status: PaymentStatus.Due, amountPaid: 0 };
    generateInvoicePDF(dueTransaction, mockStudent, mockSettings);
    expect(mockSetTextColor).toHaveBeenCalledWith(244, 63, 94); // Danger color
    expect(mockText).toHaveBeenCalledWith('STATUS: DUE', 14, 126);
  });

  it('calculates and renders correct balance due', () => {
    const dueTransaction = { ...mockTransaction, amountPaid: 40 };
    generateInvoicePDF(dueTransaction, mockStudent, mockSettings);
    expect(mockText).toHaveBeenCalledWith('Balance Due:', 140, 126);
    expect(mockText).toHaveBeenCalledWith('$60', 180, 126, { align: 'right' });
    expect(mockSetTextColor).toHaveBeenCalledWith(220, 38, 38); // Balance > 0 color check
  });
});
