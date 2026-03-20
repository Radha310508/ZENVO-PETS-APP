import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, TrendingUp, Calendar, Share2 } from 'lucide-react';

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center mb-16"
        >
          <div className="flex items-center gap-2">
            <Heart className="text-brand-primary" size={32} />
            <h1 className="text-2xl font-manrope font-bold text-slate-800">ZENVO PETS</h1>
          </div>
          <button
            data-testid="landing-login-button"
            onClick={() => navigate('/login')}
            className="px-6 py-2 text-brand-primary hover:bg-brand-secondary rounded-full transition-colors btn-scale"
          >
            Sign In
          </button>
        </motion.nav>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-5xl font-manrope font-bold text-slate-800 mb-6 tracking-tight">
              Understand your dog better, one day at a time
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Track behavior, triggers, and health in one place. Notice patterns earlier and care with more confidence.
            </p>
            <button
              data-testid="landing-get-started-button"
              onClick={() => navigate('/login')}
              className="bg-brand-primary text-white px-8 py-4 rounded-full font-medium hover:bg-[#4a7c8f] transition-all shadow-sm btn-scale text-lg"
            >
              Get Started Free
            </button>
          </motion.div>

          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1759701827831-12bd95f1f0ce?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHw0fHxoYXBweSUyMGRvZyUyMG93bmVyJTIwdXJiYW4lMjBwYXJrfGVufDB8fHx8MTc3NDAxNjg2N3ww&ixlib=rb-4.1.0&q=85"
              alt="Happy dog with owner"
              className="rounded-3xl shadow-lg w-full"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-4 gap-6 mb-20"
        >
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm card-hover">
            <div className="bg-brand-tertiary w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Heart className="text-brand-primary" size={24} />
            </div>
            <h3 className="font-manrope font-semibold text-xl mb-2 text-slate-800">Daily Tracking</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Log appetite, energy, mood, and sleep in under 1 minute</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm card-hover">
            <div className="bg-brand-tertiary w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="text-brand-primary" size={24} />
            </div>
            <h3 className="font-manrope font-semibold text-xl mb-2 text-slate-800">AI Insights</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Get weekly summaries highlighting patterns and changes</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm card-hover">
            <div className="bg-brand-tertiary w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Calendar className="text-brand-primary" size={24} />
            </div>
            <h3 className="font-manrope font-semibold text-xl mb-2 text-slate-800">Smart Reminders</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Never miss vaccinations or important care tasks</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm card-hover">
            <div className="bg-brand-tertiary w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Share2 className="text-brand-primary" size={24} />
            </div>
            <h3 className="font-manrope font-semibold text-xl mb-2 text-slate-800">Share Reports</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Export care summaries to share with your vet</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm"
        >
          <h3 className="text-3xl font-manrope font-bold text-slate-800 mb-4">
            Start caring with confidence
          </h3>
          <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
            Join dog parents who are tracking patterns, reducing anxiety, and making better care decisions.
          </p>
          <button
            data-testid="landing-cta-button"
            onClick={() => navigate('/login')}
            className="bg-brand-primary text-white px-8 py-4 rounded-full font-medium hover:bg-[#4a7c8f] transition-all shadow-sm btn-scale text-lg"
          >
            Create Your Free Account
          </button>
        </motion.div>
      </div>
    </div>
  );
};
