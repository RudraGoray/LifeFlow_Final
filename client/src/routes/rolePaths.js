/**
 * Maps an account role to its landing dashboard.
 * Single source of truth used by Login and DashboardRoute.
 */
export function dashboardPathForRole(role) {
  switch (String(role || '').toUpperCase()) {
    case 'HOSPITAL':
      return '/dashboard/hospital';
    case 'NGO':
      return '/dashboard/ngo';
    case 'BLOODBANK':
      return '/dashboard/bloodbank';
    default:
      return null;
  }
}
