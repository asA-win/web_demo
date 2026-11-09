import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, Utensils, Grid, MessageSquare, 
  Settings, LogOut, ExternalLink, Sparkles, Menu, X, Bell 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { RealtimeStatusBadge } from '../../components/RealtimeStatusBadge';
import { useToast } from '../../components/Toast';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { subscribe } = useWebSocket();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Subscribe to live admin alerts
  useEffect(() => {
    const unsubReservation = subscribe('NEW_RESERVATION', (data) => {
      console.log('Real-time NEW_RESERVATION received in AdminLayout:', data);
      addToast(
        `New booking ${data.booking_reference} received from ${data.customer_name} for ${data.guest_count} guests.`,
        'success',
        'New Reservation Alert!'
      );
    });

    const unsubCancelled = subscribe('RESERVATION_CANCELLED', (data) => {
      addToast(
        `Booking ${data.booking_reference} was cancelled by ${data.customer_name}.`,
        'warning',
        'Reservation Cancelled'
      );
    });

    const unsubEnquiry = subscribe('NEW_ENQUIRY', (data) => {
      addToast(
        `Customer enquiry received from ${data.customer_name}: "${data.subject}"`,
        'info',
        'New Customer Enquiry'
      );
    });

    return () => {
      unsubReservation();
      unsubCancelled();
      unsubEnquiry();
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Reservations', path: '/admin/reservations', icon: Calendar },
    { name: 'Menu Items', path: '/admin/menu', icon: Utensils },
    { name: 'Tables & Capacity', path: '/admin/tables', icon: Grid },
    { name: 'Customer Enquiries', path: '/admin/enquiries', icon: MessageSquare },
    { name: 'Restaurant Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col md:flex-row text-slate-100">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-obsidian-900 border-b border-gold-400/20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold-400" />
          <span className="font-serif font-bold text-gold-gradient text-sm uppercase">Layali Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <RealtimeStatusBadge />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-obsidian-850 border border-gold-400/30 text-gold-300"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-obsidian-900 border-r border-gold-400/20 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-gold-400/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-gold-400/60 bg-obsidian-950 flex items-center justify-center shadow-gold-glow">
              <Sparkles className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h2 className="font-serif text-sm font-bold tracking-widest text-gold-gradient uppercase">
                Layali Dubai
              </h2>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-sans">
                Operations Console
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-gold-400/20 text-gold-300 border border-gold-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-850'
                  }`
                }
              >
                <item.icon className="w-4 h-4 text-gold-400/80" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="px-3 py-2 rounded-xl bg-obsidian-950/80 border border-slate-800 text-xs">
            <span className="text-slate-500 text-[10px] uppercase block">Signed in as</span>
            <span className="text-white font-medium truncate block">{user?.full_name || 'Admin'}</span>
            <span className="text-gold-400 text-[10px] uppercase tracking-wider font-semibold">
              {user?.role || 'Administrator'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-gold-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Customer Site
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Topbar */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 bg-obsidian-900/60 border-b border-gold-400/20 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <span className="text-xs font-serif text-slate-400 tracking-wider uppercase">
              Downtown Dubai Restaurant Management
            </span>
          </div>

          <div className="flex items-center gap-6">
            <RealtimeStatusBadge />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300">{user?.full_name}</span>
            </div>
          </div>
        </div>

        {/* Outlet for child pages */}
        <div className="p-4 sm:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
