import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Share2, Download, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

export const CareSummary = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [logs, setLogs] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [petId]);

  const loadData = async () => {
    try {
      const [petRes, logsRes, summariesRes] = await Promise.all([
        axios.get(`${API}/pets/${petId}`, {
          headers: getAuthHeaders(),
          withCredentials: true,
        }),
        axios.get(`${API}/logs?pet_id=${petId}`, {
          headers: getAuthHeaders(),
          withCredentials: true,
        }),
        axios.get(`${API}/summaries?pet_id=${petId}`, {
          headers: getAuthHeaders(),
          withCredentials: true,
        }),
      ]);

      setPet(petRes.data);
      setLogs(logsRes.data.slice(0, 30));
      setSummaries(summariesRes.data.slice(0, 4));
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const text = `Care Summary for ${pet.name}\n\nGenerated on ${format(new Date(), 'MMM dd, yyyy')}\n\nView full summary at: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Care Summary for ${pet.name}`,
        text: text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Summary link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const recentLogs = logs.slice(0, 7);
  const triggers = [...new Set(logs.filter(l => l.triggers).map(l => l.triggers))];
  const unusualBehaviors = [...new Set(logs.filter(l => l.unusual_behavior).map(l => l.unusual_behavior))];

  return (
    <div className="min-h-screen bg-zen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="no-print mb-6 flex justify-between items-center">
          <button
            data-testid="back-button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 btn-scale"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex gap-3">
            <button
              data-testid="share-button"
              onClick={handleShare}
              className="bg-white text-brand-primary px-4 py-2 rounded-full font-medium border border-brand-primary hover:bg-brand-tertiary transition-all btn-scale flex items-center gap-2"
            >
              <Share2 size={18} />
              Share
            </button>
            <button
              data-testid="print-button"
              onClick={handlePrint}
              className="bg-brand-primary text-white px-4 py-2 rounded-full font-medium hover:bg-[#4a7c8f] transition-all btn-scale flex items-center gap-2"
            >
              <Download size={18} />
              Print/Export
            </button>
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm"
        >
          <div className="text-center mb-8 pb-6 border-b border-slate-100">
            <h1 className="text-4xl font-manrope font-bold text-slate-800 mb-2">
              Care Summary
            </h1>
            <p className="text-slate-600">
              Comprehensive health and behavior report for {pet.name}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Generated on {format(new Date(), 'MMMM dd, yyyy')}
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-brand-tertiary rounded-2xl p-6">
              <h2 className="text-2xl font-manrope font-bold text-slate-800 mb-4">
                Pet Profile
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Name</p>
                  <p className="font-medium text-slate-800">{pet.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Breed</p>
                  <p className="font-medium text-slate-800">{pet.breed}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Age</p>
                  <p className="font-medium text-slate-800">{pet.age} years</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Weight</p>
                  <p className="font-medium text-slate-800">{pet.weight} kg</p>
                </div>
              </div>
              {pet.food_info && (
                <div className="mt-4">
                  <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Food</p>
                  <p className="font-medium text-slate-800">{pet.food_info}</p>
                </div>
              )}
              {pet.vaccination_schedule && (
                <div className="mt-4">
                  <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Vaccination Schedule</p>
                  <p className="font-medium text-slate-800">{pet.vaccination_schedule}</p>
                </div>
              )}
              {pet.health_notes && (
                <div className="mt-4">
                  <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Health Notes</p>
                  <p className="font-medium text-slate-800">{pet.health_notes}</p>
                </div>
              )}
            </div>

            {summaries.length > 0 && (
              <div>
                <h2 className="text-2xl font-manrope font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={24} className="text-brand-primary" />
                  Recent AI Insights
                </h2>
                <div className="space-y-4">
                  {summaries.map((summary) => (
                    <div
                      key={summary.summary_id}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-manrope font-semibold text-slate-800">
                          Week of {format(new Date(summary.week_start), 'MMM dd, yyyy')}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {summary.summary_text}
                      </p>
                      {summary.key_patterns && summary.key_patterns.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-xs font-medium text-slate-600 mb-1">Key Patterns:</p>
                          <ul className="space-y-1">
                            {summary.key_patterns.map((pattern, i) => (
                              <li key={i} className="text-xs text-slate-600">• {pattern}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recentLogs.length > 0 && (
              <div>
                <h2 className="text-2xl font-manrope font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Calendar size={24} className="text-brand-primary" />
                  Recent Behavior Logs (Last 7 Days)
                </h2>
                <div className="space-y-3">
                  {recentLogs.map((log) => (
                    <div
                      key={log.log_id}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-slate-800">
                          {format(new Date(log.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500">Appetite</p>
                          <p className="font-medium text-slate-800">{log.appetite}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Energy</p>
                          <p className="font-medium text-slate-800">{log.energy}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Mood</p>
                          <p className="font-medium text-slate-800">{log.mood}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Sleep</p>
                          <p className="font-medium text-slate-800">{log.sleep}</p>
                        </div>
                      </div>
                      {(log.unusual_behavior || log.triggers) && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          {log.unusual_behavior && (
                            <p className="text-xs text-slate-600 mb-1">
                              <span className="font-medium">Unusual:</span> {log.unusual_behavior}
                            </p>
                          )}
                          {log.triggers && (
                            <p className="text-xs text-slate-600">
                              <span className="font-medium">Triggers:</span> {log.triggers}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(triggers.length > 0 || unusualBehaviors.length > 0) && (
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                <h2 className="text-2xl font-manrope font-bold text-slate-800 mb-4">
                  Notable Observations
                </h2>
                {triggers.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-amber-800 mb-2">Recurring Triggers:</p>
                    <ul className="space-y-1">
                      {triggers.slice(0, 5).map((trigger, i) => (
                        <li key={i} className="text-sm text-amber-700">• {trigger}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {unusualBehaviors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-amber-800 mb-2">Unusual Behaviors:</p>
                    <ul className="space-y-1">
                      {unusualBehaviors.slice(0, 5).map((behavior, i) => (
                        <li key={i} className="text-sm text-amber-700">• {behavior}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="text-center pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                This report is for informational purposes only and does not replace professional veterinary advice.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Generated by ZENVO PETS • {window.location.origin}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};
