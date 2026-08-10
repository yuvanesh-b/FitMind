import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, ArrowRight, ChevronRight } from 'lucide-react';

// 4 Distinct High-Quality Fitness Background Images for Cinematic Hero Carousel
const HERO_IMAGES = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1920&q=80',
    fallback: '/images/landing/user-data.svg',
    alt: 'Male athlete performing dumbbell strength training in modern gym',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1920&q=80',
    fallback: '/images/landing/personalized.svg',
    alt: 'Female athlete performing strength workout in modern gym',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1920&q=80',
    fallback: '/images/landing/ai-analysis.svg',
    alt: 'Athlete training with 1-on-1 personal trainer coaching',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80',
    fallback: '/images/landing/better-training.svg',
    alt: 'Athlete performing heavy compound strength exercise',
  },
];

export const LandingPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, string>>({});
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll detection for fixed dynamic glassmorphic navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Preload hero images immediately on mount with error fallback
  useEffect(() => {
    HERO_IMAGES.forEach((img, idx) => {
      const imageObj = new Image();
      imageObj.src = img.url;
      imageObj.onload = () => {
        setLoadedImages((prev) => ({ ...prev, [idx]: img.url }));
      };
      imageObj.onerror = () => {
        setLoadedImages((prev) => ({ ...prev, [idx]: img.fallback }));
      };
    });
  }, []);

  // Automatic Hero Background Carousel - Rotates every 3 seconds (3000ms)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 3000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col font-sans selection:bg-[#865BC4] selection:text-white relative overflow-y-auto overflow-x-hidden">
      
      {/* 1. FIXED NAVBAR WITH DYNAMIC SCROLL GLASSMORPHISM */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isScrolled
            ? 'bg-[#0A0C14]/80 backdrop-blur-[16px] border-b border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.15)] py-3.5'
            : 'bg-transparent border-b border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Existing FitMind Logo Header */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#865BC4] flex items-center justify-center text-white shadow-md shadow-[#865BC4]/30 group-hover:scale-105 group-hover:shadow-[#865BC4]/60 transition-all duration-200">
              <Dumbbell className="w-5 h-5 text-white group-hover:rotate-6 transition-transform duration-200" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-purple-100 transition-colors">
              FitMind
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-[#865BC4] hover:-translate-y-0.5 transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#865BC4]"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="group/btn px-5 py-2.5 rounded-xl text-sm font-bold bg-[#865BC4] hover:bg-[#7347B0] text-white shadow-lg shadow-[#865BC4]/30 hover:shadow-[#865BC4]/50 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#865BC4] focus:ring-offset-2 focus:ring-offset-[#0B0F17]"
            >
              <span>Start Training</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. CINEMATIC HERO SECTION WITH 4-IMAGE 3-SECOND AUTOMATIC CAROUSEL */}
      <main className="relative min-h-[660px] lg:min-h-[740px] flex-1 flex flex-col justify-center px-6 lg:px-12 pt-28 sm:pt-32 lg:pt-36 pb-16 overflow-hidden">
        
        {/* HERO BACKGROUND CAROUSEL LAYER (NO DOT NAVIGATION, 3-SECOND INTERVAL) */}
        <div className="absolute inset-0 select-none pointer-events-none z-0">
          {HERO_IMAGES.map((img, idx) => {
            const imgSrc = loadedImages[idx] || img.url;
            const isActive = idx === currentIndex;
            return (
              <div
                key={img.id}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
                style={{
                  backgroundImage: `url('${imgSrc}')`,
                  transitionProperty: 'opacity, transform',
                  transitionDuration: '1000ms',
                }}
                role="img"
                aria-label={img.alt}
              />
            );
          })}

          {/* Gradient & Vignette Overlay for High Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F17]/95 via-[#0B0F17]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/50 to-transparent" />
        </div>

        {/* HERO CONTENT LAYER */}
        <div className="relative z-10 max-w-7xl mx-auto w-full text-left">
          <div className="max-w-2xl flex flex-col items-start space-y-6">
            
            {/* HERO HEADLINE */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Train smarter. <br />
              <span className="bg-gradient-to-r from-[#865BC4] via-[#9C8BB2] to-[#818CF8] bg-clip-text text-transparent">
                Built around your data.
              </span>
            </h1>

            {/* HERO SUBHEADING */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 font-normal leading-relaxed max-w-xl">
              An intelligent personal fitness coach that learns from your workouts, nutrition, goals, and progress to deliver personalized training and fitness recommendations.
            </p>

            {/* CTA BUTTONS */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                to="/register"
                className="group/cta w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-[#865BC4] hover:bg-[#7347B0] text-white shadow-xl shadow-[#865BC4]/35 hover:shadow-[#865BC4]/50 text-base flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#865BC4]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover/cta:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md text-base flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-[#865BC4]"
              >
                <span>Sign In</span>
              </Link>
            </div>

            {/* TRUST INDICATORS */}
            <p className="text-xs text-slate-400 font-medium pt-1">
              ✓ Personalized workouts • ✓ Nutrition tracking • ✓ Intelligent coaching
            </p>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-8 bg-[#0B0F17] border-t border-white/10 text-center text-xs text-slate-400 relative z-10">
        <p>© 2026 FitMind Personal Fitness Coach. All rights reserved.</p>
      </footer>
    </div>
  );
};
