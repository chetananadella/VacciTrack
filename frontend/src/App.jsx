import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Common Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Parent Pages
import ParentDashboard from './pages/parent/ParentDashboard';
import MyChildrenPage from './pages/parent/MyChildrenPage';
import AddChildPage from './pages/parent/AddChildPage';
import ChildProfilePage from './pages/parent/ChildProfilePage';
import VaccinationSchedulePage from './pages/parent/VaccinationSchedulePage';
import VaccinationHistoryPage from './pages/parent/VaccinationHistoryPage';
import RemindersPage from './pages/parent/RemindersPage';
import ParentProfilePage from './pages/parent/ParentProfilePage';

// Healthcare Worker Pages
import HealthcareDashboard from './pages/healthcare/HealthcareDashboard';
import ChildrenListPage from './pages/healthcare/ChildrenListPage';
import ChildDetailsWorkerPage from './pages/healthcare/ChildDetailsWorkerPage';
import RecordVaccinationPage from './pages/healthcare/RecordVaccinationPage';
import DueVaccinationsPage from './pages/healthcare/DueVaccinationsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageChildrenPage from './pages/admin/ManageChildrenPage';
import ManageVaccinesPage from './pages/admin/ManageVaccinesPage';
import VaccinationRecordsPage from './pages/admin/VaccinationRecordsPage';
import ReportsAnalyticsPage from './pages/admin/ReportsAnalyticsPage';

const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container">
      {isAuthenticated && <Sidebar />}
      <div className="main-content">
        <Navbar />
        {children}
        <Footer />
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Parent Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Parent']} />}>
              <Route path="/parent/dashboard" element={<ParentDashboard />} />
              <Route path="/parent/children" element={<MyChildrenPage />} />
              <Route path="/parent/add-child" element={<AddChildPage />} />
              <Route path="/parent/children/:id" element={<ChildProfilePage />} />
              <Route path="/parent/schedule" element={<VaccinationSchedulePage />} />
              <Route path="/parent/history" element={<VaccinationHistoryPage />} />
              <Route path="/parent/reminders" element={<RemindersPage />} />
              <Route path="/parent/profile" element={<ParentProfilePage />} />
            </Route>

            {/* Healthcare Worker Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['HealthcareWorker', 'Admin']} />}>
              <Route path="/healthcare/dashboard" element={<HealthcareDashboard />} />
              <Route path="/healthcare/children" element={<ChildrenListPage />} />
              <Route path="/healthcare/children/:id" element={<ChildDetailsWorkerPage />} />
              <Route path="/healthcare/record" element={<RecordVaccinationPage />} />
              <Route path="/healthcare/due" element={<DueVaccinationsPage />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsersPage />} />
              <Route path="/admin/children" element={<ManageChildrenPage />} />
              <Route path="/admin/vaccines" element={<ManageVaccinesPage />} />
              <Route path="/admin/records" element={<VaccinationRecordsPage />} />
              <Route path="/admin/reports" element={<ReportsAnalyticsPage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
