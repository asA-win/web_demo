import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, Calendar as CalendarIcon, Clock, Users, 
  MapPin, Check, X, Edit2, Trash2, RefreshCw, AlertCircle, FileText 
} from 'lucide-react';
import { reservationService, tableService } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';
import { useToast } from '../../components/Toast';

export const ReservationsManager = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Status Modal State
  const [activeReservation, setActiveReservation] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const { subscribe } = useWebSocket();
  const { addToast } = useToast();

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [resData, tblData] = await Promise.all([
        reservationService.adminGetReservations(params),
        tableService.getTables()
      ]);
      setReservations(resData);
      setTables(tblData);
    } catch (err) {
      console.error('Failed to load reservations:', err);
      addToast('Error loading reservations.', 'error', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();

    // Real-time synchronization: when a reservation is added or changed, reload list
    const unsubNew = subscribe('NEW_RESERVATION', () => fetchReservations());
    const unsubUpd = subscribe('RESERVATION_UPDATED', () => fetchReservations());
    const unsubCan = subscribe('RESERVATION_CANCELLED', () => fetchReservations());

    return () => {
      unsubNew();
      unsubUpd();
      unsubCan();
    };
  }, [statusFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReservations();
  };

  const openStatusModal = (res) => {
    setActiveReservation(res);
    setNewStatus(res.status);
    setSelectedTableId(res.table_id || '');
    setAdminNotes(res.admin_notes || '');
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!activeReservation) return;

    setIsUpdating(true);
    try {
      await reservationService.adminUpdateReservationStatus(activeReservation.id, {
        status: newStatus,
        table_id: selectedTableId ? parseInt(selectedTableId, 10) : null,
        admin_notes: adminNotes || null,
      });

      addToast(`Reservation ${activeReservation.booking_reference} updated successfully.`, 'success', 'Updated');
      setActiveReservation(null);
      fetchReservations();
    } catch (err) {
      console.error('Update failed:', err);
      addToast('Failed to update reservation.', 'error', 'Error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id, ref) => {
    if (!window.confirm(`Are you sure you want to permanently delete reservation ${ref}?`)) {
      return;
    }
    try {
      await reservationService.adminDeleteReservation(id);
      addToast(`Reservation ${ref} removed.`, 'info', 'Deleted');
      fetchReservations();
    } catch (err) {
      console.error('Delete failed:', err);
      addToast('Failed to delete reservation.', 'error', 'Error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide">
            Reservation Management
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Review incoming bookings, confirm seatings, and assign tables across all dining salons.
          </p>
        </div>

        <button
          onClick={() => fetchReservations()}
          className="btn-outline-gold text-xs font-semibold py-2 px-4 flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-xl border border-gold-400/20 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, guest name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-gold-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-gold-400"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-gold-400"
          />

          <button
            type="submit"
            className="btn-gold py-2.5 px-6 text-xs font-bold uppercase tracking-wider"
          >
            Filter
          </button>

          {(statusFilter || dateFilter || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('');
                setDateFilter('');
                setSearchQuery('');
                setTimeout(() => fetchReservations(), 10);
              }}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-400 hover:text-white"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Reservations Table */}
      <div className="glass-panel rounded-2xl border border-gold-400/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-obsidian-900 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Guest Info</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Guests</th>
                <th className="py-3.5 px-4">Table & Location</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Fetching reservations...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No reservations match the specified filters.
                  </td>
                </tr>
              ) : (
                reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-obsidian-850/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gold-300">
                      {res.booking_reference}
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="font-semibold text-white">{res.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{res.customer_email}</div>
                      <div className="text-[11px] text-slate-400">{res.customer_phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{res.reservation_date}</div>
                      <div className="text-gold-400 font-mono text-[11px]">{res.reservation_time}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {res.guest_count}
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="text-gold-300 font-medium">
                        {res.table?.name || 'Unassigned'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {res.table?.location || res.seating_preference}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
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
                      {res.status === 'completed' && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-semibold text-[10px] uppercase">
                          Completed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openStatusModal(res)}
                        className="p-1.5 rounded-lg bg-obsidian-800 border border-slate-700 text-slate-300 hover:text-white"
                        title="Edit Status / Assign Table"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(res.id, res.booking_reference)}
                        className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 hover:bg-rose-900"
                        title="Delete Reservation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Status Modal */}
      {activeReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gold-400/40 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
                  Manage Reservation
                </h3>
                <span className="text-xs font-mono text-gold-300">
                  {activeReservation.booking_reference} • {activeReservation.customer_name}
                </span>
              </div>
              <button
                onClick={() => setActiveReservation(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="font-semibold uppercase tracking-wider text-slate-300">
                  Reservation Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400"
                >
                  <option value="pending">Pending Approval</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Table Assignment */}
              <div className="space-y-1.5">
                <label className="font-semibold uppercase tracking-wider text-slate-300">
                  Assign Dining Table
                </label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400"
                >
                  <option value="">No table assigned yet</option>
                  {tables.map((tbl) => (
                    <option key={tbl.id} value={tbl.id}>
                      {tbl.name} ({tbl.table_number}) — Capacity: {tbl.capacity} ({tbl.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Admin Notes */}
              <div className="space-y-1.5">
                <label className="font-semibold uppercase tracking-wider text-slate-300">
                  Internal Host / Admin Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. VIP guest requested fountain front view. Complimentary anniversary cake prepared."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveReservation(null)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-gold py-2.5 px-6 font-bold uppercase tracking-wider shadow-gold-glow"
                >
                  {isUpdating ? 'Saving...' : 'Update Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
