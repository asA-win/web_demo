import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, Clock, Users, Sparkles, CheckCircle2, 
  MapPin, AlertCircle, ArrowRight, ShieldCheck, HeartHandshake, Printer, Search 
} from 'lucide-react';
import { availabilityService, reservationService, settingsService } from '../services/api';
import { useToast } from '../components/Toast';

export const Reservation = () => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Form State
  const [guestCount, setGuestCount] = useState(2);
  const [reservationDate, setReservationDate] = useState(todayStr);
  const [seatingPreference, setSeatingPreference] = useState('Any');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  
  // Customer Details
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+971 ');
  const [specialRequests, setSpecialRequests] = useState('');
  const [occasion, setOccasion] = useState('');

  // UI States
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState(null);
  const [restaurantSettings, setRestaurantSettings] = useState(null);

  const { addToast } = useToast();

  // Load Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const s = await settingsService.getSettings();
        setRestaurantSettings(s);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Fetch Available Slots whenever Date, Guests, or Preference changes
  useEffect(() => {
    let isCancelled = false;

    const fetchSlots = async () => {
      if (!reservationDate || guestCount < 1) return;
      setIsLoadingSlots(true);
      setSlotError(null);
      setSelectedTimeSlot('');

      try {
        const data = await availabilityService.checkAvailability(
          reservationDate,
          guestCount,
          seatingPreference
        );
        if (!isCancelled) {
          setAvailableSlots(data.slots || []);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Availability check failed:', err);
          const detail = err.response?.data?.detail || 'Failed to check table availability.';
          setSlotError(detail);
          setAvailableSlots([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingSlots(false);
        }
      }
    };

    fetchSlots();

    return () => {
      isCancelled = true;
    };
  }, [reservationDate, guestCount, seatingPreference]);

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTimeSlot) {
      addToast('Please select a dining time slot.', 'warning', 'Missing Time Slot');
      return;
    }
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      addToast('Please complete all required contact fields.', 'warning', 'Required Information');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullRequests = [
        occasion ? `Occasion: ${occasion}` : null,
        specialRequests.trim() || null
      ].filter(Boolean).join(' • ');

      const payload = {
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim(),
        reservation_date: reservationDate,
        reservation_time: selectedTimeSlot,
        guest_count: parseInt(guestCount, 10),
        seating_preference: seatingPreference,
        special_requests: fullRequests || null,
      };

      const res = await reservationService.createReservation(payload);
      setConfirmedReservation(res);
      addToast(`Table reserved! Your reference code is ${res.booking_reference}`, 'success', 'Reservation Confirmed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Reservation creation failed:', err);
      const msg = err.response?.data?.detail || 'Unable to complete reservation. Please try an alternative slot.';
      addToast(msg, 'error', 'Booking Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If confirmed, render Confirmation Receipt
  if (confirmedReservation) {
    return (
      <div className="pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
        <div className="glass-panel p-8 sm:p-12 rounded-2xl border-2 border-gold-400/40 bg-gradient-to-b from-obsidian-900 to-obsidian-950 shadow-gold-glow relative overflow-hidden">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-bl-full pointer-events-none"></div>

          <div className="text-center space-y-3 pb-8 border-b border-gold-400/20">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>
            <span className="text-gold-400 font-serif uppercase tracking-[0.3em] text-xs font-semibold block">
              Reservation Confirmed & Saved to Database
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white uppercase tracking-wider">
              Layali Dubai Table Voucher
            </h1>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              We look forward to welcoming you for an extraordinary gastronomic journey in Downtown Dubai.
            </p>
          </div>

          {/* Reference Banner */}
          <div className="my-6 p-4 rounded-xl bg-obsidian-950 border border-gold-400/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-widest font-sans">
                Official Booking Reference
              </span>
              <div className="font-mono text-2xl font-bold text-gold-gradient tracking-wider">
                {confirmedReservation.booking_reference}
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              Status: {confirmedReservation.status.toUpperCase()}
            </div>
          </div>

          {/* Reservation Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-800 text-sm">
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Guest Name</span>
              <span className="text-white font-medium">{confirmedReservation.customer_name}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Contact Email</span>
              <span className="text-white font-medium">{confirmedReservation.customer_email}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Date & Dining Time</span>
              <span className="text-gold-300 font-semibold">
                {confirmedReservation.reservation_date} at {confirmedReservation.reservation_time}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Party Size</span>
              <span className="text-white font-medium">{confirmedReservation.guest_count} Guests</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Seating Area</span>
              <span className="text-white font-medium">
                {confirmedReservation.table?.name || confirmedReservation.seating_preference || 'Main Dining Salon'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Location</span>
              <span className="text-white font-medium">Downtown Dubai (Sheikh Mohammed bin Rashid Blvd)</span>
            </div>
            {confirmedReservation.special_requests && (
              <div className="sm:col-span-2">
                <span className="text-slate-500 text-xs uppercase tracking-wider block">Special Requests</span>
                <span className="text-slate-300 text-xs italic">{confirmedReservation.special_requests}</span>
              </div>
            )}
          </div>

          {/* Cancellation Policy Notice */}
          <div className="pt-6 space-y-4 text-xs text-slate-400">
            <div className="flex items-start gap-2 bg-obsidian-950/60 p-4 rounded-xl border border-slate-800">
              <ShieldCheck className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-200 font-semibold mb-1">Reservation Policy & Cancellation</p>
                <p>
                  {restaurantSettings?.booking_policy || "Cancellations and amendments are permitted up to 2 hours prior to your dining time. Please present this booking reference upon arrival for valet and host check-in."}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <Link
                to={`/lookup?ref=${confirmedReservation.booking_reference}&contact=${encodeURIComponent(confirmedReservation.customer_email)}`}
                className="btn-outline-gold text-xs font-semibold py-3 px-6 w-full sm:w-auto text-center flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Live Status Tracker
              </Link>
              <button
                onClick={() => window.print()}
                className="btn-gold text-xs font-semibold py-3 px-6 w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Voucher
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-gold-400 font-serif uppercase tracking-[0.3em] text-xs font-semibold block">
          Table Reservation • Guaranteed Persistent Booking
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-wide uppercase">
          Reserve Your Table
        </h1>
        <p className="text-slate-300 text-sm font-light max-w-xl mx-auto leading-relaxed">
          Select your desired date, guest count, and seating area. Our intelligent system checks live table availability to prevent double-booking.
        </p>
      </div>

      {/* Reservation Form Card */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-10 rounded-2xl border border-gold-400/25 space-y-8 shadow-2xl">
        {/* Step 1: Booking Parameters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gold-400/20 pb-3">
            <span className="w-6 h-6 rounded-full bg-gold-400 text-obsidian-950 text-xs font-bold flex items-center justify-center">1</span>
            <h2 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
              Dining Preferences
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Guest Count */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-gold-400" />
                Party Size
              </label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                className="w-full px-4 py-3 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-400 transition-colors"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gold-400" />
                Reservation Date
              </label>
              <input
                type="date"
                min={todayStr}
                value={reservationDate}
                onChange={(e) => setReservationDate(e.target.value)}
                className="w-full px-4 py-3 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-400 transition-colors"
                required
              />
            </div>

            {/* Seating Preference */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-400" />
                Seating Atmosphere
              </label>
              <select
                value={seatingPreference}
                onChange={(e) => setSeatingPreference(e.target.value)}
                className="w-full px-4 py-3 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-400 transition-colors"
              >
                <option value="Any">Best Available (Any)</option>
                <option value="Burj View Terrace">Burj View Terrace (Outdoor)</option>
                <option value="Royal Majlis VIP">Royal Majlis VIP (Private)</option>
                <option value="Main Dining Hall">Main Dining Hall (Indoor)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Time Slots Availability Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gold-400/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold-400 text-obsidian-950 text-xs font-bold flex items-center justify-center">2</span>
              <h2 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
                Select Available Dining Slot
              </h2>
            </div>
            {isLoadingSlots && (
              <span className="text-xs text-gold-400 flex items-center gap-1.5 animate-pulse">
                <Clock className="w-3.5 h-3.5 animate-spin" /> Verifying Table Capacity...
              </span>
            )}
          </div>

          {slotError && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{slotError}</span>
            </div>
          )}

          {!isLoadingSlots && availableSlots.length === 0 && !slotError && (
            <p className="text-slate-400 text-xs py-4 text-center">
              Please choose a date to display available reservation windows.
            </p>
          )}

          {/* Time Slot Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {availableSlots.map((slot) => {
              const isSelected = selectedTimeSlot === slot.time;
              return (
                <button
                  type="button"
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => setSelectedTimeSlot(slot.time)}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    !slot.available
                      ? 'bg-obsidian-900/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                      : isSelected
                      ? 'bg-gold-400 text-obsidian-950 border-gold-400 shadow-gold-glow font-bold'
                      : 'bg-obsidian-900 border-slate-700/80 text-slate-200 hover:border-gold-400/60 hover:bg-obsidian-850'
                  }`}
                >
                  <span className="font-mono text-sm">{slot.time}</span>
                  <span className={`text-[10px] ${
                    isSelected 
                      ? 'text-obsidian-950 font-semibold' 
                      : slot.available 
                      ? 'text-emerald-400' 
                      : 'text-rose-400'
                  }`}>
                    {slot.available ? `${slot.remaining_tables} Tables` : 'Full'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Customer Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gold-400/20 pb-3">
            <span className="w-6 h-6 rounded-full bg-gold-400 text-obsidian-950 text-xs font-bold flex items-center justify-center">3</span>
            <h2 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
              Guest Contact Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Sheikh Mansoor Al-Ketbi"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="reservations@client.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Mobile Number (with country code) *
              </label>
              <input
                type="tel"
                placeholder="+971 50 123 4567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="w-full px-4 py-3 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Special Occasion (Optional)
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-4 py-3 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-400 transition-colors"
              >
                <option value="">None / Casual Dining</option>
                <option value="Birthday Celebration">Birthday Celebration</option>
                <option value="Romantic Anniversary">Romantic Anniversary</option>
                <option value="Executive Business Dinner">Executive Business Dinner</option>
                <option value="Family Gathering">Family Gathering</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Dietary Requirements & Notes (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="Mention allergies, dietary preferences (halal, gluten-free), high-chair needs, or terrace preferences..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-4 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-400 transition-colors resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {selectedTimeSlot ? (
              <span className="text-gold-300 font-medium">
                Reserving for {guestCount} guests on {reservationDate} at {selectedTimeSlot}
              </span>
            ) : (
              <span>Please pick a time slot above to proceed.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedTimeSlot}
            className={`btn-gold w-full sm:w-auto py-4 px-10 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow ${
              (!selectedTimeSlot || isSubmitting) ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-obsidian-950 border-t-transparent rounded-full animate-spin"></div>
                Confirming with Database...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Confirm Table Reservation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
