import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateInvoicePDF, generateProgressReportPDF, generateBulkInvoicePDF } from './pdf';
import { PaymentStatus, AttendanceStatus } from './types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Mock jsPDF and autotable globally
const mockJsPDFInstance = {
  addImage: vi.fn(),
  setFontSize: vi.fn(),
  setFont: vi.fn(),
  setTextColor: vi.fn(),
  text: vi.fn(),
  splitTextToSize: vi.fn((text, size) => [text]),
  output: vi.fn(() => new Blob(['mock-pdf'], { type: 'application/pdf' })),
  save: vi.fn(),
  addPage: vi.fn(),
  lastAutoTable: { finalY: 100 },
};

vi.mock('jspdf', () => {
  return {
    default: vi.fn().mockImplementation(function() { return mockJsPDFInstance; })
  };
});

vi.mock('jspdf-autotable', () => {
  return { default: vi.fn() };
});

describe('PDF Generation', () => {
  let mockDoc: typeof mockJsPDFInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDoc = mockJsPDFInstance;
  });

  const mockTransaction = {
    id: 'tx-123',
    studentId: 'student-1',
    date: '2023-10-27T10:00:00Z',
    lessonDuration: 60,
    lessonFee: 50,
    amountPaid: 50,
    status: PaymentStatus.Paid,
    createdAt: '2023-10-27T10:00:00Z',
  };

  const mockStudent = {
    id: 'student-1',
    firstName: 'John',
    lastName: 'Doe',
    contact: { email: 'john@example.com' },
    tuition: { subjects: ['Math'], defaultRate: 50, rateType: 'hourly' as const, typicalLessonDuration: 60 },
    createdAt: '2023-01-01T00:00:00Z',
  };

  const mockSettings = {
    theme: 'light' as const,
    currencySymbol: '$',
    userName: 'Jane Tutor',
    email: 'jane@example.com',
    phone: { countryCode: '+1', number: '555-1234' },
    invoiceTemplate: 'modern' as const,
    brandColor: '#ff0000',
    invoiceLogoBase64: 'data:image/jpeg;base64,mocklogo',
  };

  describe('generateInvoicePDF', () => {
    it('should generate an invoice with modern template', () => {
      generateInvoicePDF(mockTransaction, mockStudent, mockSettings);

      expect(jsPDF).toHaveBeenCalled();
      expect(mockDoc.addImage).toHaveBeenCalledWith(
        mockSettings.invoiceLogoBase64, 'JPEG', 14, 10, 30, 30, undefined, 'FAST'
      );

      // Modern template checks
      expect(mockDoc.setFontSize).toHaveBeenCalledWith(24);
      expect(mockDoc.setTextColor).toHaveBeenCalledWith(mockSettings.brandColor);
      expect(mockDoc.text).toHaveBeenCalledWith('INVOICE', 14, 45); // Y=45 because logo was added

      expect(mockDoc.text).toHaveBeenCalledWith(expect.stringContaining('Invoice ID:'), 14, expect.any(Number));
      expect(autoTable).toHaveBeenCalled();

      expect(mockDoc.save).toHaveBeenCalledWith(`Invoice_${mockStudent.firstName}_${mockTransaction.date.split('T')[0]}.pdf`);
    });

    it('should generate an invoice with classic template', () => {
      generateInvoicePDF(mockTransaction, mockStudent, { ...mockSettings, invoiceTemplate: 'classic' });

      expect(mockDoc.setFontSize).toHaveBeenCalledWith(22);
      expect(mockDoc.setFont).toHaveBeenCalledWith('times', 'bold');
      expect(mockDoc.text).toHaveBeenCalledWith('INVOICE', 14, 45);

      expect(autoTable).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0] }
      }));
    });

    it('should generate an invoice with minimal template', () => {
      generateInvoicePDF(mockTransaction, mockStudent, { ...mockSettings, invoiceTemplate: 'minimal' });

      expect(mockDoc.setFontSize).toHaveBeenCalledWith(16);
      expect(mockDoc.text).toHaveBeenCalledWith('INVOICE', 14, 45);

      expect(autoTable).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        theme: 'plain',
        headStyles: { fillColor: [200, 200, 200], textColor: 0 }
      }));
    });

    it('should handle missing logo edge case', () => {
      generateInvoicePDF(mockTransaction, mockStudent, { ...mockSettings, invoiceLogoBase64: undefined, brandLogoBase64: undefined });

      // Default logo is in the code `DEFAULT_VELLOR_LOGO_BASE64`
      expect(mockDoc.addImage).toHaveBeenCalled();
    });

    it('should return Blob when returnBlob is true', () => {
      const blob = generateInvoicePDF(mockTransaction, mockStudent, mockSettings, true);

      expect(mockDoc.output).toHaveBeenCalledWith('blob');
      expect(blob).toBeInstanceOf(Blob);
      expect(mockDoc.save).not.toHaveBeenCalled();
    });

    it('should render appropriate color for different payment statuses', () => {
      generateInvoicePDF({ ...mockTransaction, status: PaymentStatus.Paid }, mockStudent, mockSettings);
      expect(mockDoc.setTextColor).toHaveBeenCalledWith(16, 185, 129); // Paid green
      expect(mockDoc.text).toHaveBeenCalledWith('STATUS: PAID', 14, expect.any(Number));

      generateInvoicePDF({ ...mockTransaction, status: PaymentStatus.PartiallyPaid }, mockStudent, mockSettings);
      expect(mockDoc.setTextColor).toHaveBeenCalledWith(245, 158, 11); // Partially Paid orange

      generateInvoicePDF({ ...mockTransaction, status: PaymentStatus.Due }, mockStudent, mockSettings);
      expect(mockDoc.setTextColor).toHaveBeenCalledWith(244, 63, 94); // Due red
    });

    it('should render notes if transaction has notes', () => {
      generateInvoicePDF({ ...mockTransaction, notes: 'Some important notes here' }, mockStudent, mockSettings);
      expect(mockDoc.text).toHaveBeenCalledWith('Notes:', 14, expect.any(Number));
      expect(mockDoc.splitTextToSize).toHaveBeenCalledWith('Some important notes here', 180);
    });
  });

  describe('generateProgressReportPDF', () => {
    const mockReportTransactions = [
      { ...mockTransaction, date: '2023-11-01T10:00:00Z', grade: 'A', progressRemark: 'Excellent work' },
      { ...mockTransaction, date: '2023-10-15T10:00:00Z', grade: 'B+', progressRemark: 'Good progress' },
      { ...mockTransaction, date: '2023-10-01T10:00:00Z', id: 'tx-no-remark' }, // should be filtered out if no grade/remark
    ];

    it('should generate a progress report with student details and transactions', () => {
      generateProgressReportPDF(mockStudent, mockReportTransactions, mockSettings, 'Great student!');

      expect(jsPDF).toHaveBeenCalled();
      expect(mockDoc.text).toHaveBeenCalledWith('PROGRESS REPORT', 14, 45); // Due to logo
      expect(mockDoc.text).toHaveBeenCalledWith(expect.stringContaining('Generated:'), 14, expect.any(Number));
      expect(mockDoc.text).toHaveBeenCalledWith(`${mockStudent.firstName} ${mockStudent.lastName}`, 14, expect.any(Number));

      expect(mockDoc.text).toHaveBeenCalledWith('Teacher Note:', 14, expect.any(Number));
      expect(mockDoc.splitTextToSize).toHaveBeenCalledWith('Great student!', 180);

      expect(autoTable).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        head: [['Date', 'Grade', 'Remarks']],
        body: expect.arrayContaining([
          expect.arrayContaining([expect.any(String), 'A', 'Excellent work']),
          expect.arrayContaining([expect.any(String), 'B+', 'Good progress']),
        ])
      }));
      // ensure the one without grade/remark is filtered
      const callArgs = vi.mocked(autoTable).mock.calls[0][1] as any;
      expect(callArgs.body.length).toBe(2);

      expect(mockDoc.save).toHaveBeenCalledWith(`ProgressReport_${mockStudent.firstName}_${new Date().toISOString().split('T')[0]}.pdf`);
    });

    it('should generate report without parent note and without transactions', () => {
      generateProgressReportPDF(mockStudent, [], mockSettings, '');

      expect(mockDoc.text).not.toHaveBeenCalledWith('Teacher Note:', 14, expect.any(Number));
      expect(mockDoc.text).toHaveBeenCalledWith('No progress records found.', 14, expect.any(Number));
      expect(autoTable).not.toHaveBeenCalled();
    });

    it('should handle alternative templates', () => {
      generateProgressReportPDF(mockStudent, mockReportTransactions, { ...mockSettings, invoiceTemplate: 'classic' }, 'Note');

      expect(mockDoc.setTextColor).toHaveBeenCalledWith(0); // Classic template color check
      expect(autoTable).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0] }
      }));
    });
  });

  describe('generateBulkInvoicePDF', () => {
    const mockStudents = [
      mockStudent,
      { ...mockStudent, id: 'student-2', firstName: 'Alice' }
    ];

    const mockBulkTransactions = [
      { ...mockTransaction, studentId: 'student-1', status: PaymentStatus.Due, lessonFee: 100, amountPaid: 0 },
      { ...mockTransaction, studentId: 'student-1', status: PaymentStatus.PartiallyPaid, lessonFee: 50, amountPaid: 20 },
      { ...mockTransaction, studentId: 'student-2', status: PaymentStatus.Due, lessonFee: 80, amountPaid: 0 },
      { ...mockTransaction, studentId: 'student-2', status: PaymentStatus.Paid, lessonFee: 60, amountPaid: 60 }, // Should be ignored
    ];

    it('should generate bulk invoices for unpaid/partially paid transactions', () => {
      const result = generateBulkInvoicePDF(mockStudents, mockBulkTransactions, mockSettings);

      expect(result).toBe(true);
      expect(jsPDF).toHaveBeenCalled();

      // Should add a page for the second student
      expect(mockDoc.addPage).toHaveBeenCalledTimes(1);

      // AutoTable should be called twice (once for each student with unpaid transactions)
      expect(autoTable).toHaveBeenCalledTimes(2);

      // Verify total due for student 1 (100-0 + 50-20 = 130)
      expect(mockDoc.text).toHaveBeenCalledWith(expect.stringContaining('130.00'), 180, expect.any(Number), { align: 'right' });

      // Verify total due for student 2 (80-0 = 80)
      expect(mockDoc.text).toHaveBeenCalledWith(expect.stringContaining('80.00'), 180, expect.any(Number), { align: 'right' });

      expect(mockDoc.save).toHaveBeenCalledWith(`Monthly_Invoices_${new Date().toISOString().split('T')[0]}.pdf`);
    });

    it('should return false if there are no unpaid transactions', () => {
      const allPaidTransactions = [
        { ...mockTransaction, studentId: 'student-1', status: PaymentStatus.Paid },
        { ...mockTransaction, studentId: 'student-2', status: PaymentStatus.Overpaid },
      ];

      const result = generateBulkInvoicePDF(mockStudents, allPaidTransactions, mockSettings);

      expect(result).toBe(false);
      expect(mockDoc.save).not.toHaveBeenCalled();
    });

    it('should skip students without unpaid transactions or that dont exist', () => {
      const transactions = [
        { ...mockTransaction, studentId: 'student-not-exist', status: PaymentStatus.Due }, // student doesn't exist in array
      ];

      const result = generateBulkInvoicePDF(mockStudents, transactions, mockSettings);

      expect(result).toBe(false); // Since the student is not found, nothing is generated
    });

    it('should handle missing logo in bulk invoice', () => {
       generateBulkInvoicePDF(mockStudents, mockBulkTransactions, { ...mockSettings, invoiceLogoBase64: undefined, brandLogoBase64: undefined });
       expect(mockDoc.addImage).toHaveBeenCalled(); // Should use default logo
    });

    it('should use minimal template in bulk invoice', () => {
       generateBulkInvoicePDF(mockStudents, mockBulkTransactions, { ...mockSettings, invoiceTemplate: 'minimal' });

       expect(mockDoc.setFontSize).toHaveBeenCalledWith(16);
       expect(mockDoc.text).toHaveBeenCalledWith('MONTHLY STATEMENT', 14, 45); // Due to logo
       expect(autoTable).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ theme: 'plain' }));
    });
  });
});
