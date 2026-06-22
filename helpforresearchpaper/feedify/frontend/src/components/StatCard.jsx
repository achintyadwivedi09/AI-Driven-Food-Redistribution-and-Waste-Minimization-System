import clsx from 'clsx';

const colorMap = {
  green: 'border-emerald-500 text-emerald-400',
  blue: 'border-blue-500 text-blue-400',
  emerald: 'border-emerald-500 text-emerald-400',
  purple: 'border-purple-500 text-purple-400',
  red: 'border-red-500 text-red-400',
  yellow: 'border-yellow-500 text-yellow-400',
};

export default function StatCard({ title, value, unit, icon: Icon, color = 'green', change }) {
  return (
    <div
      className={clsx(
        'relative bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6',
        'hover:scale-105 transition-transform duration-200 cursor-default',
        'border-t-2',
        colorMap[color]?.split(' ')[0] || 'border-emerald-500'
      )}
    >
      {Icon && (
        <div className="absolute top-4 right-4 opacity-40">
          <Icon size={24} />
        </div>
      )}
      <p className="text-sm text-gray-400 mb-1 font-medium">{title}</p>
      <p className="text-3xl font-bold tracking-tight">
        {value}
        {unit && <span className="text-lg text-gray-400 ml-1 font-normal">{unit}</span>}
      </p>
      {change !== undefined && change !== null && (
        <span
          className={clsx(
            'inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold',
            change >= 0
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-red-500/15 text-red-400'
          )}
        >
          {change >= 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
  );
}
