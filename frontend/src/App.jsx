import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { Reservation } from './pages/Reservation';
import { BookingLookup } from './pages/BookingLookup';
import { Contact } from './pages/Contact';
import { AdminLogin } from './pages/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { ReservationsManager } from './pages/admin/ReservationsManager';
import { MenuManager } from './pages/admin/MenuManager';
import { TableManager } from './pages/admin/TableManager';
import { EnquiriesManager } from './pages/admin/EnquiriesManager';
import { SettingsManager } from './pages/admin/SettingsManager';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public layout wrapper with Navbar & Footer
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-obsidian-950 text-slate-100">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      {/* Customer Facing Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/reserve" element={<Reservation />} />
        <Route path="/lookup" element={<BookingLookup />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Console */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="reservations" element={<ReservationsManager />} />
        <Route path="menu" element={<MenuManager />} />
        <Route path="tables" element={<TableManager />} />
        <Route path="enquiries" element={<EnquiriesManager />} />
        <Route path="settings" element={<SettingsManager />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
