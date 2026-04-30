import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '../../store';
import { WelcomePage } from '../../pages/WelcomePage';
import { AppLayout } from './AppLayout';

export const AppContent: React.FC = () => {
  const settings = useStore(s => s.settings);

  // If the user hasn't set their name yet (i.e., it's still the default),
  // show the welcome page and restrict access to other parts of the app.
  if (!settings.userName) {
    return (
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        {/* Redirect any other path to the welcome page */}
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    );
  }

  // Otherwise, the user is set up, so show the main app layout.
  return <AppLayout />;
};
