import React, { useState, useEffect } from 'react';
import { 
  MapPin, Phone, Mail, Clock, Send, CheckCircle2, 
  MessageSquare, Sparkles, AlertCircle 
} from 'lucide-react';
import { enquiryService, settingsService } from '../services/api';
import { useToast } from '../components/Toast';

export const Contact = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+971 ');
  const [subject, setSubject] = useState('General Enquiry');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(null);

  const { addToast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const s = await settingsService.getSettings();
        setSettings(s);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !message.trim()) {
      addToast('Please fill out all required fields.', 'warning', 'Missing Fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await enquiryService.submitEnquiry({
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
      });

      setSubmitted(true);
      addToast('Your message has been sent to the restaurant management.', 'success', 'Enquiry Dispatched');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('+971 ');
      setMessage('');
    } catch (err) {
      console.error('Failed to submit enquiry:', err);
      const detail = err.response?.data?.detail || 'Failed to submit enquiry. Please try again.';
      setError(detail);
      addToast(detail, 'error', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-gold-400 font-serif uppercase tracking-[0.3em] text-xs font-semibold block">
          Concierge & Guest Relations • Downtown Dubai
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-wide uppercase">
          Contact & Location
        </h1>
        <p className="text-slate-300 text-sm font-light leading-relaxed">
          Whether inquiring about private dining buyouts, executive catering, or special dietary requirements, our dedicated concierge team is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Contact Form Card */}
        <div className="glass-panel p-6 sm:p-10 rounded-2xl border border-gold-400/25 shadow-2xl space-y-6">
          <div className="border-b border-gold-400/20 pb-4">
            <h2 className="font-serif text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gold-400" />
              Send Guest Enquiry
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              All messages are recorded directly in our restaurant database and delivered instantly to our hosts.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 text-center space-y-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-white">Thank You For Reaching Out</h3>
              <p className="text-slate-300 text-xs max-w-md mx-auto leading-relaxed">
                Your enquiry has been received by our concierge desk. We will contact you via email or phone within 2 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn-outline-gold text-xs font-semibold py-2.5 px-6 uppercase tracking-wider"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fatima Al-Zahra"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+971 55 987 6543"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Enquiry Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-400 transition-colors"
                >
                  <option value="General Enquiry">General Guest Enquiry</option>
                  <option value="Private Event Buyout">Private Dining & Event Buyout</option>
                  <option value="Dietary & Allergen Inquiry">Dietary & Allergen Inquiry</option>
                  <option value="Corporate Catering">Corporate Gala / Catering</option>
                  <option value="Media & Press">Media & Press Relations</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Message *
                </label>
                <textarea
                  rows="4"
                  placeholder="How can we assist you today? Please share party details, requested dates, or questions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-400 transition-colors resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold w-full py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-obsidian-950 border-t-transparent rounded-full animate-spin"></div>
                    Transmitting Message...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message to Concierge
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Location & Map Section */}
        <div className="space-y-8">
          {/* Contact Details Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gold-400/20 space-y-6">
            <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
              Restaurant Information
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Address</span>
                  <p className="text-white">
                    {settings?.address || "Sheikh Mohammed bin Rashid Blvd, Downtown Dubai, UAE"}
                  </p>
                  <span className="text-[11px] text-gold-400">Valet parking at entrance</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Reservations & Concierge</span>
                  <a href={`tel:${settings?.phone || "+971 4 888 3456"}`} className="text-white hover:text-gold-300 transition-colors">
                    {settings?.phone || "+971 4 888 3456"}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Official Inquiries</span>
                  <a href={`mailto:${settings?.email || "reservations@layalidubai.ae"}`} className="text-white hover:text-gold-300 transition-colors">
                    {settings?.email || "reservations@layalidubai.ae"}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Operating Hours</span>
                  <p className="text-white">
                    Open Daily: {settings?.opening_time || "12:00"} PM – {settings?.closing_time || "01:00"} AM
                  </p>
                  <span className="text-[11px] text-slate-400">Lunch, Dinner, and Royal Shisha Lounge</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Google Map Embed */}
          <div className="glass-panel p-2 rounded-2xl border border-gold-400/20 overflow-hidden shadow-2xl h-80">
            <iframe
              title="Layali Dubai Restaurant Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14440.759163625442!2d55.27116799516602!3d25.196887507317785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43348a67e24b%3A0xff45e502e1ceb7e2!2sBurj%20Khalifa!5e0!3m2!1sen!2sae!4v1700000000000!5m2!1sen!2sae"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '0.75rem', filter: 'invert(90%) hue-rotate(180deg)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};
