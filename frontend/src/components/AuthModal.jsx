import React, { useState } from 'react';
import { Shield, Lock, Mail, User, Phone, Briefcase, Sparkles, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    specialization: 'Women Safety & Criminal Law',
    barId: '',
    experience: 3,
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (isRegister) {
      const res = await register(formData);
      if (res.success) onClose();
    } else {
      const res = await login(formData.email, formData.password);
      if (res.success) onClose();
    }
    setSubmitting(false);
  };

  const handleDemoSwitch = async (persona) => {
    await demoLogin(persona);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo size="lg" showText={false} />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {isRegister ? 'Join LawShield' : 'Welcome to LawShield'}
          </h2>
          <p className="text-xs text-slate-400">
            {isRegister ? 'Create an account to access AI counsel and legal vault' : 'Access your legal consultations and emergency vault'}
          </p>
        </div>

        {/* 1-Click Instant Persona Quick Buttons */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center justify-center space-x-1">
            <Sparkles size={11} />
            <span>1-Click Instant Test Presets:</span>
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoSwitch('citizen')}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              👩 Citizen
            </button>
            <button
              onClick={() => handleDemoSwitch('lawyer')}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              👨‍⚖️ Lawyer
            </button>
            <button
              onClick={() => handleDemoSwitch('admin')}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isRegister && (
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Account Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="user">Citizen / General User</option>
                  <option value="lawyer">Advocate / Legal Counsel</option>
                </select>
              </div>

              {formData.role === 'lawyer' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Bar ID / Reg Number</label>
                    <input
                      type="text"
                      required
                      value={formData.barId}
                      onChange={(e) => setFormData({ ...formData, barId: e.target.value })}
                      placeholder="D/1234/2020"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Years Experience</label>
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
          >
            {submitting ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
