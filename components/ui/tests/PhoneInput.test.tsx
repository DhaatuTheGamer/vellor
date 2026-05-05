import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PhoneInput } from '../PhoneInput';

describe('PhoneInput component', () => {
  it('renders correctly with default props', () => {
    const onChange = vi.fn();
    render(
      <PhoneInput
        name="phone"
        label="Phone Number"
        value={{ countryCode: '+1', number: '1234567890' }}
        onChange={onChange}
      />
    );

    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: 'Phone number' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('1234567890');
  });

  it('renders correctly without a label', () => {
    const onChange = vi.fn();
    render(
      <PhoneInput
        name="phone"
        value={{ countryCode: '+44', number: '9876543210' }}
        onChange={onChange}
      />
    );

    expect(screen.queryByLabelText('Phone Number')).not.toBeInTheDocument();
    expect(screen.getByText('+44')).toBeInTheDocument();
  });

  it('calls onChange with correctly formatted numeric value', () => {
    const onChange = vi.fn();
    render(
      <PhoneInput
        name="phone"
        value={{ countryCode: '+1', number: '' }}
        onChange={onChange}
      />
    );

    const input = screen.getByRole('textbox', { name: 'Phone number' });

    // Type numbers
    fireEvent.change(input, { target: { value: '123' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('phone', { countryCode: '+1', number: '123' });

    // Type non-numeric characters mixed with numbers
    fireEvent.change(input, { target: { value: '123-abc-456' } });
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenCalledWith('phone', { countryCode: '+1', number: '123456' });
  });

  it('truncates input to 10 digits', () => {
    const onChange = vi.fn();
    render(
      <PhoneInput
        name="phone"
        value={{ countryCode: '+1', number: '' }}
        onChange={onChange}
      />
    );

    const input = screen.getByRole('textbox', { name: 'Phone number' });

    // Type more than 10 digits
    fireEvent.change(input, { target: { value: '1234567890123' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('phone', { countryCode: '+1', number: '1234567890' });
  });

  it('applies custom wrapperClassName', () => {
    const onChange = vi.fn();
    const { container } = render(
      <PhoneInput
        name="phone"
        value={{ countryCode: '+1', number: '' }}
        onChange={onChange}
        wrapperClassName="custom-wrapper-class"
      />
    );

    // First child of container should have the wrapper class
    expect(container.firstChild).toHaveClass('custom-wrapper-class');
  });
});
