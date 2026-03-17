/**
 * @file Badge.tsx
 * Defines the Badge component for status indicators.
 */

import React from 'react';
import { Icon, IconProps } from './Icon';

/**
 * Props for the Badge component.
 */
interface BadgeProps {
  /** Text content of the badge. */
  text: string;
  /** Color theme of the badge. Defaults to 'gray'. */
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'amber';
  /** Size of the badge. Defaults to 'md'. */
  size?: 'sm' | 'md';
  /** Optional icon name to display inside the badge, to the left of the text. */
  iconName?: IconProps['iconName'];
}

/**
 * A badge component for displaying status indicators, tags, or short, categorized information.
 * It supports various colors, sizes, and an optional leading icon.
 *
 * @param {BadgeProps} props - The properties for the Badge component.
 * @returns {React.ReactElement} A JSX element representing the badge.
 */
export const Badge: React.FC<BadgeProps> = ({ text, color = 'gray', size = 'md', iconName }) => {
  // Style mappings for different badge colors
  const colorStyles = {
    green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
    yellow: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
    red: 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20',
    blue: 'bg-sky-100 text-sky-800 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20',
    gray: 'bg-gray-100 text-gray-800 dark:bg-white/5 dark:text-gray-300 border border-gray-200 dark:border-white/10',
    amber: 'bg-accent/20 text-accent-dark dark:bg-accent/10 dark:text-accent border border-accent/30 dark:border-accent/20', // For gamification or special emphasis
  };
  // Style mappings for different badge sizes
  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center ${sizeStyles[size]} font-semibold rounded-full ${colorStyles[color]} shadow-sm`}>
      {iconName && <Icon iconName={iconName} className={`w-3.5 h-3.5 mr-1.5`} />}
      {text}
    </span>
  );
};