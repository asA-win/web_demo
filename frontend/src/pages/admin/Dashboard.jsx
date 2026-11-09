import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, CheckCircle2, Clock, XCircle, MessageSquare, 
  Users, Utensils, Grid, ArrowUpRight, Check, X, Eye, RefreshCw 
} from 'lucide-react';
import { dashboardService, reservationService } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';
import { useToast } from '../../components/Toast';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { subscribe } = useWebSocket();
  const { addToast } = useToast();

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to live admin events to auto-refresh stats!
    const unsubNew = subscribe('NEW_RESERVATION', () => fetchStats());
    const unsubUpd = subscribe('RESERVATION_UPDATED', () => fetchStats());
    const unsubCan = subscribe('RESERVATION_CANCELLED', () => fetchStats());
    const unsubEnq = subscribe('NEW_ENQUIRY', () => fetchStats());

    return () => {
      unsubNew();
      unsubUpd();
      unsubCan();
      unsubEnq();
    };
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await reservationService.adminUpdateReservationStatus(id, { status: newStatus });
      addToast(`Reservation marked as ${newStatus}`, 'success', 'Status Updated');
      fetchStats();
    } catch (err) {
      console.error('Status update failed:', err);
      addToast('Failed to update reservation status.', 'error', 'Error');
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gold-300 font-serif tracking-widest text-xs uppercase">Loading Operations Dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Bookings",
      value: stats?.total_bookings || 0,
      icon: Calendar,
      color: "border-gold-400/30 text-gold-300",
      bg: "bg-gold-400/10"
    },
    {
      title: "Today's Bookings",
      value: stats?.today_bookings || 0,
      icon: Clock,
      color: "border-sky-500/30 text-sky-400",
      bg: "bg-sky-500/10"
    },
    {
      title: "Pending Approval",
      value: stats?.pending_reservations || 0,
      icon: Clock,
      color: "border-amber-500/40 text-amber-300",
      bg: "bg-amber-500/10",
      highlight: true
    },
    {
      title: "Confirmed Guests",
      value: stats?.confirmed_reservations || 0,
      icon: CheckCircle2,
      color: "border-emerald-500/30 text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Cancelled / Rejected",
      value: stats?.cancelled_reservations || 0,
      icon: XCircle,
      color: "border-rose-500/30 text-rose-400",
      bg: "bg-rose-500/10"
    },
    {
      title: "Pending Enquiries",
      value: stats?.pending_enquiries || 0,
      icon: MessageSquare,
      color: "border-purple-500/30 text-purple-400",
      bg: "bg-purple-500/10"
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide">
            Operations Overview
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time reservation metrics, guest check-ins, and incoming customer requests.
          </p>
        </div>

        <button
          onClick={() => fetchStats()}
          className="btn-outline-gold text-xs font-semibold py-2 px-4 flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`glass-panel p-4 rounded-xl border ${card.color} flex flex-col justify-between space-y-3 relative overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-white">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reservations Table */}
      <div className="glass-panel rounded-2xl border border-gold-400/20 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gold-400/15 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
              Recent Table Reservations
            </h2>
            <p className="text-slate-400 text-xs">
              Live updates directly via WebSocket. Click Confirm or Reject to update status immediately.
            </p>
          </div>
          <Link
            to="/admin/reservations"
            className="text-xs font-semibold text-gold-300 hover:text-white flex items-center gap-1"
          >
            View All <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-obsidian-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Guest</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Guests</th>
                <th className="py-3.5 px-4">Seating</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {(stats?.recent_reservations || []).length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No reservations recorded in the database yet.
                  </td>
                </tr>
              ) : (
                stats.recent_reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-obsidian-850/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gold-300">
                      {res.booking_reference}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{res.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{res.customer_phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white">{res.reservation_date}</div>
                      <div className="text-[11px] text-gold-400">{res.reservation_time}</div>
                    </td>
                    <td className="py-3 px-4 text-white font-medium">
                      {res.guest_count}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {res.table?.name || res.seating_preference || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4">
                      {res.status === 'confirmed' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-semibold text-[10px] uppercase">
                          Confirmed
                        </span>
                      )}
                      {res.status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 font-semibold text-[10px] uppercase">
                          Pending
                        </span>
                      )}
                      {res.status === 'cancelled' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-950 border border-rose-500/40 text-rose-300 font-semibold text-[10px] uppercase">
                          Cancelled
                        </span>
                      )}
                      {res.status === 'rejected' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-950 border border-rose-500/40 text-rose-300 font-semibold text-[10px] uppercase">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {res.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(res.id, 'confirmed')}
                            className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900 transition-colors"
                            title="Confirm Booking"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(res.id, 'rejected')}
                            className="p-1.5 rounded-lg bg-rose-950 border border-rose-500/50 text-rose-300 hover:bg-rose-900 transition-colors"
                            title="Reject Booking"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <Link
                        to={`/admin/reservations?search=${res.booking_reference}`}
                        className="p-1.5 rounded-lg bg-obsidian-800 border border-slate-700 text-slate-300 hover:text-white inline-block"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
