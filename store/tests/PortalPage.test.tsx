import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { PortalPage } from '../../pages/PortalPage';

// Mock components that might be problematic in tests
vi.mock('../../components/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../components/ui')>();
  return {
    ...actual,
    Icon: ({ iconName, className }: any) => <span data-testid={`icon-${iconName}`} className={className} />,
  };
});

describe('PortalPage', () => {
  const testData = {
    tutorName: 'John Doe',
    currencySymbol: '$',
    student: {
      firstName: 'Jane',
      lastName: 'Smith',
      subjects: ['Math', 'Science'],
    },
    transactions: [
      {
        id: '1',
        date: new Date().toISOString(),
        lessonFee: 50,
        amountPaid: 0,
        status: 'Due',
        grade: 'A',
        progressRemark: 'Good progress',
      },
    ],
  };

  const encodedData = btoa(encodeURIComponent(JSON.stringify(testData)));

  it('renders "Invalid Link" when no data is provided', () => {
    render(
      <MemoryRouter initialEntries={['/portal']}>
        <PortalPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Invalid Link')).toBeInTheDocument();
    expect(screen.getByText(/This portal link is invalid or corrupted/i)).toBeInTheDocument();
  });

  it('renders "Invalid Link" when corrupted data is provided', () => {
    render(
      <MemoryRouter initialEntries={['/portal?data=corrupted']}>
        <PortalPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Invalid Link')).toBeInTheDocument();
  });

  it('renders portal content correctly with valid data', () => {
    render(
      <MemoryRouter initialEntries={[`/portal?data=${encodedData}`]}>
        <PortalPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Jane's Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Managed by/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText('Math')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument(); // Outstanding Balance
    expect(screen.getByText('Good progress')).toBeInTheDocument();
    expect(screen.getByText(/Grade: A/i)).toBeInTheDocument();
  });
});
