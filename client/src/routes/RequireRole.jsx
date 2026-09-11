import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RequireRole — three explicit states, no show-then-hide:
 *  1. loading      → session still being restored; render a splash, redirect nothing
 *  2. unauthorized → redirect WITH visible feedback (reason in location state,
 *                    surfaced as a banner on the login page)
 *  3. authorized   → render the protected content
 */
export default function RequireRole({ roles, children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-label="Verifying access">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary-crimson border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-gray dark:text-gray-400">Verifying access…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, reason: 'auth' }}
      />
    );
  }

  const allowed = Array.isArray(roles) ? roles : [roles];
  const userRole = (user?.role || '').toUpperCase();
  const isAllowed = allowed.some((r) => String(r).toUpperCase() === userRole);

  if (!isAllowed) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{ from: location.pathname, reason: 'role' }}
      />
    );
  }

  return children;
}
