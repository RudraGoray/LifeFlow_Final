import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardRoute() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // For now, if the specific dashboard isn't built yet, we'll render a placeholder
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">{user?.role} Dashboard Workspace</h2>
        <p className="text-muted-gray">Welcome back, {user?.name}!</p>
      </div>
    </div>
  );
}
