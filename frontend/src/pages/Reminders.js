import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Calendar, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

export const Reminders = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [pets, setPets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    pet_id: '',
    title: '',
    description: '',
    reminder_type: 'vaccination',
    scheduled_for: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [remindersRes, petsRes] = await Promise.all([
        axios.get(`${API}/reminders`, {
          headers: getAuthHeaders(),
          withCredentials: true,
        }),
        axios.get(`${API}/pets`, {
          headers: getAuthHeaders(),
          withCredentials: true,
        }),
      ]);

      setReminders(remindersRes.data);
      setPets(petsRes.data);
    } catch (error) {
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        pet_id: formData.pet_id || null,
        scheduled_for: new Date(formData.scheduled_for).toISOString(),
      };

      const response = await axios.post(`${API}/reminders`, payload, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      setReminders([response.data, ...reminders]);
      toast.success('Reminder created!');
      setShowForm(false);
      setFormData({
        pet_id: '',
        title: '',
        description: '',
        reminder_type: 'vaccination',
        scheduled_for: '',
      });
    } catch (error) {
      toast.error('Failed to create reminder');
    }
  };

  const toggleComplete = async (reminderId, isCompleted) => {
    try {
      await axios.patch(
        `${API}/reminders/${reminderId}`,
        { is_completed: !isCompleted },
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );

      setReminders(
        reminders.map((r) =>
          r.reminder_id === reminderId ? { ...r, is_completed: !isCompleted } : r
        )
      );
      toast.success(isCompleted ? 'Reminder marked incomplete' : 'Reminder completed!');
    } catch (error) {
      toast.error('Failed to update reminder');
    }
  };

  const deleteReminder = async (reminderId) => {
    try {
      await axios.delete(`${API}/reminders/${reminderId}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      setReminders(reminders.filter((r) => r.reminder_id !== reminderId));
      toast.success('Reminder deleted');
    } catch (error) {
      toast.error('Failed to delete reminder');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const activeReminders = reminders.filter((r) => !r.is_completed);
  const completedReminders = reminders.filter((r) => r.is_completed);

  return (
    <div className="min-h-screen bg-zen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          data-testid="back-button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 btn-scale"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 flex justify-between items-center"
        >
          <div>
            <h2 className="text-3xl font-manrope font-bold text-slate-800 mb-2">Reminders</h2>
            <p className="text-slate-600">Never miss important care tasks</p>
          </div>
          <button
            data-testid="add-reminder-button"
            onClick={() => setShowForm(!showForm)}
            className="bg-brand-primary text-white px-6 py-3 rounded-full font-medium hover:bg-[#4a7c8f] transition-all shadow-sm btn-scale flex items-center gap-2"
          >
            <Plus size={20} />
            Add Reminder
          </button>
        </motion.div>

        {showForm && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6"
          >
            <h3 className="font-manrope font-semibold text-lg text-slate-800 mb-4">
              New Reminder
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pet (Optional)
                </label>
                <select
                  data-testid="reminder-pet-select"
                  value={formData.pet_id}
                  onChange={(e) => setFormData({ ...formData, pet_id: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white rounded-xl transition-all outline-none"
                >
                  <option value="">All pets</option>
                  {pets.map((pet) => (
                    <option key={pet.pet_id} value={pet.pet_id}>
                      {pet.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title *
                </label>
                <input
                  data-testid="reminder-title-input"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white rounded-xl transition-all outline-none"
                  placeholder="e.g., Rabies vaccination"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type
                </label>
                <select
                  data-testid="reminder-type-select"
                  value={formData.reminder_type}
                  onChange={(e) => setFormData({ ...formData, reminder_type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white rounded-xl transition-all outline-none"
                >
                  <option value="vaccination">Vaccination</option>
                  <option value="checkup">Checkup</option>
                  <option value="grooming">Grooming</option>
                  <option value="medication">Medication</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date *
                </label>
                <input
                  data-testid="reminder-date-input"
                  type="date"
                  value={formData.scheduled_for}
                  onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white rounded-xl transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  data-testid="reminder-description-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white rounded-xl transition-all outline-none"
                  rows="2"
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  data-testid="save-reminder-button"
                  type="submit"
                  className="flex-1 bg-brand-primary text-white py-3 rounded-full font-medium hover:bg-[#4a7c8f] transition-all shadow-sm btn-scale"
                >
                  Save Reminder
                </button>
                <button
                  data-testid="cancel-reminder-button"
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-full font-medium hover:bg-slate-200 transition-all btn-scale"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="space-y-6">
          {activeReminders.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-manrope font-semibold text-lg text-slate-800 mb-4">
                Upcoming
              </h3>
              <div className="space-y-3">
                {activeReminders.map((reminder) => {
                  const pet = pets.find((p) => p.pet_id === reminder.pet_id);
                  return (
                    <div
                      key={reminder.reminder_id}
                      className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm card-hover flex items-start gap-4"
                    >
                      <button
                        data-testid={`complete-reminder-${reminder.reminder_id}`}
                        onClick={() => toggleComplete(reminder.reminder_id, reminder.is_completed)}
                        className="mt-1 w-6 h-6 rounded-full border-2 border-slate-300 hover:border-brand-primary transition-colors flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">{reminder.title}</h4>
                        {pet && (
                          <p className="text-xs text-brand-primary mt-1">{pet.name}</p>
                        )}
                        {reminder.description && (
                          <p className="text-sm text-slate-600 mt-1">{reminder.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-xs text-slate-500">
                            {format(new Date(reminder.scheduled_for), 'MMM dd, yyyy')}
                          </span>
                          <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">
                            {reminder.reminder_type}
                          </span>
                        </div>
                      </div>
                      <button
                        data-testid={`delete-reminder-${reminder.reminder_id}`}
                        onClick={() => deleteReminder(reminder.reminder_id)}
                        className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 btn-scale"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {completedReminders.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-manrope font-semibold text-lg text-slate-800 mb-4">
                Completed
              </h3>
              <div className="space-y-3">
                {completedReminders.map((reminder) => {
                  const pet = pets.find((p) => p.pet_id === reminder.pet_id);
                  return (
                    <div
                      key={reminder.reminder_id}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-4 opacity-60"
                    >
                      <button
                        onClick={() => toggleComplete(reminder.reminder_id, reminder.is_completed)}
                        className="mt-1 w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0 btn-scale"
                      >
                        <Check size={16} className="text-white" />
                      </button>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800 line-through">{reminder.title}</h4>
                        {pet && (
                          <p className="text-xs text-slate-500 mt-1">{pet.name}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteReminder(reminder.reminder_id)}
                        className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 btn-scale"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {reminders.length === 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm"
            >
              <Calendar className="text-slate-300 mx-auto mb-4" size={64} />
              <h3 className="text-xl font-manrope font-bold text-slate-800 mb-2">
                No reminders yet
              </h3>
              <p className="text-slate-600">Add reminders for vaccinations, checkups, and more</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
