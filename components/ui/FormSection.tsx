import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Icon, IconProps } from './Icon';

export interface FormSectionProps {
  title: string;
  icon: IconProps['iconName'];
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, icon, children, className }) => {
  return (
    <div className={twMerge("bg-gray-50 dark:bg-primary/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4", className)}>
      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
        <Icon iconName={icon} className="w-4 h-4" />
        {title}
      </h4>
      {children}
    </div>
  );
};
