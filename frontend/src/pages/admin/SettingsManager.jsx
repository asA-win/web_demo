import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, Sparkles, Clock, MapPin, Phone, Mail, Shield } from 'lucide-react';
import { settingsService } from '../../services/api';
import { useToast } from '../../components/Toast';

export const SettingsManager = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [restaurantName, setRestaurantName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [openingTime, setOpeningTime] = useState('12:00');
  const [closingTime, setClosingTime] = useState('01:00');
  const [slotDuration, setSlotDuration] = useState(120);
  const [maxGuests, setMaxGuests] = useState(16);
  const [isAccepting, setIsAccepting] = useState(true);
  const [bookingPolicy, setBookingPolicy] = useState('');
  const [announcement, setAnnouncement] = useState('');

  const { addToast } = useToast();

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
      setRestaurantName(data.restaurant_name);
      setTagline(data.tagline);
      setDescription(data.description || '');
      setPhone(data.phone);
      setEmail(data.email);
      setAddress(data.address);
      setOpeningTime(data.opening_time);
      setClosingTime(data.closing_time);
      setSlotDuration(data.slot_duration_minutes);
      setMaxGuests(data.max_guests_per_booking);
      setIsAccepting(data.is_accepting_reservations);
      setBookingPolicy(data.booking_policy || '');
      setAnnouncement(data.announcement_banner || '');
    } catch (err) {
      console.error('Failed to load settings:', err);
      addToast('Error loading restaurant settings.', 'error', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        restaurant_name: restaurantName.trim(),
        tagline: tagline.trim(),
        description: description.trim() || null,
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        opening_time: openingTime,
        closing_time: closingTime,
        slot_duration_minutes: parseInt(slotDuration, 10),
        max_guests_per_booking: parseInt(maxGuests, 10),
        is_accepting_reservations: isAccepting,
        booking_policy: bookingPolicy.trim() || null,
        announcement_banner: announcement.trim() || null,
      };

      const updated = await settingsService.adminUpdateSettings(payload);
      setSettings(updated);
      addToast('Restaurant parameters and policies saved.', 'success', 'Settings Updated');
    } catch (err) {
      console.error('Settings update failed:', err);
      const detail = err.response?.data?.detail || 'Failed to update settings.';
      addToast(detail, 'error', 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide">
          Restaurant Settings & Policies
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Configure operating hours, table dining durations, announcement banners, and booking rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-6 sm:p-10 rounded-2xl border border-gold-400/25 space-y-8 shadow-2xl">
        {/* General Information */}
        <div className="space-y-4">
          <h2 className="font-serif text-base font-bold text-gold-300 uppercase tracking-wider border-b border-gold-400/20 pb-2">
            Branding & Contact Info
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-slate-300">
                Restaurant Name
              </label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-slate-300">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-slate-300">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-slate-300">
                Official Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold uppercase tracking-wider text-slate-300">
                Full Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>
        </div>

        {/* Operating & Booking Constraints */}
        <div className="space-y-4">
          <h2 className="font-serif text-base font-bold text-gold-300 uppercase tracking-wider border-b border-gold-400/20 pb-2">
            Operating Hours & Reservation Constraints
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-slate-300">
                Daily Opening
              </label>
              <input
                type="text"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-slate-300">
                Daily Closing
              </label>
              <input
                type="text"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-slate-300">
                Dining Duration (Mins)
              </label>
              <input
                type="number"
                min="30"
                step="15"
                value={slotDuration}
                onChange={(e) => setSlotDuration(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-slate-300">
                Max Online Guests
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>
        </div>

        {/* Banner & Policies */}
        <div className="space-y-4">
          <h2 className="font-serif text-base font-bold text-gold-300 uppercase tracking-wider border-b border-gold-400/20 pb-2">
            Announcements & Cancellation Policy
          </h2>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-slate-300">
                Top Announcement Ribbon (Appears on Homepage)
              </label>
              <input
                type="text"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="e.g. Ramadan Royal Tasting Menu Now Available"
                className="w-full px-3 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-slate-300">
                Reservation & Dress Code Policy
              </label>
              <textarea
                rows="3"
                value={bookingPolicy}
                onChange={(e) => setBookingPolicy(e.target.value)}
                className="w-full px-3 py-2.5 bg-obsidian-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-gold-400 resize-none"
              ></textarea>
            </div>

            <label className="flex items-center gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={isAccepting}
                onChange={(e) => setIsAccepting(e.target.checked)}
                className="w-4 h-4 rounded text-gold-400 focus:ring-0"
              />
              <div>
                <span className="text-white font-medium block">Accepting Online Table Reservations</span>
                <span className="text-[11px] text-slate-400">
                  Uncheck to temporarily pause online bookings (guest booking interface will display notice).
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-gold py-3 px-8 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-gold-glow"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-obsidian-950 border-t-transparent rounded-full animate-spin"></div>
                Saving Settings...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
