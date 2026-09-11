import React, { useState } from 'react';
import { useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { Droplet, Eye, EyeOff, Home, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { dashboardPathForRole } from '../../routes/rolePaths';

const REDIRECT_NOTICES = {
  auth: 'Your session has expired or you need to sign in to view that page.',
  role: 'That page requires a different account type. Sign in with an authorized account.',
};

import usePageTitle from '../../hooks/usePageTitle';

export default function Login() {
  usePageTitle('Login');
  const [role, setRole] = useState('HOSPITAL');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  
  const { login, user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectNotice = REDIRECT_NOTICES[location.state?.reason] || null;

  // Already signed in → go to the role dashboard (no reason to show the form).
  // Wait for session restore first so we never flash-redirect on reload.
  if (!authLoading && isAuthenticated) {
    return <Navigate to={dashboardPathForRole(user?.role) || '/dashboard'} replace />;
  }

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    return errs;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password, role });
      login(response.data.user, response.data.token);
      navigate(dashboardPathForRole(response.data.user?.role) || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleLabels = {
    HOSPITAL: { placeholder: 'coord@hospital.org', bg: 'bg-red-50 text-red-800' },
    NGO: { placeholder: 'admin@ngo.org', bg: 'bg-pink-50 text-pink-800' },
    BLOODBANK: { placeholder: 'admin@bloodbank.org', bg: 'bg-blue-50 text-blue-800' },
    ADMIN: { placeholder: 'admin@lifeflow.org', bg: 'bg-gray-100 text-gray-800' }
  };

  return (
    <div className="min-h-screen flex bg-off-white relative">
      <Link
        to="/"
        aria-label="Back to home"
        className="absolute top-4 left-4 z-20 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-border-gray shadow-sm text-sm font-medium text-muted-gray hover:text-charcoal hover:bg-gray-50 transition-colors"
      >
        <Home className="h-4 w-4" />
        Home
      </Link>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-charcoal text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #B91C3C 0%, transparent 50%)' }}></div>
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-16">
            <Droplet className="h-8 w-8 text-primary-crimson fill-primary-crimson" />
            <span className="text-2xl font-bold tracking-tight">LifeFlow</span>
          </Link>
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Empowering the chain of demand & donation.
          </h1>
          <p className="text-lg text-gray-400">
            Secure, role-based access for healthcare organizations and non-profits to orchestrate the regional blood supply.
          </p>
        </div>
        <div className="relative z-10 text-sm text-gray-500">
          Secured by LifeFlow Enterprise Cryptography Pipeline
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border-gray p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-charcoal mb-2">Welcome back</h2>
            <p className="text-sm text-muted-gray">Select your role to access the correct operational workspace</p>
          </div>

          {redirectNotice && !error && (
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-lg border border-blue-100 dark:border-blue-500/20 flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{redirectNotice}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-danger-red text-sm font-medium rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Role Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
              {['HOSPITAL', 'NGO', 'BLOODBANK'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                    role === r ? 'bg-white shadow-sm text-charcoal' : 'text-muted-gray hover:text-charcoal'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="space-y-5">
              <Input
                label="Email Address"
                id="email"
                type="email"
                placeholder={roleLabels[role].placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
                required
              />
              
              <div className="relative">
                <Input
                  label="Password"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={fieldErrors.password}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[28px] p-1 text-gray-400 hover:text-charcoal"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-primary-crimson focus:ring-primary-crimson" />
                  <span className="text-sm text-muted-gray">Keep me logged in</span>
                </label>
                <span className="text-sm font-medium text-primary-crimson hover:text-primary-crimson-dark cursor-pointer">
                  Forgot?
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In to Platform'}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-muted-gray">Need agency access? </span>
            <span className="font-medium text-primary-crimson hover:text-primary-crimson-dark cursor-pointer">
              Request an account
            </span>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-400">
            Demo Credentials (All passwords: <b>password123</b>)<br/>
            Hospital: priya@stjude.hospital.org<br/>
            NGO: vikram@redcross.ngo.org<br/>
            Blood Bank: suresh@mhbloodbank.org
          </div>
        </div>
      </div>
    </div>
  );
}
