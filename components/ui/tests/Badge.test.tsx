import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Badge } from '../Badge';
import '@testing-library/jest-dom';

// Mock the Icon component since we only care about the Badge in this test
vi.mock('../Icon', () => ({
  Icon: ({ iconName, className }: { iconName: string, className: string }) => (
    <svg data-testid={`icon-${iconName}`} className={className} />
  )
}));

describe('Badge Component', () => {
  it('renders correctly with default props', () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText('Default Badge');

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-primary'); // default variant
    expect(badge).toHaveClass('px-3'); // default size 'md'
  });

  it('renders correctly with specific variant', () => {
    render(<Badge variant="success">Success Badge</Badge>);
    const badge = screen.getByText('Success Badge');

    expect(badge).toHaveClass('bg-emerald-100');
    expect(badge).toHaveClass('text-emerald-800');
  });

  it('renders correctly with specific size', () => {
    render(<Badge size="sm">Small Badge</Badge>);
    const badge = screen.getByText('Small Badge');

    expect(badge).toHaveClass('px-2.5');
    expect(badge).toHaveClass('py-0.5');
    expect(badge).toHaveClass('text-xs');
  });

  it('renders with an icon when icon prop is provided', () => {
    render(<Badge icon="check-circle">Icon Badge</Badge>);

    expect(screen.getByTestId('icon-check-circle')).toBeInTheDocument();
    expect(screen.getByText('Icon Badge')).toBeInTheDocument();
  });

  it('supports legacy props for backwards compatibility', () => {
    render(<Badge text="Legacy Badge" color="green" iconName="star" />);

    expect(screen.getByTestId('icon-star')).toBeInTheDocument();
    const badge = screen.getByText('Legacy Badge');
    expect(badge).toHaveClass('bg-emerald-100');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom Class</Badge>);
    expect(screen.getByText('Custom Class')).toHaveClass('custom-class');
  });
});
