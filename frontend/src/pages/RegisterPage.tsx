import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, ArrowLeft, Dumbbell } from 'lucide-react';

const GYM_BG_IMAGE = 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1920&q=80';
const GYM_BG_FALLBACK = '/images/landing/user-data.svg';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bgSrc, setBgSrc] = useState<string>(GYM_BG_IMAGE);

  // Preload background image with fallback
  useEffect(() => {
    const imgObj = new Image();
    imgObj.src = GYM_BG_IMAGE;
    imgObj.onerror = () => {
      setBgSrc(GYM_BG_FALLBACK);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, confirmPassword);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen max-h-[100dvh] w-screen overflow-hidden flex items-center justify-center p-3 sm:p-4 font-sans relative selection:bg-[#865BC4] selection:text-white">
      
      {/* 1. FULL-VIEWPORT GYM BACKGROUND LAYER */}
      <div className="absolute inset-0 select-none pointer-events-none z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${bgSrc}')` }}
          role="img"
          aria-label="Professional gym fitness background"
        />

        {/* Overlay Layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg-main)]/95 via-[var(--bg-surface)]/85 to-[var(--bg-main)]/90" />
        <div className="absolute inset-0 bg-[#865BC4]/15 backdrop-blur-[2px]" />
      </div>

      {/* 2. FROSTED GLASS REGISTER CARD */}
      <div 
        className="relative z-10 w-full max-w-[560px] max-h-[calc(100dvh-24px)] rounded-3xl p-6 sm:p-8 border border-[var(--border-subtle)] shadow-[0_20px_60px_rgba(15,13,22,0.3)] ring-1 ring-[#865BC4]/20 backdrop-blur-[24px] backdrop-saturate-[115%] overflow-y-auto bg-[var(--bg-card)] transition-colors duration-200"
      >
        {/* Top-Left Back to Home Navigation Button */}
        <Link
          to="/"
          title="Back to Home"
          aria-label="Back to Home"
          className="absolute top-5 left-5 sm:top-6 sm:left-6 w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] backdrop-blur-sm flex items-center justify-center text-[var(--text-primary)] hover:text-white hover:bg-[#865BC4] hover:border-transparent shadow-sm hover:shadow-[#865BC4]/30 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#865BC4]/30 z-20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        {/* Existing Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-5 pt-1">
          <div className="w-10 h-10 rounded-xl bg-[#865BC4] flex items-center justify-center text-white shadow-md shadow-[#865BC4]/30">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[var(--text-primary)]">
            FitMind
          </span>
        </div>

        {/* Heading & Subtitle */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] text-center tracking-tight mb-0.5">
          Create Account
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] text-center mb-6">
          Start your personal AI fitness journey
        </p>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center gap-3 text-rose-300 text-xs sm:text-sm font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full h-12 pl-11 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--text-secondary)] rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-secondary)] hover:border-[var(--text-secondary)] focus:outline-none focus:bg-[var(--bg-card)] focus:border-[#865BC4] focus:ring-4 focus:ring-[#865BC4]/20 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-12 pl-11 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--text-secondary)] rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-secondary)] hover:border-[var(--text-secondary)] focus:outline-none focus:bg-[var(--bg-card)] focus:border-[#865BC4] focus:ring-4 focus:ring-[#865BC4]/20 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Password with Eye Icon Toggle */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-12 pl-11 pr-11 py-2.5 bg-[var(--bg-input)] border border-[var(--text-secondary)] rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-secondary)] hover:border-[var(--text-secondary)] focus:outline-none focus:bg-[var(--bg-card)] focus:border-[#865BC4] focus:ring-4 focus:ring-[#865BC4]/20 transition-all duration-200 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[#865BC4] transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#865BC4]/20"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password with Eye Icon Toggle */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full h-12 pl-11 pr-11 py-2.5 bg-[var(--bg-input)] border border-[var(--text-secondary)] rounded-xl text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-secondary)] hover:border-[var(--text-secondary)] focus:outline-none focus:bg-[var(--bg-card)] focus:border-[#865BC4] focus:ring-4 focus:ring-[#865BC4]/20 transition-all duration-200 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[#865BC4] transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#865BC4]/20"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group w-full h-13 py-3 rounded-xl font-bold bg-[#865BC4] hover:bg-[#9868DC] text-white shadow-lg shadow-[#865BC4]/30 hover:shadow-[#865BC4]/40 text-base flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-[#865BC4]/20 mt-4"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />}
          </button>
        </form>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
          Already have an account?{' '}
          <Link to="/login" className="text-[#865BC4] font-semibold hover:text-[#9868DC] hover:underline transition-colors">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};
