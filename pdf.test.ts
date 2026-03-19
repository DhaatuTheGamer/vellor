import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateInvoicePDF } from './pdf';
import { PaymentStatus } from './types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Mocks
const mockSave = vi.fn();
const mockText = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetTextColor = vi.fn();
const mockSplitTextToSize = vi.fn().mockReturnValue(['Some notes']);

vi.mock('jspdf', () => {
  return {
    default: class {
      save = mockSave;
      text = mockText;
      setFontSize = mockSetFontSize;
      setTextColor = mockSetTextColor;
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseTransaction = {
    id: 'tx123456789',
    studentId: 's1',
    date: '2023-10-15T10:00:00Z',
    lessonFee: 100,
    amountPaid: 50,
    lessonDuration: 60,
    status: PaymentStatus.PartiallyPaid,
  } as any;

  const baseStudent = {
    id: 's1',
    firstName: 'John',
    lastName: 'Doe',
    contact: { email: 'john@example.com' }
  } as any;

  const baseSettings = {
    currencySymbol: '$',
    userName: 'Tutor Name',
    email: 'tutor@example.com',
    phone: { countryCode: '+1', number: '555-1234' }
  } as any;

  it('generates PDF with full data', () => {
    generateInvoicePDF(baseTransaction, baseStudent, baseSettings);

    expect(autoTable).toHaveBeenCalled();
    expect(mockText).toHaveBeenCalledWith('INVOICE', 14, 20);
    expect(mockSave).toHaveBeenCalledWith('Invoice_John_2023-10-15.pdf');

    // Check contact info text
    expect(mockText).toHaveBeenCalledWith('tutor@example.com', 14, 67);
    expect(mockText).toHaveBeenCalledWith('+1 555-1234', 14, 72);
    expect(mockText).toHaveBeenCalledWith('john@example.com', 120, 67);
  });

  it('handles missing optional fields in settings and student', () => {
    const studentNoContact = { ...baseStudent, contact: {} };
    const settingsNoContact = { ...baseSettings, email: undefined, phone: undefined };

    generateInvoicePDF(baseTransaction, studentNoContact, settingsNoContact);

    expect(mockSave).toHaveBeenCalledWith('Invoice_John_2023-10-15.pdf');
    // Ensure that it doesn't throw and successfully reached the save call
    expect(mockText).not.toHaveBeenCalledWith('tutor@example.com', 14, 67);
    expect(mockText).not.toHaveBeenCalledWith('+1 555-1234', 14, 72);
    expect(mockText).not.toHaveBeenCalledWith('john@example.com', 120, 67);
  });

  it('formats status badge colors correctly for Paid', () => {
    const tx = { ...baseTransaction, status: PaymentStatus.Paid };
    generateInvoicePDF(tx, baseStudent, baseSettings);
    expect(mockSetTextColor).toHaveBeenCalledWith(16, 185, 129); // Success color
    expect(mockText).toHaveBeenCalledWith('STATUS: PAID', 14, 126);
  });

  it('formats status badge colors correctly for Overpaid', () => {
    const tx = { ...baseTransaction, status: PaymentStatus.Overpaid };
    generateInvoicePDF(tx, baseStudent, baseSettings);
    expect(mockSetTextColor).toHaveBeenCalledWith(16, 185, 129); // Success color
    expect(mockText).toHaveBeenCalledWith('STATUS: OVERPAID', 14, 126);
  });

  it('formats status badge colors correctly for Partially Paid', () => {
    const tx = { ...baseTransaction, status: PaymentStatus.PartiallyPaid };
    generateInvoicePDF(tx, baseStudent, baseSettings);
    expect(mockSetTextColor).toHaveBeenCalledWith(245, 158, 11); // Warning color
    expect(mockText).toHaveBeenCalledWith('STATUS: PARTIALLY PAID', 14, 126);
  });

  it('formats status badge colors correctly for Due', () => {
    const tx = { ...baseTransaction, status: PaymentStatus.Due };
    generateInvoicePDF(tx, baseStudent, baseSettings);
    expect(mockSetTextColor).toHaveBeenCalledWith(244, 63, 94); // Danger color
    expect(mockText).toHaveBeenCalledWith('STATUS: DUE', 14, 126);
  });

  it('renders notes if they exist', () => {
    const tx = { ...baseTransaction, notes: 'These are some long notes' };
    generateInvoicePDF(tx, baseStudent, baseSettings);
    expect(mockSplitTextToSize).toHaveBeenCalledWith('These are some long notes', 180);
    expect(mockText).toHaveBeenCalledWith('Notes:', 14, 140);
  });
});
