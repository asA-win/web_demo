import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-obsidian-950 border-t border-gold-400/20 text-slate-400 text-sm relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gold-400/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-gold-400/60 flex items-center justify-center bg-obsidian-900 shadow-gold-glow">
                <Sparkles className="w-5 h-5 text-gold-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold tracking-widest text-gold-gradient uppercase">
                  Layali Dubai
                </span>
                <span className="text-[10px] uppercase tracking-widest text-gold-400/80 -mt-1 font-sans">
                  Royal Lounge & Dining
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              An opulent culinary sanctuary in Downtown Dubai celebrating contemporary Emirati haute cuisine, charcoal grills, and sunset fountain views.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-900 border border-gold-400/30 text-xs text-gold-300">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>100% Halal Certified & Valet Parking</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-gold-300 text-sm font-semibold tracking-wider uppercase">
              Guest Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-gold-200 transition-colors">Culinary Experience</Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-gold-200 transition-colors">A La Carte Menu</Link>
              </li>
              <li>
                <Link to="/reserve" className="hover:text-gold-200 transition-colors">Reserve a Table</Link>
              </li>
              <li>
                <Link to="/lookup" className="hover:text-gold-200 transition-colors">Track or Cancel Reservation</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-200 transition-colors">Private Events & Catering</Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="space-y-3">
            <h4 className="font-serif text-gold-300 text-sm font-semibold tracking-wider uppercase">
              Opening Hours
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">Lunch & Afternoon Tea</p>
                  <p className="text-slate-400">12:00 PM – 05:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">Royal Dinner & Lounge</p>
                  <p className="text-slate-400">06:00 PM – 01:00 AM</p>
                </div>
              </div>
              <p className="text-[11px] text-gold-400/80 pt-1 italic">
                *Kitchen closes at 12:15 AM
              </p>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="space-y-3">
            <h4 className="font-serif text-gold-300 text-sm font-semibold tracking-wider uppercase">
              Contact & Location
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  Sheikh Mohammed bin Rashid Blvd, Downtown Dubai, United Arab Emirates
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <a href="tel:+97148883456" className="text-slate-300 hover:text-gold-300 transition-colors">
                  +971 4 888 3456
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <a href="mailto:reservations@layalidubai.ae" className="text-slate-300 hover:text-gold-300 transition-colors">
                  reservations@layalidubai.ae
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} Layali Dubai Royal Lounge & Dining LLC. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/contact" className="hover:text-slate-400">Dress Code Policy</Link>
            <Link to="/contact" className="hover:text-slate-400">Privacy Notice</Link>
            <Link to="/admin/login" className="text-gold-400/70 hover:text-gold-300">Staff Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
