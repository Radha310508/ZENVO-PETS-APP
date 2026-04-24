import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Dog, FileText, TrendingUp, Bell, LogOut, Plus, Calendar, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://zenvo-pets-backend.onrender.com";
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [petsRes, logsRes, summariesRes, remindersRes] = await Promise.all([
        axios.get(`${API}/pets`, { headers: getAuthHeaders(), withCredentials: true }),
        axios.get(`${API}/logs`, { headers: getAuthHeaders(), withCredentials: true }),
        axios.get(`${API}/summaries`, { headers: getAuthHeaders(), withCredentials: true }),
        axios.get(`${API}/reminders`, { headers: getAuthHeaders(), withCredentials: true }),
      ]);

      setPets(petsRes.data);
      setLogs(logsRes.data);
      setSummaries(summariesRes.data);
      setReminders(remindersRes.data.filter(r => !r.is_completed));
    } catch (error) {
      console.error('Dashboard load error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getTodayLog = (petId) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return logs.find(log => log.pet_id === petId && log.date === today);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zen">
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Dog className="text-brand-primary" size={28} />
              <h1 className="text-xl font-manrope font-bold text-slate-800">ZENVO PETS</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Hi, {user?.name}</span>
              <button
                data-testid="logout-button"
                onClick={handleLogout}
                className="text-slate-600 hover:text-slate-800 btn-scale"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-manrope font-bold text-slate-800 mb-2">Your Dashboard</h2>
          <p className="text-slate-600">Track your dog's wellbeing and patterns</p>
        </motion.div>

        {pets.length === 0 ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm"
          >
            <Dog className="text-brand-primary mx-auto mb-4" size={64} />
            <h3 className="text-2xl font-manrope font-bold text-slate-800 mb-4">
              Add your first pet
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Start your care journey by creating a profile for your dog
            </p>
            <button
              data-testid="add-pet-button"
              onClick={() => navigate('/pet/new')}
              className="bg-brand-primary text-white px-8 py-3 rounded-full font-medium hover:bg-[#4a7c8f] transition-all shadow-sm btn-scale inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Add Pet Profile
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {pets.map((pet, idx) => {
                const todayLog = getTodayLog(pet.pet_id);
                return (
                  <motion.div
                    key={pet.pet_id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm card-hover"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-manrope font-bold text-slate-800">{pet.name}</h3>
                        <p className="text-slate-500 text-sm">{pet.breed} • {pet.age} years • {pet.weight}kg</p>
                      </div>
                      <button
                        data-testid={`pet-profile-button-${pet.pet_id}`}
                        onClick={() => navigate(`/pet/${pet.pet_id}`)}
                        className="text-brand-primary hover:bg-brand-tertiary p-2 rounded-lg transition-colors"
                      >
                        <FileText size={20} />
                      </button>
                    </div>

                    {todayLog ? (
                      <div className="bg-brand-tertiary rounded-xl p-4 mb-4">
                        <p className="text-sm font-medium text-brand-primary mb-2">Today's Log</p>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className="text-slate-500 block">Appetite</span>
                            <span className="text-slate-800 font-medium">{todayLog.appetite}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Energy</span>
                            <span className="text-slate-800 font-medium">{todayLog.energy}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Mood</span>
                            <span className="text-slate-800 font-medium">{todayLog.mood}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Sleep</span>
                            <span className="text-slate-800 font-medium">{todayLog.sleep}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-100">
                        <p className="text-sm text-amber-800">⚠️ No log today yet</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        data-testid={`log-today-button-${pet.pet_id}`}
                        onClick={() => navigate(`/log/${pet.pet_id}`)}
                        className="flex-1 bg-brand-primary text-white py-2 rounded-full text-sm font-medium hover:bg-[#4a7c8f] transition-all btn-scale"
                      >
                        {todayLog ? 'Update Log' : 'Log Today'}
                      </button>
                      <button
                        data-testid={`view-insights-button-${pet.pet_id}`}
                        onClick={() => navigate(`/insights/${pet.pet_id}`)}
                        className="bg-slate-100 text-slate-700 py-2 px-3 rounded-full text-sm font-medium hover:bg-slate-200 transition-all btn-scale flex items-center justify-center gap-1"
                      >
                        <TrendingUp size={16} />
                        Insights
                      </button>
                      <button
                        data-testid={`view-summary-button-${pet.pet_id}`}
                        onClick={() => navigate(`/summary/${pet.pet_id}`)}
                        className="bg-slate-100 text-slate-700 py-2 px-3 rounded-full text-sm font-medium hover:bg-slate-200 transition-all btn-scale"
                        title="View Care Summary"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              <button
                data-testid="add-another-pet-button"
                onClick={() => navigate('/pet/new')}
                className="w-full bg-white border-2 border-dashed border-slate-200 text-slate-600 py-4 rounded-2xl font-medium hover:border-brand-primary hover:text-brand-primary transition-all btn-scale flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Another Pet
              </button>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-manrope font-semibold text-lg text-slate-800">Reminders</h3>
                  <button
                    data-testid="manage-reminders-button"
                    onClick={() => navigate('/reminders')}
                    className="text-brand-primary hover:bg-brand-tertiary p-2 rounded-lg transition-colors"
                  >
                    <Bell size={20} />
                  </button>
                </div>
                {reminders.length === 0 ? (
                  <p className="text-slate-500 text-sm">No upcoming reminders</p>
                ) : (
                  <div className="space-y-3">
                    {reminders.slice(0, 3).map((reminder) => (
                      <div
                        key={reminder.reminder_id}
                        className="bg-slate-50 rounded-lg p-3"
                      >
                        <p className="text-sm font-medium text-slate-800">{reminder.title}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {format(new Date(reminder.scheduled_for), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {summaries.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                >
                  <h3 className="font-manrope font-semibold text-lg text-slate-800 mb-4">Latest Insight</h3>
                  <div className="bg-brand-tertiary rounded-lg p-4">
                    <p className="text-sm text-slate-700 mb-2">
                      {summaries[0].summary_text.substring(0, 150)}...
                    </p>
                    <button
                      data-testid="view-full-summary-button"
                      onClick={() => navigate(`/insights/${summaries[0].pet_id}`)}
                      className="text-brand-primary text-sm font-medium hover:underline"
                    >
                      View full summary
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
