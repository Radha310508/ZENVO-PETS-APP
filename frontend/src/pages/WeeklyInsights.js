import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, TrendingUp, Sparkles, AlertCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

const SCORE_MAP = {
  appetite: { 'Excellent': 5, 'Good': 4, 'Normal': 3, 'Low': 2, 'Very Low': 1 },
  energy: { 'Very High': 5, 'High': 4, 'Normal': 3, 'Low': 2, 'Very Low': 1 },
};

export const WeeklyInsights = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [logs, setLogs] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [petId]);

  const loadData = async () => {
    try {
      const [petRes, summariesRes, logsRes] = await Promise.all([
        axios.get(`${API}/pets/${petId}`, {
          headers: getAuthHeaders(),
          withCredentials: true,
        }),
        axios.get(`${API}/summaries?pet_id=${petId}`, {
          headers: getAuthHeaders(),
          withCredentials: true,
        }),
        axios.get(`${API}/logs?pet_id=${petId}`, {
          headers: getAuthHeaders(),
          withCredentials: true,
        }),
      ]);

      setPet(petRes.data);
      setSummaries(summariesRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(
        `${API}/summaries/generate?pet_id=${petId}`,
        {},
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );
      toast.success('Weekly summary generated!');
      setSummaries([response.data, ...summaries]);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  };

  const getChartData = () => {
    return logs.slice(0, 14).reverse().map(log => ({
      date: format(new Date(log.date), 'MMM dd'),
      appetite: SCORE_MAP.appetite[log.appetite] || 3,
      energy: SCORE_MAP.energy[log.energy] || 3,
    }));
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
      <div className="max-w-5xl mx-auto px-4 py-8">
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
          className="mb-8"
        >
          <h2 className="text-3xl font-manrope font-bold text-slate-800 mb-2">
            Weekly Insights for {pet?.name}
          </h2>
          <p className="text-slate-600">AI-assisted patterns and observations</p>
        </motion.div>

        {logs.length >= 3 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-manrope font-semibold text-lg text-slate-800">Trends (Last 14 Days)</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} domain={[0, 5]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="appetite"
                  stroke="#568EA3"
                  strokeWidth={2}
                  dot={{ fill: '#568EA3' }}
                  name="Appetite"
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#FDBA74"
                  strokeWidth={2}
                  dot={{ fill: '#FDBA74' }}
                  name="Energy"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {logs.length < 3 ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm"
          >
            <TrendingUp className="text-slate-300 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-manrope font-bold text-slate-800 mb-2">
              Keep logging to see insights
            </h3>
            <p className="text-slate-600 mb-6">
              You need at least 3 days of logs to generate weekly insights
            </p>
            <button
              data-testid="log-now-button"
              onClick={() => navigate(`/log/${petId}`)}
              className="bg-brand-primary text-white px-6 py-3 rounded-full font-medium hover:bg-[#4a7c8f] transition-all shadow-sm btn-scale"
            >
              Log Today
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <button
                data-testid="generate-summary-button"
                onClick={generateSummary}
                disabled={generating}
                className="bg-brand-primary text-white px-6 py-3 rounded-full font-medium hover:bg-[#4a7c8f] transition-all shadow-sm btn-scale disabled:opacity-50 flex items-center gap-2"
              >
                <Sparkles size={20} />
                {generating ? 'Generating...' : 'Generate New Summary'}
              </button>
            </motion.div>

            <div className="space-y-6">
              {summaries.map((summary, idx) => (
                <motion.div
                  key={summary.summary_id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-manrope font-semibold text-lg text-slate-800">
                        Week of {format(new Date(summary.week_start), 'MMM dd')}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {format(new Date(summary.week_start), 'MMM dd')} - {format(new Date(summary.week_end), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <Sparkles className="text-brand-primary" size={24} />
                  </div>

                  <div className="prose max-w-none">
                    <p className="text-slate-700 leading-relaxed mb-4">
                      {summary.summary_text}
                    </p>
                  </div>

                  {summary.key_patterns && summary.key_patterns.length > 0 && (
                    <div className="mt-4 p-4 bg-brand-tertiary rounded-xl">
                      <h4 className="font-medium text-brand-primary mb-2 flex items-center gap-2">
                        <TrendingUp size={16} />
                        Key Patterns
                      </h4>
                      <ul className="space-y-1">
                        {summary.key_patterns.map((pattern, i) => (
                          <li key={i} className="text-sm text-slate-700">• {pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summary.concerns && summary.concerns.length > 0 && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Areas to Monitor
                      </h4>
                      <ul className="space-y-1">
                        {summary.concerns.map((concern, i) => (
                          <li key={i} className="text-sm text-amber-700">• {concern}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
