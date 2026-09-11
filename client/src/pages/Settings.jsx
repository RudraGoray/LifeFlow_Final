import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, ShieldCheck, Palette, LogOut, Sun, Moon, Building2, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { dashboardPathForRole } from '../routes/rolePaths';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import PageHeader from '../components/dashboard/PageHeader';

const ROLE_BADGE = {
  HOSPITAL: 'danger',
  NGO: 'info',
  BLOODBANK: 'success',
  ADMIN: 'default',
};

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = dashboardPathForRole(user?.role) || '/dashboard';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, appearance and session."
      />

      {/* Profile */}
      <Card>
        <h3 className="text-lg font-bold text-charcoal dark:text-white mb-4 flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-crimson" /> Profile
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary-crimson text-white flex items-center justify-center font-bold text-2xl flex-shrink-0">
            {(user?.name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-bold text-charcoal dark:text-white">{user?.name || '—'}</span>
              <Badge variant={ROLE_BADGE[user?.role] || 'default'}>{user?.role || 'UNKNOWN'}</Badge>
            </div>
            <p className="text-sm text-muted-gray dark:text-gray-400 mt-0.5">{user?.email || '—'}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-gray dark:text-gray-400">
              {(user?.orgName || user?.orgId) && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" /> {user.orgName || user.orgId}
                </span>
              )}
              {user?.cityDistrict && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {user.cityDistrict}{user?.state ? `, ${user.state}` : ''}
                </span>
              )}
            </div>
          </div>
          <Link to={dashboardPath}>
            <Button variant="secondary" size="sm">Back to Dashboard</Button>
          </Link>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <h3 className="text-lg font-bold text-charcoal dark:text-white mb-1 flex items-center gap-2">
          <Palette className="h-5 w-5 text-crimson" /> Appearance
        </h3>
        <p className="text-xs text-muted-gray dark:text-gray-400 mb-4">Saved on this device.</p>
        <div className="flex p-1 bg-gray-100 dark:bg-white/10 rounded-lg max-w-xs">
          {[
            { key: 'light', label: 'Light', icon: Sun },
            { key: 'dark', label: 'Dark', icon: Moon },
          ].map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => { if (!active) toggleTheme(); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
                  active
                    ? 'bg-white dark:bg-white/10 shadow-sm text-charcoal dark:text-white'
                    : 'text-muted-gray dark:text-gray-400 hover:text-charcoal dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" /> {opt.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-gray dark:text-gray-400 mt-3">
          Currently using <span className="font-semibold">{isDark ? 'dark' : 'light'}</span> mode.
        </p>
      </Card>

      {/* Session & security */}
      <Card>
        <h3 className="text-lg font-bold text-charcoal dark:text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-crimson" /> Session & Security
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border border-border-gray dark:border-white/10 rounded-lg">
            <div>
              <div className="font-semibold text-charcoal dark:text-white">Active session</div>
              <div className="text-xs text-muted-gray dark:text-gray-400">
                Sessions expire 7 days after login; expired sessions return to the login screen automatically.
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
          <p className="text-xs text-muted-gray dark:text-gray-400">
            Password changes and account provisioning are handled by your organisation administrator.
          </p>
        </div>
      </Card>
    </div>
  );
}
