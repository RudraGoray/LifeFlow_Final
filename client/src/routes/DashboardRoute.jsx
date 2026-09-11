import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardPathForRole } from './rolePaths';

export default function DashboardRoute() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Send each account type to its own dashboard. Unknown roles fall
  // through to this placeholder instead of redirecting (avoids loops).
  const target = dashboardPathForRole(user?.role);
  if (target) return <Navigate to={target} replace />;

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">{user?.role} Dashboard Workspace</h2>
        <p className="text-muted-gray">Welcome back, {user?.name}!</p>
      </div>
    </div>
  );
}
