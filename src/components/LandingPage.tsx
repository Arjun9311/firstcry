'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  Award, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Play, 
  CheckCircle,
  TrendingUp,
  DollarSign,
  Heart,
  AlertCircle
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onEnterDemo: () => void;
}

export default function LandingPage({ onGetStarted, onEnterDemo }: LandingPageProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 text-slate-800 selection:bg-yellow-200 selection:text-slate-900">
      {/* 5.2 Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-50"
      >
        <source 
          src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" 
          type="video/mp4" 
        />
      </video>

      {/* Light luxury overlay for readability */}
      <div className="absolute inset-0 bg-white/70 z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-white via-white/80 to-transparent z-10"></div>

      {/* Top Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-16 py-6 border-b border-slate-200/50 backdrop-blur-md bg-white/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-yellow-500/20">
            <span className="text-black font-extrabold text-lg">F</span>
          </div>
          <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-slate-900 via-slate-800 to-yellow-600 bg-clip-text text-transparent flex items-center">
            FirstCry.com <span className="text-yellow-600 font-semibold text-xs tracking-wider px-2 py-0.5 rounded-full bg-yellow-100 uppercase ml-3">BrainBees</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-yellow-600 transition-colors">Features</a>
          <a href="#modules" className="hover:text-yellow-600 transition-colors">Modules</a>
          <a href="#security" className="hover:text-yellow-600 transition-colors">Security</a>
          <a href="#about" className="hover:text-yellow-600 transition-colors">About</a>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onEnterDemo}
            className="hidden sm:inline-flex rounded-full border border-slate-200 bg-white/60 px-5 py-2 text-sm font-semibold hover:bg-white hover:text-slate-900 transition-all duration-300 shadow-sm"
          >
            Launch Demo
          </button>
          <button 
            onClick={onGetStarted}
            className="rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 text-black px-6 py-2.5 text-sm font-bold shadow-lg shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Content Section */}
      <div className="relative z-20 flex min-h-[85vh] flex-col justify-center px-6 md:px-16 pt-16 pb-24">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-yellow-800 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-yellow-600" />
            Complete Preschool & Daycare Business Management System
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-8xl font-black leading-none tracking-tight text-slate-900">
            One Smart Platform <br />
            <span className="bg-gradient-to-r from-yellow-600 via-amber-600 to-slate-800 bg-clip-text text-transparent">
              to Manage Your Centre
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-8 max-w-3xl text-lg md:text-xl text-slate-600 leading-relaxed font-normal">
            Manage admissions, student profiles, fee receipts, parent communication, 
            QR pickup safety, daycare routines, staff duties, curriculum planning, 
            and business reports from one powerful dashboard. Reduce operations friction by 90%.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onGetStarted}
              className="rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 px-8 py-4 text-black font-extrabold hover:scale-[1.03] active:scale-95 transition-all duration-300 shadow-xl shadow-yellow-500/20 flex items-center justify-center gap-2 group text-base"
            >
              Sign In to Platform
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <a 
              href="#modules"
              className="rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm px-8 py-4 text-slate-700 font-semibold hover:bg-slate-100 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
            >
              View Modules
            </a>
          </div>

          {/* Core Stats highlights */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
            <div className="rounded-2xl border border-slate-200/60 bg-white/75 p-5 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-yellow-500/30 group">
              <h3 className="text-3xl font-black text-yellow-600 group-hover:scale-110 transition-transform origin-left">18+</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Operational Modules</p>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white/75 p-5 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-yellow-500/30 group">
              <h3 className="text-3xl font-black text-yellow-600 group-hover:scale-110 transition-transform origin-left">6</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">User Access Roles</p>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white/75 p-5 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-yellow-500/30 group">
              <h3 className="text-3xl font-black text-yellow-600 group-hover:scale-110 transition-transform origin-left">QR</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Authorized Pickups</p>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white/75 p-5 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-yellow-500/30 group">
              <h3 className="text-3xl font-black text-yellow-600 group-hover:scale-110 transition-transform origin-left">360°</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Centre Operations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Feature Matrix Section */}
      <section id="modules" className="relative z-20 bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-yellow-600 mb-3">Enterprise Capabilities</h2>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">18 Integrated Modules</h2>
            <p className="text-slate-500 mt-4 text-lg font-normal">
              We replaced disjointed apps, paper sign sheets, and Excel records with a unified, high-integrity platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-6 transition-all duration-300 hover:bg-white hover:shadow-lg hover:border-yellow-500/25">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-600 mb-6">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Fees & Expense Tracker</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Automate installments schedules, record payments, email pdf receipts, and compute facility profits dynamically.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-6 transition-all duration-300 hover:bg-white hover:shadow-lg hover:border-yellow-500/25">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-600 mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Authorized QR Pickup</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Unique encrypted guardian QR codes scanned during dismissal to verify permissions and log pickup timestamps.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-6 transition-all duration-300 hover:bg-white hover:shadow-lg hover:border-yellow-500/25">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-600 mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Profile & Attendance</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Class-wise allocation, emergency contacts, allergy alerts, and attendance rosters for teachers and staff.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-6 transition-all duration-300 hover:bg-white hover:shadow-lg hover:border-yellow-500/25">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-600 mb-6">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Daycare Routine Logs</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Log meal portions, naps, diaper changes, activities, and emotional moods in real time for parent tracking.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-6 transition-all duration-300 hover:bg-white hover:shadow-lg hover:border-yellow-500/25">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-600 mb-6">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Curriculum & Tasks</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Monthly thematic lesson planners, worksheet uploads, class duties allocation, and teacher performance tracking.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-6 transition-all duration-300 hover:bg-white hover:shadow-lg hover:border-yellow-500/25">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-600 mb-6">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Leads & Occupancy</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Counselor Kanban lead logs, demo scheduling, converted admissions alerts, and real-time seat availability maps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Statement */}
      <section id="security" className="relative z-20 py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 md:px-16 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-600 mb-6">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-slate-900">Enterprise-Grade Security & Data Isolation</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-1" />
                <p className="text-slate-600"><span className="font-semibold text-slate-800">Strict Data Isolation:</span> Parents can only view their own child's photos, routine updates, and bills.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-1" />
                <p className="text-slate-600"><span className="font-semibold text-slate-800">Role-Based Access (RBAC):</span> Access is limited by user role (Super Admin, Teacher, Parent, Daycare Staff, Counsellor, Accountant).</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-1" />
                <p className="text-slate-600"><span className="font-semibold text-slate-800">Encrypted QR Audits:</span> Single-use QR generation limits risk, keeping child pickup lines safe and logged.</p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="relative rounded-2xl border border-slate-200/80 bg-white p-8 overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-yellow-500/5 blur-3xl"></div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Prototype Demonstration
              </h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                This system runs a simulated JSON Database with persistent file storage and contains 6 fully interactive user roles with seed profiles.
              </p>
              <button 
                onClick={onEnterDemo}
                className="w-full rounded-xl bg-slate-900 text-white font-bold py-3 hover:bg-yellow-500 hover:text-black transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-slate-900/10"
              >
                Launch Live Simulator
                <Play className="h-4 w-4 fill-current" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Company Section */}
      <section id="about" className="relative z-20 py-24 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 md:px-16 space-y-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-yellow-600 mb-3">About BrainBees</h2>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">FirstCry.com (BrainBees Solutions Ltd.)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-600 text-sm leading-relaxed font-normal">
            <div className="space-y-6">
              <p>
                FirstCry is India’s leading e-commerce company in the kids and babies shopping sector, established in 2010 by Supam Maheshwari and Amitava Saha, headquartered in Pune. With more than 25 million customers in the domestic and international markets and 6000+ employees, we believe that the first cry of a baby is the most special moment for a mom and dad! Our mission is to make this, and all other moments of parenthood, filled with joy and happiness.
              </p>
              <p>
                We are committed to making the parenting experience beautiful, from safe shopping to supporting parents in Parenting, child’s education, making learning fun for kids through our Edutainment solutions.
              </p>
            </div>
            
            <div className="space-y-6 bg-slate-50 border border-slate-200/60 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-yellow-500/5 blur-2xl"></div>
              <p>
                As an organization, we have transformed constantly to the ever-changing, fast-paced industry and we have people who are very well adept at this pace. Our culture throbs with a passion to constantly innovate and be at the forefront which is nurtured by motivated individuals and teams who take ownership of any challenge they take up and are self-driven.
              </p>
              <p className="font-semibold text-slate-700">
                As an organization, we are trendsetters and are always on the lookout for curious, self-driven individuals who love challenges.
              </p>
              
              <div className="border-t border-slate-200/80 pt-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Careers at BrainBees</span>
                <p className="text-xs text-slate-600">
                  Get in touch with us at <a href="mailto:hr@firstcry.com" className="font-bold text-yellow-600 hover:text-yellow-750 hover:underline">hr@firstcry.com</a> for career opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 py-12 border-t border-slate-200 text-center text-xs text-slate-400 bg-slate-50">
        <p>© 2026 FirstCry.com (BrainBees Solutions Ltd.). All Rights Reserved. Built with Next.js, React, Tailwind CSS, Recharts.</p>
      </footer>
    </div>
  );
}
