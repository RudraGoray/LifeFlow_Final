import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LiveStatistics from './pages/LiveStatistics'
import RaiseBloodDemand from './pages/RaiseBloodDemand'
import ViewBloodAvailable from './pages/ViewBloodAvailable'
import RaiseBloodDonated from './pages/RaiseBloodDonated'
import ViewConfirmTickets from './pages/ViewConfirmTickets'
import PredictedDemandAnalytics from './pages/PredictedDemandAnalytics'

function ProtectedRoute({ children }) {
  const { role } = useAuth()
  return role ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* The 6 LifeFlow Arterial Network Pages */}
      <Route path="/live-statistics" element={<LiveStatistics />} />
      <Route path="/stats" element={<Navigate to="/live-statistics" replace />} />

      <Route path="/hospital/demand" element={<RaiseBloodDemand />} />
      <Route path="/demand" element={<Navigate to="/hospital/demand" replace />} />

      <Route path="/hospital/inventory" element={<ViewBloodAvailable />} />
      <Route path="/inventory" element={<Navigate to="/hospital/inventory" replace />} />

      <Route path="/ngo/donate" element={<RaiseBloodDonated />} />
      <Route path="/donate" element={<Navigate to="/ngo/donate" replace />} />

      <Route path="/blood-bank/confirm" element={<ViewConfirmTickets />} />
      <Route path="/confirm" element={<Navigate to="/blood-bank/confirm" replace />} />

      <Route path="/analytics/predictions" element={<PredictedDemandAnalytics />} />
      <Route path="/analytics" element={<Navigate to="/analytics/predictions" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
