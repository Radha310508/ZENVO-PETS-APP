import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://zenvo-pets-backend.onrender.com";
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

const OPTIONS = {
  appetite: ['Excellent', 'Good', 'Normal', 'Low', 'Very Low'],
  energy: ['Very High', 'High', 'Normal', 'Low', 'Very Low'],
  mood: ['Happy', 'Playful', 'Calm', 'Anxious', 'Irritable'],
  sleep: ['Excellent', 'Good', 'Normal', 'Restless', 'Poor'],
};

export const DailyLog = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [pet, setPet] = useState(null);
  const [formData, setFormData] = useState({
    appetite: '',
    energy: '',
    mood: '',
    sleep: '',
    unusual_behavior: '',
    triggers: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [petId]);

  const loadData = async () => {
    try {
      const [petRes, logRes] = await Promise.all([
        axios.get(`${API}/pets/${petId}`, {
          headers: getAuthHeaders(),
          withCredentials: true,
        }),
        axios.get(`${API}/logs/today?pet_id=${petId}`, {
          headers: getAuthHeaders(),
          withCredentials: true,
        }),
      ]);

      setPet(petRes.data);
      if (logRes.data) {
        setFormData(logRes.data);
      }
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load data');
    }
  };

  const handleSelect = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.appetite || !formData.energy || !formData.mood || !formData.sleep) {
      toast.error('Please select all required fields');
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API}/logs`,
        {
          pet_id: petId,
          date: today,
          ...formData,
        },
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );

      toast.success('Daily log saved!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save log');
    } finally {
      setLoading(false);
    }
  };

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          data-testid="back-to-dashboard"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 btn-scale"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-manrope font-bold text-slate-800 mb-2">
              Daily Log for {pet.name}
            </h2>
            <p className="text-slate-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Appetite *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {OPTIONS.appetite.map((option) => (
                  <button
                    key={option}
                    type="button"
                    data-testid={`appetite-${option.toLowerCase().replace(' ', '-')}`}
                    onClick={() => handleSelect('appetite', option)}
                    className={`p-4 rounded-xl border-2 transition-all btn-scale ${
                      formData.appetite === option
                        ? 'border-brand-primary bg-brand-tertiary text-brand-primary font-medium'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {option}
                    {formData.appetite === option && (
                      <Check size={16} className="ml-auto mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Energy *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {OPTIONS.energy.map((option) => (
                  <button
                    key={option}
                    type="button"
                    data-testid={`energy-${option.toLowerCase().replace(' ', '-')}`}
                    onClick={() => handleSelect('energy', option)}
                    className={`p-4 rounded-xl border-2 transition-all btn-scale ${
                      formData.energy === option
                        ? 'border-brand-primary bg-brand-tertiary text-brand-primary font-medium'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {option}
                    {formData.energy === option && (
                      <Check size={16} className="ml-auto mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Mood *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {OPTIONS.mood.map((option) => (
                  <button
                    key={option}
                    type="button"
                    data-testid={`mood-${option.toLowerCase()}`}
                    onClick={() => handleSelect('mood', option)}
                    className={`p-4 rounded-xl border-2 transition-all btn-scale ${
                      formData.mood === option
                        ? 'border-brand-primary bg-brand-tertiary text-brand-primary font-medium'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {option}
                    {formData.mood === option && (
                      <Check size={16} className="ml-auto mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Sleep *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {OPTIONS.sleep.map((option) => (
                  <button
                    key={option}
                    type="button"
                    data-testid={`sleep-${option.toLowerCase()}`}
                    onClick={() => handleSelect('sleep', option)}
                    className={`p-4 rounded-xl border-2 transition-all btn-scale ${
                      formData.sleep === option
                        ? 'border-brand-primary bg-brand-tertiary text-brand-primary font-medium'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {option}
                    {formData.sleep === option && (
                      <Check size={16} className="ml-auto mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Unusual Behavior
              </label>
              <input
                data-testid="unusual-behavior-input"
                type="text"
                value={formData.unusual_behavior}
                onChange={(e) =>
                  setFormData({ ...formData, unusual_behavior: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white rounded-xl transition-all outline-none"
                placeholder="e.g., Excessive barking, hiding"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Possible Triggers
              </label>
              <input
                data-testid="triggers-input"
                type="text"
                value={formData.triggers}
                onChange={(e) =>
                  setFormData({ ...formData, triggers: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white rounded-xl transition-all outline-none"
                placeholder="e.g., Loud noises, visitors, new environment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Additional Notes
              </label>
              <textarea
                data-testid="notes-input"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white rounded-xl transition-all outline-none"
                placeholder="Any other observations..."
                rows="3"
              />
            </div>

            <button
              data-testid="save-log-button"
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary text-white py-4 rounded-full font-medium hover:bg-[#4a7c8f] transition-all shadow-sm btn-scale disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Daily Log'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
