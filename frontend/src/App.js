import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import '@/App.css';

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';
import { Dashboard } from './pages/Dashboard';
import { PetProfile } from './pages/PetProfile';
import { DailyLog } from './pages/DailyLog';
import { WeeklyInsights } from './pages/WeeklyInsights';
import { CareSummary } from './pages/CareSummary';
import { Reminders } from './pages/Reminders';

function AppRouter() {
  const location = useLocation();

  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/pet/:petId"
        element={
          <ProtectedRoute>
            <PetProfile />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/log/:petId"
        element={
          <ProtectedRoute>
            <DailyLog />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/insights/:petId"
        element={
          <ProtectedRoute>
            <WeeklyInsights />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/summary/:petId"
        element={
          <ProtectedRoute>
            <CareSummary />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reminders"
        element={
          <ProtectedRoute>
            <Reminders />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}

export default App;
