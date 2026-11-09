import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Sparkles, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const AdminLogin = () => {
  const [email, setEmail] = useState('admin@layalidubai.ae');
  const [password, setPassword] = useState('Admin@Dubai2026');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      addToast('Welcome back to the Layali Dubai Management Console.', 'success', 'Signed In');
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const detail = err.response?.data?.detail || 'Invalid email or password.';
      setError(detail);
      addToast(detail, 'error', 'Authentication Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-obsidian-950 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-2xl border-2 border-gold-400/30 shadow-2xl relative z-10 space-y-8 animate-fade-in">
        {/* Emblem */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full border border-gold-400/70 bg-obsidian-900 flex items-center justify-center mx-auto shadow-gold-glow">
            <Shield className="w-7 h-7 text-gold-400" />
          </div>
          <span className="text-gold-400 font-serif uppercase tracking-[0.25em] text-xs font-semibold block">
            Administrative Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wider uppercase">
            Layali Dubai Access
          </h1>
          <p className="text-slate-400 text-xs">
            Enter administrative credentials to manage reservations, menu items, and restaurant operations.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-gold-400" />
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-gold-400" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>

          {/* Quick Demo Credentials Info */}
          <div className="p-3 rounded-xl bg-obsidian-900/80 border border-gold-400/20 text-[11px] text-slate-400 space-y-1">
            <span className="text-gold-300 font-semibold block">Default Admin Credentials:</span>
            <div className="flex justify-between font-mono text-[10px] text-slate-300">
              <span>Email: admin@layalidubai.ae</span>
              <span>Pass: Admin@Dubai2026</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-gold w-full py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-obsidian-950 border-t-transparent rounded-full animate-spin"></div>
                Authenticating...
              </>
            ) : (
              <>
                <span>Sign In To Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
