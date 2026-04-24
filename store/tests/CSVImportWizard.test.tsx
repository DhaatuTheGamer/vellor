import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CSVImportWizard } from '../../components/students/CSVImportWizard';


// Mock useStore
vi.mock('../../store', () => ({
    useStore: vi.fn((selector) => {
        const mockStore = {
            addStudent: vi.fn(() => ({ id: 'new-id' })),
            updateStudent: vi.fn(),
            addTransaction: vi.fn(),
            addToast: vi.fn(),
            students: []
        };
        return selector(mockStore);
    })
}));

describe('CSVImportWizard', () => {
    it('renders the upload step initially', () => {
        render(<CSVImportWizard isOpen={true} onClose={() => {}} />);
        expect(screen.getByText('Upload CSV File')).toBeInTheDocument();
    });

    it('transitions to mapping step after file upload', async () => {
        render(<CSVImportWizard isOpen={true} onClose={() => {}} />);
        
        const file = new File(['First Name,Email\nJohn,john@example.com'], 'students.csv', { type: 'text/csv' });
        const input = screen.getByLabelText(/Choose CSV File/i);
        
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText(/map your columns/i)).toBeInTheDocument();
        });
        expect(screen.getByText('First Name (Required)')).toBeInTheDocument();
    });

    it('completes the full import flow and shows summary', async () => {
        render(<CSVImportWizard isOpen={true} onClose={() => {}} />);
        
        const csvContent = 'First Name,Email,Paid\nJohn,john@example.com,50\nJane,jane@example.com,invalid';
        const file = new File([csvContent], 'students.csv', { type: 'text/csv' });
        const input = screen.getByLabelText(/Choose CSV File/i);
        
        fireEvent.change(input, { target: { files: [file] } });

        // Step 2: Mapping
        const importBtn = await screen.findByRole('button', { name: /Import Data/i });
        fireEvent.click(importBtn);

        // Step 3: Summary
        const summaryHeader = await screen.findByText(/Import Complete/i);
        expect(summaryHeader).toBeInTheDocument();
        expect(screen.getByText(/Successfully imported 2 records/i)).toBeInTheDocument();
    });
});
