import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar component', () => {
  it('renders correctly with default props', () => {
    // @ts-ignore: testing against intended source of truth
    render(<ProgressBar progress={50} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveClass('bg-accent'); // assuming default color
  });

  it('clamps negative progress to 0', () => {
    // @ts-ignore
    render(<ProgressBar progress={-10} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps progress > 100 to 100', () => {
    // @ts-ignore
    render(<ProgressBar progress={150} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
  });

  it('applies custom color', () => {
    // @ts-ignore
    render(<ProgressBar progress={30} color="bg-red-500" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveClass('bg-red-500');
    expect(progressbar).not.toHaveClass('bg-accent');
  });
});
