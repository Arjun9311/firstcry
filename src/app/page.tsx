'use client';

import React, { useState, useEffect } from 'react';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import axios from 'axios';
import { Lock, Mail, RefreshCw, X, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hydration check + local session restore
  useEffect(() => {
    const session = localStorage.getItem('littlecare_session');
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const userData = res.data.user;
      
      setUser(userData);
      localStorage.setItem('littlecare_session', JSON.stringify(userData));
      setShowLogin(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Try Sarah Jenkins (admin@littlecare.com).');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (mockEmail: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { 
        email: mockEmail, 
        password: 'password123' 
      });
      const userData = res.data.user;
      
      setUser(userData);
      localStorage.setItem('littlecare_session', JSON.stringify(userData));
      setShowLogin(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('littlecare_session');
  };

  // If user is authenticated, render the dashboard directly
  if (user) {
    return (
      <Dashboard 
        initialRole={user.role} 
        onLogout={handleLogout} 
      />
    );
  }

  // Render the Landing Page + Login modal overlay
  return (
    <div className="relative min-h-screen bg-slate-50">
      <LandingPage 
        onGetStarted={() => setShowLogin(true)} 
        onEnterDemo={() => handleQuickLogin('admin@littlecare.com')} 
      />

      {/* Login Modal Overlay */}
      {showLogin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative bg-white border border-slate-200 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl animate-in zoom-in duration-200 text-slate-850">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header info */}
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-yellow-500/25">
                <Sparkles className="h-6 w-6 text-black" />
              </div>
              <h3 className="font-extrabold text-2xl tracking-tight text-slate-900">Access FirstCry.com Pro</h3>
              <p className="text-slate-550 text-xs font-semibold">Log in with a user profile credentials below</p>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold rounded-lg text-center leading-normal">
                {error}
              </div>
            )}

            {/* Form controls */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400/50" />
                  <input 
                    required 
                    type="email" 
                    placeholder="admin@littlecare.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/20 text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400/50" />
                  <input 
                    required 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/20 text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 text-black py-3.5 text-sm font-bold hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Sign In"}
              </button>
            </form>

            {/* Quick Demo profiles */}
            <div className="border-t border-slate-100 pt-6 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center">Quick Simulator Access profiles:</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button 
                  onClick={() => handleQuickLogin('admin@littlecare.com')}
                  className="rounded-lg bg-slate-50 border border-slate-200 p-2 hover:bg-slate-105 text-left text-slate-700 transition-all shadow-sm"
                >
                  <span className="block text-yellow-600 font-bold">Admin</span>
                  <span className="text-[10px] text-slate-400 font-normal">Sarah Jenkins</span>
                </button>
                <button 
                  onClick={() => handleQuickLogin('teacher@littlecare.com')}
                  className="rounded-lg bg-slate-50 border border-slate-200 p-2 hover:bg-slate-105 text-left text-slate-700 transition-all shadow-sm"
                >
                  <span className="block text-yellow-600 font-bold">Teacher</span>
                  <span className="text-[10px] text-slate-400 font-normal">Emily Watson</span>
                </button>
                <button 
                  onClick={() => handleQuickLogin('parent@littlecare.com')}
                  className="rounded-lg bg-slate-50 border border-slate-200 p-2 hover:bg-slate-105 text-left text-slate-700 transition-all shadow-sm"
                >
                  <span className="block text-yellow-600 font-bold">Parent</span>
                  <span className="text-[10px] text-slate-400 font-normal">David Miller</span>
                </button>
                <button 
                  onClick={() => handleQuickLogin('staff@littlecare.com')}
                  className="rounded-lg bg-slate-50 border border-slate-200 p-2 hover:bg-slate-105 text-left text-slate-700 transition-all shadow-sm"
                >
                  <span className="block text-yellow-600 font-bold">Daycare</span>
                  <span className="text-[10px] text-slate-400 font-normal">Jessica Cruz</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
