
/**
 * @file PhoneInput.tsx
 * Defines a composite input component for phone numbers with country codes.
 */

import React from 'react';
import { Input } from './Input';
import { PhoneNumber } from '../../types';

/**
 * Props for the PhoneInput component.
 */
interface PhoneInputProps {
  /** Label text for the input field. */
  label?: string;
  /** The name attribute for the input, used for form handling. */
  name: string;
  /** The current value of the phone number object. */
  value: PhoneNumber;
  /** Callback function when the phone number (code or number) changes. */
  onChange: (name: string, value: PhoneNumber) => void;
  /** Optional CSS class for the wrapper div. */
  wrapperClassName?: string;
}

/**
 * A composite input component for entering phone numbers, including a dropdown for country codes.
 *
 * @param {PhoneInputProps} props - The properties for the PhoneInput component.
 * @returns {React.ReactElement} A JSX element representing the combined phone input field.
 */
export const PhoneInput: React.FC<PhoneInputProps> = ({ label, name, value, onChange, wrapperClassName = '' }) => {
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters and limit to 10 digits
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
    onChange(name, { ...value, number: numericValue });
  };
  
  return (
    <div className={wrapperClassName}>
      {label && <label htmlFor={`${name}.number`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">{label}</label>}
      <div className="flex items-center">
        <span className="inline-flex items-center px-4 py-3 rounded-l-2xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm dark:bg-primary/50 dark:border-white/10 dark:text-gray-400 font-medium">
          {value.countryCode}
        </span>
        <Input
          id={`${name}.number`}
          name={`${name}.number`}
          type="tel"
          value={value.number}
          onChange={handleNumberChange}
          className="rounded-l-none border-l-0 focus:ring-0 focus:border-gray-200 dark:focus:border-white/10"
          wrapperClassName="flex-1"
          placeholder="Phone number"
          aria-label="Phone number"
          inputMode="numeric"
          pattern="[0-9]{10}"
          maxLength={10}
        />
      </div>
    </div>
  );
};
