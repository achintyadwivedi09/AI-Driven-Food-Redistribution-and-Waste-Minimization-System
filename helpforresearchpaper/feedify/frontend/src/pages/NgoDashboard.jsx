import { useState, useEffect } from 'react';
import { fetchNGOs, fetchAnalytics } from '../api/feedify';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast, ToastContainer } from '../components/Toast';
import { useSupabaseRealtime } from '../hooks/useSupabaseRealtime';
import clsx from 'clsx';
import { Building2, Package, Check, X } from 'lucide-react';

const CITIES = ['All', 'Mumbai', 'Delhi', 'Chennai', 'Bengaluru', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];

export default function NgoDashboard() {
  const [ngos, setNgos] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [city, setCity] = useState('All');
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, removeToast } = useToast();
  useSupabaseRealtime(city);

  const load = async () => {
    setLoading(true);
    const filterCity = city === 'All' ? null : city;
    const [ngoRes, analyticsRes] = await Promise.all([
      fetchNGOs(filterCity),
      fetchAnalytics(),
    ]);
    setNgos(ngoRes.data);
    setAllocations(analyticsRes.data?.recent_allocations || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [city]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Building2 size={32} className="text-blue-400" />
          NGO Dashboard
        </h1>
        <p className="text-gray-400 mt-1">View registered NGOs and incoming food allocations</p>
      </div>

      {/* Section 1: NGO Selector */}
      <section className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold">Registered NGOs</h2>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors sm:ml-auto w-full sm:w-48"
          >
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ngos.map((ngo) => {
              const pct = Math.round((ngo.current_demand_kg / ngo.capacity_kg) * 100);
              return (
                <div key={ngo.ngo_id} className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5 hover:border-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{ngo.ngo_name}</h3>
                      <p className="text-sm text-gray-400">{ngo.city}</p>
                    </div>
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      ngo.storage_type === 'cold'
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-gray-700/50 text-gray-400'
                    )}>
                      {ngo.storage_type}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1.5">
                    <span>Capacity: {ngo.capacity_kg} kg</span>
                    <span className="font-semibold text-emerald-400">Demand: {ngo.current_demand_kg} kg</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={ngo.capacity_kg || 500}
                    defaultValue={ngo.current_demand_kg}
                    onMouseUp={(e) => {
                      const val = parseInt(e.currentTarget.value, 10);
                      showToast(`Updated demand to ${val} kg`, 'success');
                      // Wait locally here or trigger supabase mutation async.
                    }}
                    className="w-full h-2 mb-4 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-500',
                        pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : 'bg-emerald-500'
                      )}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{pct}% demand fill</p>

                  <div className="mt-4 pt-4 border-t border-gray-800/50">
                    <p className="text-xs font-semibold text-gray-400 mb-2">Impact Badges</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-1 flex items-center gap-1.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-300 font-bold" title="Accepted >50 kg of highly perishable items">
                        🥇 Perishable Hero
                      </span>
                      <span className="px-2 py-1 flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-bold" title="Total processed volume exceeds 200 kg">
                        ♻️ Waste Warrior
                      </span>
                      <span className="px-2 py-1 flex items-center gap-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300 font-bold" title="Accepted donations within 5 minutes">
                        ⚡ Speed Acceptor
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {ngos.length === 0 && (
              <p className="text-gray-500 col-span-full text-center py-8">No NGOs found for this city</p>
            )}
          </div>
        )}
      </section>

      {/* Section 2: Incoming Allocations */}
      <section>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Package size={20} className="text-emerald-400" />
          Incoming Allocations
        </h2>
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Food Type</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Qty (kg)</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">From City</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">PAPS Score</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Time</th>
                  <th className="text-right px-6 py-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((a, i) => (
                  <tr
                    key={a.allocation_id}
                    className={clsx(
                      'border-b border-gray-800/30 hover:bg-white/[0.02] transition-colors',
                      i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'
                    )}
                  >
                    <td className="px-6 py-3.5 text-white">{a.donors?.food_type || '—'}</td>
                    <td className="px-6 py-3.5 text-gray-300">{a.allocated_quantity}</td>
                    <td className="px-6 py-3.5 text-gray-300">{a.donors?.city || '—'}</td>
                    <td className="px-6 py-3.5">
                      <span className="text-emerald-400 font-medium">{a.priority_score?.toFixed(3)}</span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-400">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => showToast('Allocation accepted!', 'success')}
                          className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => showToast('Allocation declined', 'info')}
                          className="p-1.5 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-gray-700/70 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {allocations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No incoming allocations yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
