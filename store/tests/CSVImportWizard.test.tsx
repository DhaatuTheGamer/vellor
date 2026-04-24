import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CSVImportWizard } from '../../components/students/CSVImportWizard';
import React from 'react';

// Mock useStore
vi.mock('../../store', () => ({
    useStore: vi.fn((selector) => {
        // Return mock functions for addStudent, addToast
        const mockStore = {
            addStudent: vi.fn(),
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

        // Wait for FileReader to process and step to change
        const mappingText = await screen.findByText(/map your columns/i);
        expect(mappingText).toBeInTheDocument();
        expect(screen.getByText('First Name (Required)')).toBeInTheDocument();
    });
});
