import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionStatusBadge } from '../TransactionStatusBadge';
import { PaymentStatus } from '../../../types';
import '@testing-library/jest-dom';

// The actual code doesn't use lucide-react or react-i18next despite the issue description.
// It uses Badge from ui and getPaymentStatusColor from helpers.

// Mock the dependencies
vi.mock('../../../helpers', () => ({
  getPaymentStatusColor: vi.fn((status) => {
    switch (status) {
      case 'Paid': return 'green';
      case 'Partially Paid': return 'yellow';
      case 'Due': return 'red';
      case 'Overpaid': return 'amber';
      default: return 'gray';
    }
  }),
}));

vi.mock('../../ui', () => ({
  Badge: ({ text, color }: { text: string; color: string }) => (
    <span data-testid={`badge-${color}`}>{text}</span>
  ),
}));

describe('TransactionStatusBadge', () => {
  it('renders correctly for Paid status', () => {
    render(<TransactionStatusBadge status={PaymentStatus.Paid} />);
    const badge = screen.getByTestId('badge-green');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(PaymentStatus.Paid);
  });

  it('renders correctly for Partially Paid status', () => {
    render(<TransactionStatusBadge status={PaymentStatus.PartiallyPaid} />);
    const badge = screen.getByTestId('badge-yellow');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(PaymentStatus.PartiallyPaid);
  });

  it('renders correctly for Due status', () => {
    render(<TransactionStatusBadge status={PaymentStatus.Due} />);
    const badge = screen.getByTestId('badge-red');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(PaymentStatus.Due);
  });

  it('renders correctly for Overpaid status', () => {
    render(<TransactionStatusBadge status={PaymentStatus.Overpaid} />);
    const badge = screen.getByTestId('badge-amber');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(PaymentStatus.Overpaid);
  });

  it('renders correctly for Scheduled status', () => {
    render(<TransactionStatusBadge status={PaymentStatus.Scheduled} />);
    const badge = screen.getByTestId('badge-gray');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(PaymentStatus.Scheduled);
  });
});
