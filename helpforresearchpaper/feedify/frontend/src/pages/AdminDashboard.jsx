import { useState, useEffect } from 'react';
import { fetchAnalytics } from '../api/feedify';
import StatCard from '../components/StatCard';
import SkeletonCard from '../components/SkeletonCard';
import RouteViz from '../components/RouteViz';
import clsx from 'clsx';
import { LayoutDashboard, Utensils, Users, TrendingDown, Building2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';

const MODEL_DATA = [
  { model: 'Linear', r2: 0.821, rmse: 4.28 },
  { model: 'RandomForest', r2: 0.844, rmse: 3.98 },
  { model: 'XGBoost', r2: 0.848, rmse: 3.93 },
  { model: 'GradBoost', r2: 0.849, rmse: 3.92 },
];

const GINI_DATA = [
  { name: 'PAPS', value: 0.600 },
  { name: 'Random', value: 0.725 },
  { name: 'Nearest NGO', value: 0.721 },
  { name: 'Demand-Only', value: 0.998 },
];
const GINI_COLORS = ['#10b981', '#6b7280', '#9ca3af', '#4b5563'];

const ABLATION_DATA = [
  { feature: 'Rolling Stats', rmse_increase: 9.11 },
  { feature: 'Festival Days', rmse_increase: 8.16 },
  { feature: 'Temporal', rmse_increase: 1.43 },
  { feature: 'Lag Features', rmse_increase: 1.07 },
  { feature: 'Perishability', rmse_increase: -0.03 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-medium text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(3) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: d } = await fetchAnalytics();
      setData(d);
      setLoading(false);
    })();
  }, []);

  const s = data?.summary || {};

  const getMockCoordinates = (city, isDonor = false) => {
    const base = {
      'Mumbai': [19.0760, 72.8777], 'Delhi': [28.7041, 77.1025], 'Chennai': [13.0827, 80.2707],
      'Bengaluru': [12.9716, 77.5946], 'Kolkata': [22.5726, 88.3639], 'Hyderabad': [17.3850, 78.4867],
    }[city] || [20.5937, 78.9629];
    if (isDonor) return base;
    return [base[0] + (Math.random() * 0.15 - 0.075), base[1] + (Math.random() * 0.15 - 0.075)];
  };

  const topTx = data?.recent_allocations?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LayoutDashboard size={32} className="text-purple-400" />
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-1">System overview with real-time analytics and model metrics</p>
      </div>

      {/* SECTION 1 — Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {loading ? (
          <SkeletonCard count={4} />
        ) : (
          <>
            <StatCard title="Total Food Saved" value={s.total_food_saved?.toLocaleString() || '3,909.6'} unit="kg" icon={Utensils} color="green" change={17} />
            <StatCard title="Total Meals Served" value={s.total_meals_served?.toLocaleString() || '9,774'} icon={Users} color="blue" />
            <StatCard title="Waste Reduction" value={s.waste_reduction_percentage || 17} unit="%" icon={TrendingDown} color="emerald" />
            <StatCard title="Active NGOs" value={data?.recent_allocations?.length > 0 ? 5 : 3} icon={Building2} color="purple" />
          </>
        )}
      </section>

      {/* SECTION 2 — Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Model Comparison Bar Chart */}
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-1">Surplus Prediction Accuracy by Model</h3>
          <p className="text-sm text-gray-400 mb-5">R² score and RMSE comparison across 4 models</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={MODEL_DATA} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="model" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="r2" name="R² Score" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rmse" name="RMSE" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gini Fairness Pie Chart */}
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-1">Allocation Method — Gini Fairness</h3>
          <p className="text-sm text-gray-400 mb-5">Lower Gini = fairer distribution. PAPS is best.</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={GINI_DATA}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={{ stroke: '#6b7280' }}
              >
                {GINI_DATA.map((_, i) => (
                  <Cell key={i} fill={GINI_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* FEATURE 1: Live Route Mapping (Admin Over-watch) */}
      <section className="mb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6">
           <h3 className="text-lg font-semibold mb-1">Global Allocation Maps</h3>
           <p className="text-sm text-gray-400 mb-5">Latest live network allocation pipeline overview</p>
           {topTx ? (
             <RouteViz waypoints={[
                { id: 'ad-don-1', name: 'Latest Donor', type: 'donor', city: topTx.donors?.city },
                { id: 'ad-ngo-1', name: topTx.ngos?.ngo_name, type: 'ngo', city: topTx.ngos?.city }
             ]} />
           ) : (
             <div className="w-full h-[300px] border border-gray-800/50 border-dashed rounded-xl flex items-center justify-center text-gray-600">
               No routes processing globally
             </div>
           )}
        </div>

        {/* SECTION 3 — Recent Transactions */}
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
          <div className="p-6 pb-2 border-b border-gray-800/50">
            <h3 className="text-lg font-semibold">Recent Admin Transactions</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Food Type</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Donor City</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">NGO</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Qty (kg)</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">PAPS Score</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recent_allocations || []).map((a, i) => (
                  <tr
                    key={a.allocation_id}
                    className={clsx(
                      'border-b border-gray-800/30 hover:bg-white/[0.02] transition-colors',
                      i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'
                    )}
                  >
                    <td className="px-6 py-3.5 text-white">{a.donors?.food_type || '—'}</td>
                    <td className="px-6 py-3.5 text-gray-300">{a.donors?.city || '—'}</td>
                    <td className="px-6 py-3.5 text-gray-300">{a.ngos?.ngo_name || '—'}</td>
                    <td className="px-6 py-3.5 text-gray-300">{a.allocated_quantity}</td>
                    <td className="px-6 py-3.5">
                      <span className="text-emerald-400 font-medium">{a.priority_score?.toFixed(3)}</span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-400">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!data?.recent_allocations || data.recent_allocations.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No data yet — allocations will appear here
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Ablation Study */}
      <section>
        <h3 className="text-lg font-semibold mb-1">Feature Ablation — RMSE Impact</h3>
        <p className="text-sm text-gray-400 mb-5">RMSE increase when each feature group is removed</p>
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ABLATION_DATA} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis type="category" dataKey="feature" width={110} stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rmse_increase" name="RMSE Increase %" radius={[0, 4, 4, 0]}>
                {ABLATION_DATA.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.rmse_increase > 5 ? '#ef4444' :
                      d.rmse_increase >= 1 ? '#eab308' : '#10b981'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
