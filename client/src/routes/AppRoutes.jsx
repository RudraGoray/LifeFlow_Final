import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Public Pages
import Home from '../pages/public/Home';
import FindCamps from '../pages/public/FindCamps';
import CampRegistration from '../pages/public/CampRegistration';
import NGONetwork from '../pages/public/NGONetwork';
import ImpactStories from '../pages/public/ImpactStories';

// Auth Pages
import Login from '../pages/auth/Login';
import DashboardRoute from './DashboardRoute';

// Dashboard Pages
import HospitalDashboard from '../pages/hospital/HospitalDashboard';
import DemandTicketForm from '../pages/hospital/DemandTicketForm';
import DemandTicketList from '../pages/hospital/DemandTicketList';
import BloodAvailability from '../pages/hospital/BloodAvailability';

import NGODashboard from '../pages/ngo/NGODashboard';
import DonationBatchForm from '../pages/ngo/DonationBatchForm';
import DonationBatchList from '../pages/ngo/DonationBatchList';

import BloodBankDashboard from '../pages/bloodbank/BloodBankDashboard';
import TicketManagement from '../pages/bloodbank/TicketManagement';

// Statistics & Analytics
import StatisticsLayout from '../pages/statistics/StatisticsLayout';
import StatisticsOverview from '../pages/statistics/Overview';
import Forecast from '../pages/statistics/Forecast';
import GapAnalysis from '../pages/statistics/GapAnalysis';
import Regional from '../pages/statistics/Regional';

// Placeholder for unbuilt pages removed — all routes are wired.

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/find-camps" element={<FindCamps />} />
          <Route path="/camp-registration" element={<CampRegistration />} />
          <Route path="/ngo-network" element={<NGONetwork />} />
          <Route path="/impact-stories" element={<ImpactStories />} />
        </Route>

        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardRoute />} />
          
          {/* Hospital Routes */}
          <Route path="hospital/dashboard" element={<HospitalDashboard />} />
          <Route path="hospital/demand-tickets/new" element={<DemandTicketForm />} />
          <Route path="hospital/demand-tickets" element={<DemandTicketList />} />
          <Route path="hospital/blood-availability" element={<BloodAvailability />} />
          
          {/* NGO Routes */}
          <Route path="ngo/dashboard" element={<NGODashboard />} />
          <Route path="ngo/donation-batches/new" element={<DonationBatchForm />} />
          <Route path="ngo/donation-batches" element={<DonationBatchList />} />
          
          {/* Blood Bank Routes */}
          <Route path="bloodbank/dashboard" element={<BloodBankDashboard />} />
          <Route path="bloodbank/tickets" element={<TicketManagement />} />
          
          {/* Statistics & Analytics */}
          <Route path="statistics" element={<StatisticsLayout />}>
            <Route path="overview" element={<StatisticsOverview />} />
            <Route path="forecast" element={<Forecast />} />
            <Route path="gap-analysis" element={<GapAnalysis />} />
            <Route path="regional" element={<Regional />} />
          </Route>
          
          {/* We will add specific role routes here later */}
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
