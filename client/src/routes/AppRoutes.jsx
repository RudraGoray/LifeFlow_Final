import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Guards
import DashboardRoute from './DashboardRoute';
import RequireRole from './RequireRole';

// Public pages
import Home from '../pages/public/Home';
import FindCamps from '../pages/public/FindCamps';
import CampRegistration from '../pages/public/CampRegistration';
import NGONetwork from '../pages/public/NGONetwork';
import ImpactStories from '../pages/public/ImpactStories';

// Auth
import Login from '../pages/auth/Login';

// Shared account pages
import Settings from '../pages/Settings';

// Hospital pages
import HospitalDashboard from '../pages/hospital/HospitalDashboard';
import DemandTicketForm from '../pages/hospital/DemandTicketForm';
import DemandTicketList from '../pages/hospital/DemandTicketList';
import BloodAvailability from '../pages/hospital/BloodAvailability';
import HospitalInventory from '../pages/hospital/HospitalInventory';

// NGO pages
import NGODashboard from '../pages/ngo/NGODashboard';
import DonationBatchForm from '../pages/ngo/DonationBatchForm';
import DonationBatchList from '../pages/ngo/DonationBatchList';
import DonorRegistration from '../pages/ngo/DonorRegistration';
import Volunteers from '../pages/ngo/Volunteers';

// Blood bank pages
import BloodBankDashboard from '../pages/bloodbank/BloodBankDashboard';
import TicketManagement from '../pages/bloodbank/TicketManagement';
import BloodBankInventory from '../pages/bloodbank/BloodBankInventory';

// Statistics pages (all authenticated roles)
import StatisticsLayout from '../pages/statistics/StatisticsLayout';

// Lazy-loaded: recharts-heavy analytics stay out of the initial chunk.
const HospitalAnalytics = lazy(() => import('../pages/hospital/HospitalAnalytics'));
const NGOAnalytics = lazy(() => import('../pages/ngo/NGOAnalytics'));
const BloodBankAnalytics = lazy(() => import('../pages/bloodbank/BloodBankAnalytics'));
const StatisticsOverview = lazy(() => import('../pages/statistics/Overview'));
const StatisticsForecast = lazy(() => import('../pages/statistics/Forecast'));
const StatisticsGapAnalysis = lazy(() => import('../pages/statistics/GapAnalysis'));
const StatisticsRegional = lazy(() => import('../pages/statistics/Regional'));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center h-64" role="status" aria-label="Loading page">
      <div className="animate-spin h-8 w-8 border-2 border-primary-crimson border-t-transparent rounded-full" />
    </div>
  );
}

// Role groups (ADMIN may access every role workspace)
const HOSPITAL = ['HOSPITAL', 'ADMIN'];
const NGO = ['NGO', 'ADMIN'];
const BLOODBANK = ['BLOODBANK', 'ADMIN'];

// Wrap a page so only the given roles can render it.
// Unauthenticated → /login, wrong role → /dashboard (both with feedback).
const roleRoute = (roles, element) => (
  <RequireRole roles={roles}>{element}</RequireRole>
);

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public (no login required) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/find-camps" element={<FindCamps />} />
          <Route path="/camp-registration" element={<CampRegistration />} />
          <Route path="/ngo-network" element={<NGONetwork />} />
          <Route path="/impact-stories" element={<ImpactStories />} />
        </Route>

        <Route path="/login" element={<Login />} />

        {/* Authenticated (DashboardLayout redirects to /login when logged out) */}
        <Route path="/" element={<DashboardLayout />}>
          {/* Role entry point — redirects each account to its own dashboard */}
          <Route path="dashboard" element={<DashboardRoute />} />
          <Route path="dashboard/hospital" element={roleRoute(HOSPITAL, <HospitalDashboard />)} />
          <Route path="dashboard/ngo" element={roleRoute(NGO, <NGODashboard />)} />
          <Route path="dashboard/bloodbank" element={roleRoute(BLOODBANK, <BloodBankDashboard />)} />

          {/* Shared */}
          <Route path="settings" element={<Settings />} />

          {/* Hospital */}
          <Route path="hospital/dashboard" element={roleRoute(HOSPITAL, <HospitalDashboard />)} />
          <Route path="hospital/demand-tickets" element={roleRoute(HOSPITAL, <DemandTicketList />)} />
          <Route path="hospital/demand-tickets/new" element={roleRoute(HOSPITAL, <DemandTicketForm />)} />
          <Route path="hospital/blood-availability" element={roleRoute(HOSPITAL, <BloodAvailability />)} />
          <Route path="hospital/inventory" element={roleRoute(HOSPITAL, <HospitalInventory />)} />
          <Route path="hospital/analytics" element={roleRoute(HOSPITAL, <HospitalAnalytics />)} />

          {/* NGO */}
          <Route path="ngo/dashboard" element={roleRoute(NGO, <NGODashboard />)} />
          <Route path="ngo/donation-batches" element={roleRoute(NGO, <DonationBatchList />)} />
          <Route path="ngo/donation-batches/new" element={roleRoute(NGO, <DonationBatchForm />)} />
          <Route path="ngo/donors/new" element={roleRoute(NGO, <DonorRegistration />)} />
          <Route path="ngo/volunteers" element={roleRoute(NGO, <Volunteers />)} />
          <Route path="ngo/analytics" element={roleRoute(NGO, <NGOAnalytics />)} />

          {/* Blood bank */}
          <Route path="bloodbank/dashboard" element={roleRoute(BLOODBANK, <BloodBankDashboard />)} />
          <Route path="bloodbank/tickets" element={roleRoute(BLOODBANK, <TicketManagement />)} />
          <Route path="bloodbank/inventory" element={roleRoute(BLOODBANK, <BloodBankInventory />)} />
          <Route path="bloodbank/analytics" element={roleRoute(BLOODBANK, <BloodBankAnalytics />)} />

          {/* Statistics (any authenticated role) */}
          <Route path="statistics" element={<StatisticsLayout />}>
            <Route path="overview" element={<StatisticsOverview />} />
            <Route path="forecast" element={<StatisticsForecast />} />
            <Route path="gap-analysis" element={<StatisticsGapAnalysis />} />
            <Route path="regional" element={<StatisticsRegional />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
