import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateProgressReportPDF, generateBulkInvoicePDF } from '../../pdf';
import { Student, Transaction, AppSettings, PaymentStatus } from '../../types';

// Properly mock jsPDF as a class
const mockJsPDFInstance = {
  addImage: vi.fn(),
  setFontSize: vi.fn(),
  setFont: vi.fn(),
  setTextColor: vi.fn(),
  text: vi.fn(),
  splitTextToSize: vi.fn((text) => [text]),
  addPage: vi.fn(),
  save: vi.fn(),
  output: vi.fn(),
  lastAutoTable: { finalY: 100 }
};

vi.mock('jspdf', () => {
  return {
    default: class MockJsPDF {
      constructor() {
        return mockJsPDFInstance;
      }
    }
  };
});

vi.mock('jspdf-autotable', () => {
  return { default: vi.fn() };
});

describe('pdf.ts utilities', () => {
  let mockStudent: Student;
  let mockTransaction: Transaction;
  let mockSettings: AppSettings;

  beforeEach(() => {
    vi.clearAllMocks();

    mockStudent = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      contact: {},
      tuition: { subjects: [], defaultRate: 50, rateType: 'hourly', typicalLessonDuration: 60 },
      createdAt: new Date().toISOString()
    };

    mockTransaction = {
      id: 'tx1',
      studentId: '1',
      date: new Date().toISOString(),
      lessonDuration: 60,
      lessonFee: 50,
      amountPaid: 50,
      status: PaymentStatus.Paid,
      createdAt: new Date().toISOString()
    };

    mockSettings = {
      theme: 'light' as any,
      currencySymbol: '$',
      userName: 'Jane Tutor',
    };
  });

  it('should generate a progress report PDF and save', () => {
    generateProgressReportPDF(mockStudent, [mockTransaction], mockSettings, 'Great job!');

    expect(mockJsPDFInstance.save).toHaveBeenCalled();
    expect(mockJsPDFInstance.save).toHaveBeenCalledWith(expect.stringContaining('ProgressReport_John_'));
  });

  it('should return false when generating bulk invoice PDF without unpaid transactions', () => {
    const result = generateBulkInvoicePDF([mockStudent], [mockTransaction], mockSettings);
    expect(result).toBe(false);
  });

  it('should generate a bulk invoice PDF and return true when unpaid transactions exist', () => {
    const unpaidTransaction = { ...mockTransaction, amountPaid: 0, status: PaymentStatus.Due };

    const result = generateBulkInvoicePDF([mockStudent], [unpaidTransaction], mockSettings);

    expect(result).toBe(true);
    expect(mockJsPDFInstance.save).toHaveBeenCalled();
    expect(mockJsPDFInstance.save).toHaveBeenCalledWith(expect.stringContaining('Monthly_Invoices_'));
  });
});
