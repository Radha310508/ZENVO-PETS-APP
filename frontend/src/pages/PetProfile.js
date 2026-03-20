import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

export const PetProfile = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const isNew = petId === 'new';

  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    food_info: '',
    vaccination_schedule: '',
    health_notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isNew) {
      loadPetData();
    }
  }, [petId]);

  const loadPetData = async () => {
    try {
      const response = await axios.get(`${API}/pets/${petId}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to load pet data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
      };

      if (isNew) {
        await axios.post(`${API}/pets`, payload, {
          headers: getAuthHeaders(),
          withCredentials: true,
        });
        toast.success('Pet profile created!');
      } else {
        await axios.put(`${API}/pets/${petId}`, payload, {
          headers: getAuthHeaders(),
          withCredentials: true,
        });
        toast.success('Pet profile updated!');
      }

      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save pet profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-zen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          data-testid="back-button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 btn-scale"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm slide-up">
          <h2 className="text-3xl font-manrope font-bold text-slate-800 mb-2">
            {isNew ? 'Create Pet Profile' : 'Edit Pet Profile'}
          </h2>
          <p className="text-slate-600 mb-8">
            {isNew ? 'Tell us about your dog' : 'Update your dog\'s information'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Dog Name *</label>
                <input
                  data-testid="pet-name-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white rounded-xl transition-all outline-none"
                  placeholder="e.g., Max"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Breed *</label>
                <input
                  data-testid="pet-breed-input"
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white rounded-xl transition-all outline-none"
                  placeholder="e.g., Labrador Retriever"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Age (years) *</label>
                <input
                  data-testid="pet-age-input"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white rounded-xl transition-all outline-none"
                  placeholder="e.g., 3"
                  min="0"
                  max="30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Weight (kg) *</label>
                <input
                  data-testid="pet-weight-input"
                  type="number"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white rounded-xl transition-all outline-none"
                  placeholder="e.g., 25.5"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Food Information</label>
              <textarea
                data-testid="pet-food-input"
                name="food_info"
                value={formData.food_info}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white rounded-xl transition-all outline-none"
                placeholder="e.g., Royal Canin Adult, 2 cups daily"
                rows="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Vaccination Schedule</label>
              <textarea
                data-testid="pet-vaccination-input"
                name="vaccination_schedule"
                value={formData.vaccination_schedule}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white rounded-xl transition-all outline-none"
                placeholder="e.g., Rabies due March 2024, Distemper annual"
                rows="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Health Notes</label>
              <textarea
                data-testid="pet-health-notes-input"
                name="health_notes"
                value={formData.health_notes}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white rounded-xl transition-all outline-none"
                placeholder="Any allergies, conditions, or important health information"
                rows="3"
              />
            </div>

            <button
              data-testid="save-pet-button"
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary text-white py-4 rounded-full font-medium hover:bg-[#4a7c8f] transition-all shadow-sm btn-scale disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Saving...' : isNew ? 'Create Profile' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
