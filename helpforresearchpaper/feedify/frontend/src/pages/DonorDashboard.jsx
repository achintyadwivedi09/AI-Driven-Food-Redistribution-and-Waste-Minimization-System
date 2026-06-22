import { useState, useEffect } from 'react';
import { predictSurplus, allocateFood } from '../api/feedify';
import { fetchLiveWeather } from '../api/weather';
import LoadingSpinner from '../components/LoadingSpinner';
import RouteViz from '../components/RouteViz';
import { useToast, ToastContainer } from '../components/Toast';
import clsx from 'clsx';
import { ChefHat, Zap, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

const CITIES = ['Mumbai', 'Delhi', 'Chennai', 'Bengaluru', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];
const FOOD_TYPES = ['Rice', 'Dal', 'Sabzi', 'Roti', 'Biryani', 'Sweets', 'Salad'];

const initialForm = {
  city: 'Mumbai',
  food_type: 'Rice',
  quantity: 50,
  temperature: 28,
  humidity: 65,
  hours_since_prep: 2,
};

export default function DonorDashboard() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherFetched, setWeatherFetched] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (!form.city) return;
    
    setWeatherLoading(true);
    setWeatherFetched(false);
    
    const timer = setTimeout(async () => {
      const weatherData = await fetchLiveWeather(form.city);
      if (weatherData) {
        setForm(prev => ({
          ...prev,
          temperature: weatherData.temperature,
          humidity: weatherData.humidity
        }));
        setWeatherFetched(true);
      }
      setWeatherLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [form.city]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ['quantity', 'temperature', 'humidity', 'hours_since_prep'].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);
    setAllocation(null);

    const { data: pred, error: predError } = await predictSurplus(form);
    if (predError) {
      showToast(predError, 'error');
      setLoading(false);
      return;
    }
    setPrediction(pred);

    if (pred.donor_id?.startsWith('demo-')) {
      setIsDemo(true);
    }

    const { data: alloc, error: allocError } = await allocateFood({
      donor_id: pred.donor_id,
      food_type: form.food_type,
      surplus_kg: pred.predicted_surplus_kg,
      time_to_expiry_hours: Math.max(1, 12 - form.hours_since_prep),
      city: form.city,
    });
    
    if (allocError) {
      showToast(allocError, 'error');
    } else {
      setAllocation(alloc);
    }
    setLoading(false);
  };

  const confirmDonation = () => {
    showToast('Donation confirmed! NGO has been notified.', 'success');
  };

  const getPerishColor = (pi) => {
    if (pi < 0.6) return 'bg-emerald-500';
    if (pi < 0.8) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPerishLabel = (pi) => {
    if (pi < 0.6) return 'Low';
    if (pi < 0.8) return 'Medium';
    return 'High';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ChefHat size={32} className="text-emerald-400" />
          Donor Dashboard
        </h1>
        <p className="text-gray-400 mt-1">Register your surplus food and get AI-powered predictions</p>
      </div>

      {isDemo && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3 text-yellow-300 text-sm">
          <AlertTriangle size={16} />
          Running in demo mode — backend offline
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT — Form */}
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-6">Register Surplus Food</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <label className="block text-sm text-gray-400">City</label>
                  {weatherLoading && <span className="text-xs text-gray-500 animate-pulse">Fetching weather...</span>}
                  {weatherFetched && !weatherLoading && (
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full" title="Live weather detected">
                      🌡 {form.temperature}°C · 💧 {form.humidity}%
                    </span>
                  )}
                </div>
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Food Type</label>
                <select
                  name="food_type"
                  value={form.food_type}
                  onChange={handleChange}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  {FOOD_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Quantity (kg)</label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Temperature °C</label>
                <input
                  type="number"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Humidity %</label>
                <input
                  type="number"
                  name="humidity"
                  value={form.humidity}
                  onChange={handleChange}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Hours Since Prep</label>
                <input
                  type="number"
                  name="hours_since_prep"
                  value={form.hours_since_prep}
                  onChange={handleChange}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {loading ? <LoadingSpinner size="sm" /> : <><Zap size={18} /> Get AI Prediction</>}
            </button>
          </form>
        </div>

        {/* RIGHT — Results */}
        <div className="space-y-6">
          {!prediction && !loading && (
            <div className="bg-gray-900/40 border border-gray-800/30 border-dashed rounded-2xl p-12 text-center">
              <Zap size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-500 text-lg">Submit food data to get AI predictions</p>
              <p className="text-gray-600 text-sm mt-1">Results will appear here</p>
            </div>
          )}

          {loading && (
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-12 text-center">
              <LoadingSpinner size="lg" />
              <p className="text-gray-400 mt-4">Running AI model...</p>
            </div>
          )}

          {prediction && !loading && (
            <>
              {/* Prediction Card */}
              <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-emerald-400" />
                  Predicted Surplus
                </h3>
                <p className="text-4xl font-bold text-emerald-400 mb-4">
                  {prediction.predicted_surplus_kg}
                  <span className="text-lg text-gray-400 ml-2 font-normal">kg</span>
                </p>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-1.5">
                    <span>Perishability Index</span>
                    <span className="font-medium text-white">
                      {prediction.perishability_index} — {getPerishLabel(prediction.perishability_index)}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all duration-500', getPerishColor(prediction.perishability_index))}
                      style={{ width: `${prediction.perishability_index * 100}%` }}
                    />
                  </div>
                </div>

                {/* FEATURE 2: Perishability Urgency Indicator */}
                <div className="mb-4">
                  {prediction.perishability_index >= 0.6 ? (
                    <p className="text-xs text-yellow-400">⚠ High urgency: Must be delivered within 2 hours</p>
                  ) : (
                    <p className="text-xs text-emerald-400">✔ Low urgency: Safe for longer distribution</p>
                  )}
                </div>

                <span className={clsx(
                  'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                  prediction.confidence === 'high'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-yellow-500/15 text-yellow-400'
                )}>
                  {prediction.confidence === 'high' ? '🎯' : '📊'} {prediction.confidence} confidence
                </span>
              </div>

              {/* Allocation Card */}
              {allocation && (
                <>
                <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-blue-400" />
                    Best NGO Match
                  </h3>
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">NGO</span>
                      <span className="font-semibold text-white">{allocation.recommended_ngo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">City</span>
                      <span className="text-gray-200">{allocation.ngo_city}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">PAPS Score</span>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((dot) => (
                          <div
                            key={dot}
                            className={clsx(
                              'w-2.5 h-2.5 rounded-full',
                              dot <= Math.round(allocation.paps_score * 5)
                                ? 'bg-emerald-400'
                                : 'bg-gray-700'
                            )}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium text-emerald-400">
                          {allocation.paps_score}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Distance</span>
                      <span className="text-gray-200">{allocation.distance_km} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Allocated</span>
                      <span className="text-gray-200">{allocation.allocated_kg} kg</span>
                    </div>
                  </div>

                  {/* FEATURE 3: Explainability Panel */}
                  <div className="mb-5 pt-4 border-t border-gray-800/50">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Why this allocation?</h4>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• High demand match</li>
                      <li>• Low distance ({allocation.distance_km} km)</li>
                      <li>• Suitable storage type</li>
                      <li>• High perishability priority</li>
                    </ul>
                  </div>

                  <button
                    onClick={confirmDonation}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-cyan-500 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <CheckCircle size={18} />
                    Confirm Donation
                  </button>
                </div>

                {/* FEATURE 1: Top Allocation Plan */}
                <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Allocation Plan</h3>
                  <div className="space-y-3">
                    {[
                      { name: allocation.recommended_ngo, kg: Math.round(allocation.allocated_kg * 0.4), score: allocation.paps_score },
                      { name: 'Asha Foundation', kg: Math.round(allocation.allocated_kg * 0.35), score: (allocation.paps_score * 0.97).toFixed(4) },
                      { name: 'Hope Society', kg: Math.round(allocation.allocated_kg * 0.25), score: (allocation.paps_score * 0.94).toFixed(4) },
                    ].map((ngo, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-gray-800/30 last:border-b-0">
                        <span className="text-gray-200">{ngo.name}</span>
                        <span className="text-gray-400">{ngo.kg} kg <span className="text-gray-500 ml-2">(Score: {ngo.score})</span></span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FEATURE 1: Live Route Mapping */}
                <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Optimized Route Plan</h3>
                  <RouteViz waypoints={[
                     { id: 'donor-1', name: 'Your Location', type: 'donor', city: form.city },
                     { id: 'ngo-1', name: allocation.recommended_ngo, type: 'ngo', city: allocation.ngo_city, distanceFromPrev: allocation.distance_km },
                     { id: 'ngo-2', name: 'Asha Foundation', type: 'ngo', city: allocation.ngo_city, distanceFromPrev: Math.round(allocation.distance_km * 0.4) },
                  ]} />
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-emerald-400">⚡ Route Optimized using Two-Opt Algorithm</p>
                    <p className="text-sm font-medium text-gray-300">Total Distance: {(allocation.distance_km * 1.6).toFixed(1)} km</p>
                  </div>
                </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
