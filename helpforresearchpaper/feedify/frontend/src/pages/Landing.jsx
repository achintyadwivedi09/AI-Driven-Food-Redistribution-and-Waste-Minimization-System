import { useNavigate } from 'react-router-dom';
import { Bot, MapPin, Scale, ArrowRight, Sparkles } from 'lucide-react';

const stats = [
  { value: '3,909', label: 'kg Food Saved', color: 'text-emerald-400' },
  { value: '9,774', label: 'Meals Served', color: 'text-blue-400' },
  { value: '17%', label: 'Less Waste', color: 'text-purple-400' },
];

const features = [
  {
    icon: Bot,
    title: 'AI Surplus Prediction',
    desc: 'Gradient Boosting model predicts food surplus with R² = 0.849 accuracy before it becomes waste.',
    color: 'from-emerald-500 to-green-600',
  },
  {
    icon: MapPin,
    title: 'Smart Routing',
    desc: 'Two-Opt optimized routing reduces delivery distances by 15% compared to greedy approaches.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: Scale,
    title: 'Fair Allocation',
    desc: 'PAPS algorithm achieves Gini index of 0.600 — the fairest among all tested methods.',
    color: 'from-purple-500 to-violet-600',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative px-4 pt-20 pb-16 sm:pt-32 sm:pb-24 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
          <Sparkles size={14} />
          AI-Powered Food Redistribution
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
          <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">
            Reduce Food Waste.
          </span>
          <br />
          <span className="text-white">Feed More Lives.</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-powered food redistribution connecting donors with NGOs across India.
          Predict surplus before it spoils. Allocate fairly. Deliver efficiently.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            onClick={() => navigate('/donor')}
            className="group px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
          >
            I&apos;m a Donor
            <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => navigate('/ngo')}
            className="px-8 py-3.5 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
          >
            I&apos;m an NGO
          </button>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-3xl sm:text-4xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative px-4 pb-20 sm:pb-32 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-gray-900/40 border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${f.color} mb-4`}>
                <f.icon size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
