import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, X, UtensilsCrossed, Calendar, Phone, Sparkles, Shield, Search } from 'lucide-react';
import { RealtimeStatusBadge } from './RealtimeStatusBadge';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Reserve Table', path: '/reserve' },
    { name: 'Track Booking', path: '/lookup' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-obsidian-950/90 backdrop-blur-md border-b border-gold-400/20 py-3 shadow-2xl'
          : 'bg-gradient-to-b from-obsidian-950/80 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border border-gold-400/60 flex items-center justify-center bg-obsidian-900 group-hover:border-gold-300 transition-colors shadow-gold-glow">
              <Sparkles className="w-5 h-5 text-gold-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-widest text-gold-gradient uppercase">
                Layali Dubai
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gold-400/80 -mt-1 font-sans">
                Royal Lounge & Dining
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium tracking-wide transition-colors relative py-1 ${
                    isActive
                      ? 'text-gold-300 font-semibold'
                      : 'text-slate-300 hover:text-gold-200'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-gold-400 to-amber-300 rounded-full shadow-gold-glow"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            <RealtimeStatusBadge />
            
            {isAuthenticated && isAdmin ? (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gold-400/10 border border-gold-400/40 text-gold-300 hover:bg-gold-400/20 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-gold-400" />
                Admin Portal
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="text-xs text-slate-400 hover:text-gold-300 transition-colors px-2 py-1"
                title="Admin Sign In"
              >
                Staff Access
              </Link>
            )}

            <Link
              to="/reserve"
              className="btn-gold text-xs font-semibold uppercase tracking-wider py-2.5 px-5 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book Table
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <RealtimeStatusBadge />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-obsidian-900 border border-gold-400/30 text-gold-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden bg-obsidian-950/95 border-b border-gold-400/20 backdrop-blur-xl px-6 py-6 animate-slide-down">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-base font-medium py-2 px-3 rounded-md transition-colors ${
                  location.pathname === link.path
                    ? 'bg-gold-400/10 text-gold-300 font-semibold border-l-2 border-gold-400'
                    : 'text-slate-300 hover:text-white hover:bg-obsidian-850'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
              <Link
                to="/reserve"
                className="btn-gold text-center py-3 text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Book Table
              </Link>

              {isAuthenticated && isAdmin ? (
                <Link
                  to="/admin"
                  className="flex items-center justify-center gap-2 text-sm text-center py-2.5 rounded-md border border-gold-400/40 text-gold-300 bg-gold-400/10"
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              ) : (
                <Link
                  to="/admin/login"
                  className="text-xs text-center text-slate-400 hover:text-gold-300 py-1"
                >
                  Staff / Admin Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
