import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import IssuesList from './pages/IssuesList';
import ReportIssue from './pages/ReportIssue';
import IssueDetails from './pages/IssueDetails';
import Profile from './pages/Profile';

// Admin Imports
import AdminRoute from './components/AdminRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminIssues from './pages/admin/AdminIssues';
import AdminEditIssue from './pages/admin/AdminEditIssue';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMap from './pages/admin/AdminMap';

const AUTH_ROUTES = ['/login', '/register', '/signup', '/auth'];

const AppLayout = () => {
  const { pathname } = useLocation();
  const isAuthPage = AUTH_ROUTES.some(route => pathname.startsWith(route));
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen flex flex-col ${isAdminPage ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {!isAuthPage && !isAdminPage && <Navbar />}
      <main className={`flex-grow ${isAdminPage ? 'flex flex-col' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/issues" element={<IssuesList />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/issues/:id" element={<IssueDetails />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="issues" element={<AdminIssues />} />
              <Route path="issues/:id/edit" element={<AdminEditIssue />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="map" element={<AdminMap />} />
              <Route path="settings" element={<div className="p-4"><h2 className="text-2xl font-bold">Settings</h2></div>} />
            </Route>
          </Route>
        </Routes>
      </main>
      {!isAuthPage && !isAdminPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
