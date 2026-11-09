import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Calendar, Clock, Users, MapPin, CheckCircle2, 
  XCircle, AlertTriangle, ShieldCheck, RefreshCw, X 
} from 'lucide-react';
import { reservationService } from '../services/api';
import { createWebSocketClient } from '../services/websocket';
import { useToast } from '../components/Toast';

export const BookingLookup = () => {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const initialContact = searchParams.get('contact') || '';

  const [bookingRef, setBookingRef] = useState(initialRef);
  const [contact, setContact] = useState(initialContact);
  const [reservation, setReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cancellation modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [isCancelling, setIsCancelling] = useState(false);

  const { addToast } = useToast();

  const handleLookup = async (overrideRef, overrideContact) => {
    const refToUse = overrideRef || bookingRef;
    const contactToUse = overrideContact || contact;

    if (!refToUse.trim() || !contactToUse.trim()) {
      addToast('Please enter both booking reference and email or phone.', 'warning', 'Missing Details');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await reservationService.lookupReservation(refToUse.trim(), contactToUse.trim());
      setReservation(data);
    } catch (err) {
      console.error('Lookup failed:', err);
      const detail = err.response?.data?.detail || 'No reservation found matching this reference code and contact.';
      setError(detail);
      setReservation(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-search if query params present
  useEffect(() => {
    if (initialRef && initialContact) {
      handleLookup(initialRef, initialContact);
    }
  }, [initialRef, initialContact]);

  // Connect dedicated WebSocket for live updates on this reservation!
  useEffect(() => {
    if (!reservation?.booking_reference) return;

    const wsClient = createWebSocketClient(`/ws/reservation/${reservation.booking_reference}`);
    wsClient.connect();

    const unsubscribe = wsClient.on('RESERVATION_STATUS_UPDATED', (payload) => {
      console.log('Real-time RESERVATION_STATUS_UPDATED received:', payload);
      setReservation((prev) => prev ? { ...prev, status: payload.status, admin_notes: payload.admin_notes || prev.admin_notes } : null);
      addToast(`Your reservation status is now: ${payload.status.toUpperCase()}`, 'info', 'Status Updated Live');
    });

    return () => {
      unsubscribe();
      wsClient.disconnect();
    };
  }, [reservation?.booking_reference]);

  // Handle Cancellation
  const handleCancelBooking = async () => {
    if (!reservation) return;
    setIsCancelling(true);

    try {
      const updated = await reservationService.cancelReservation(
        reservation.booking_reference,
        reservation.customer_email,
        cancelReason
      );
      setReservation(updated);
      setShowCancelModal(false);
      addToast('Your reservation has been cancelled.', 'info', 'Reservation Cancelled');
    } catch (err) {
      console.error('Cancellation failed:', err);
      const detail = err.response?.data?.detail || 'Unable to cancel reservation.';
      addToast(detail, 'error', 'Cancellation Failed');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <span className="text-gold-400 font-serif uppercase tracking-[0.3em] text-xs font-semibold block">
          Live Tracking • Real-Time Synchronization
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-wide uppercase">
          Track Your Reservation
        </h1>
        <p className="text-slate-300 text-sm font-light leading-relaxed">
          Enter your reference code and email or phone to check confirmation status, view assigned table details, or cancel your booking.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gold-400/25 space-y-6 shadow-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Booking Reference
            </label>
            <input
              type="text"
              placeholder="e.g. LYL-7482-XA"
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
              required
              className="w-full px-4 py-3 bg-obsidian-900 border border-slate-700 rounded-xl text-white font-mono uppercase text-sm focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Email or Phone
            </label>
            <input
              type="text"
              placeholder="e.g. your email or phone"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              className="w-full px-4 py-3 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-gold w-full py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Look Up Status
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Reservation Details Display */}
      {reservation && (
        <div className="glass-panel p-6 sm:p-10 rounded-2xl border-2 border-gold-400/40 space-y-8 animate-fade-in shadow-2xl relative">
          {/* Top Status Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-gold-400/20 gap-4 text-center sm:text-left">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                Booking Reference: {reservation.booking_reference}
              </span>
              <h2 className="text-2xl font-serif font-bold text-white">
                Guest: {reservation.customer_name}
              </h2>
            </div>

            {/* Status Pill */}
            <div>
              {reservation.status === 'confirmed' && (
                <span className="px-4 py-2 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Confirmed by Restaurant
                </span>
              )}
              {reservation.status === 'pending' && (
                <span className="px-4 py-2 rounded-full bg-amber-950 border border-amber-500/50 text-amber-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  Pending Staff Confirmation
                </span>
              )}
              {reservation.status === 'cancelled' && (
                <span className="px-4 py-2 rounded-full bg-rose-950 border border-rose-500/50 text-rose-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  Reservation Cancelled
                </span>
              )}
              {reservation.status === 'rejected' && (
                <span className="px-4 py-2 rounded-full bg-rose-950 border border-rose-500/50 text-rose-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  Reservation Rejected
                </span>
              )}
              {reservation.status === 'completed' && (
                <span className="px-4 py-2 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-widest">
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* Real-time Indicator banner */}
          <div className="p-3 rounded-xl bg-gold-400/10 border border-gold-400/30 flex items-center justify-between text-xs text-gold-300">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-400"></span>
              </span>
              Real-time synchronization active. Changes by management reflect here immediately.
            </span>
            <button
              onClick={() => handleLookup()}
              className="text-xs text-gold-300 hover:text-white flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Date</span>
              <span className="text-white font-medium flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gold-400" />
                {reservation.reservation_date}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Time</span>
              <span className="text-white font-medium flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gold-400" />
                {reservation.reservation_time}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Party Size</span>
              <span className="text-white font-medium flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gold-400" />
                {reservation.guest_count} Guests
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Assigned Table</span>
              <span className="text-gold-300 font-semibold flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gold-400" />
                {reservation.table?.name || 'Table allocation in progress'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Seating Area</span>
              <span className="text-slate-200">
                {reservation.table?.location || reservation.seating_preference || 'Main Dining Hall'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Customer Phone</span>
              <span className="text-slate-200">{reservation.customer_phone}</span>
            </div>

            {reservation.special_requests && (
              <div className="sm:col-span-3 space-y-1 border-t border-slate-800 pt-3">
                <span className="text-slate-500 text-xs uppercase tracking-wider block">Special Requests</span>
                <p className="text-slate-300 text-xs italic">{reservation.special_requests}</p>
              </div>
            )}

            {reservation.admin_notes && (
              <div className="sm:col-span-3 p-3 rounded-lg bg-obsidian-950 border border-gold-400/30 text-xs">
                <span className="text-gold-400 font-semibold block mb-0.5">Note from Host:</span>
                <p className="text-slate-300">{reservation.admin_notes}</p>
              </div>
            )}
          </div>

          {/* Cancellation Option */}
          {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
            <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Need to change or cancel? Cancellations are accepted up to 2 hours prior to reservation.
              </span>
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-5 py-2.5 rounded-xl border border-rose-500/50 text-rose-300 text-xs font-semibold hover:bg-rose-950/60 transition-colors"
              >
                Cancel Reservation
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-rose-500/40 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">Cancel Reservation</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Are you sure you want to cancel booking <strong className="text-gold-300">{reservation.booking_reference}</strong>? This action cannot be undone.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400"
              >
                <option value="Change of plans">Change of plans</option>
                <option value="Illness or emergency">Illness or emergency</option>
                <option value="Booking error">Accidental duplicate booking</option>
                <option value="Postponing to future date">Rescheduling to another date</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
