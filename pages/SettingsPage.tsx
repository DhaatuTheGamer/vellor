import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/ui';

/**
 * Redirects users from the old /settings path to the new /profile path.
 */
export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/profile', { replace: true });
  }, [navigate]);

  return (
    <div className="flex flex-col justify-center items-center h-full text-center p-4">
        <Icon iconName="cog" className="w-12 h-12 text-gray-400 animate-spin mb-4" />
        <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Redirecting...</h1>
        <p className="text-gray-600 dark:text-gray-400">Moving you to the new Profile & Settings page.</p>
    </div>
  );
};