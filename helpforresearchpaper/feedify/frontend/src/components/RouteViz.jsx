// Custom SVG route visualization — zero external deps, works in all browsers.
const CITY_COORDS = {
  'Mumbai':    { x: 16, y: 60 },
  'Delhi':     { x: 37, y: 24 },
  'Chennai':   { x: 52, y: 74 },
  'Bengaluru': { x: 44, y: 70 },
  'Kolkata':   { x: 70, y: 38 },
  'Hyderabad': { x: 46, y: 57 },
  'Pune':      { x: 22, y: 58 },
  'Ahmedabad': { x: 20, y: 40 },
};

const FALLBACK_POSITIONS = [
  { x: 30, y: 35 }, { x: 55, y: 45 }, { x: 40, y: 65 },
  { x: 62, y: 28 }, { x: 25, y: 52 },
];

function getCoord(city, index = 0) {
  if (city && CITY_COORDS[city]) return { ...CITY_COORDS[city] };
  return FALLBACK_POSITIONS[index % FALLBACK_POSITIONS.length];
}

// Spread markers that are too close to each other
function spreadPoints(points) {
  const MIN_DIST = 12;
  const result = points.map(p => ({ ...p }));
  for (let i = 0; i < result.length; i++) {
    for (let j = i + 1; j < result.length; j++) {
      const dx = result[j].x - result[i].x;
      const dy = result[j].y - result[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MIN_DIST) {
        const angle = Math.atan2(dy || 1, dx || 1);
        const push = (MIN_DIST - dist) / 2;
        result[i].x -= Math.cos(angle) * push;
        result[i].y -= Math.sin(angle) * push;
        result[j].x += Math.cos(angle) * push;
        result[j].y += Math.sin(angle) * push;
        // Clamp
        result[i].x = Math.max(8, Math.min(82, result[i].x));
        result[i].y = Math.max(8, Math.min(82, result[i].y));
        result[j].x = Math.max(8, Math.min(82, result[j].x));
        result[j].y = Math.max(8, Math.min(82, result[j].y));
      }
    }
  }
  return result;
}

const INDIA_PATH = "M38,4 L44,7 L54,5 L62,10 L68,16 L72,24 L73,32 L70,42 L65,50 L58,59 L52,68 L49,76 L45,82 L42,78 L36,74 L28,68 L20,62 L14,54 L11,44 L12,34 L15,26 L20,18 L26,11 L33,6 Z";

export default function RouteViz({ waypoints }) {
  if (!waypoints || waypoints.length < 2) {
    return (
      <div className="w-full h-52 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-gray-950 to-slate-900 border border-dashed border-gray-700 text-gray-500 text-sm gap-2">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
        <span>Run prediction &amp; allocate to see route</span>
      </div>
    );
  }

  const raw = waypoints.map((w, i) => ({
    ...w,
    ...getCoord(w.city, i),
  }));

  const points = spreadPoints(raw);
  const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-gray-800/60 shadow-2xl bg-gradient-to-br from-[#050d1a] via-[#0a1628] to-[#070e1c]" style={{ paddingBottom: '58%' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 90 90" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Grid */}
          <pattern id="rvgrid" width="9" height="9" patternUnits="userSpaceOnUse">
            <path d="M9 0L0 0 0 9" fill="none" stroke="#0f2242" strokeWidth="0.4"/>
          </pattern>
          {/* Glows */}
          <radialGradient id="rv-glow-green" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="rv-glow-red" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#f87171" stopOpacity="0"/>
          </radialGradient>
          <filter id="rv-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5"/>
          </filter>
          <filter id="rv-drop" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#3b82f6" floodOpacity="0.8"/>
          </filter>
          {/* Route gradient */}
          <linearGradient id="rv-route-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981"/>
            <stop offset="100%" stopColor="#3b82f6"/>
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="90" height="90" fill="url(#rvgrid)"/>

        {/* India silhouette with glow */}
        <path d={INDIA_PATH} fill="#0e2240" stroke="#1e4080" strokeWidth="0.7" opacity="0.8"/>
        <path d={INDIA_PATH} fill="none" stroke="#3b82f6" strokeWidth="0.3" opacity="0.3"/>

        {/* Route glow */}
        <polyline points={polylineStr} fill="none" stroke="#3b82f6" strokeWidth="4" opacity="0.08" filter="url(#rv-blur)"/>

        {/* Animated dashed route */}
        <polyline points={polylineStr} fill="none" stroke="url(#rv-route-grad)" strokeWidth="1" strokeDasharray="4 2" opacity="0.9">
          <animate attributeName="stroke-dashoffset" from="60" to="0" dur="2.5s" repeatCount="indefinite"/>
        </polyline>

        {/* Mid-point glows */}
        {points.slice(0, -1).map((pt, i) => {
          const next = points[i + 1];
          return (
            <circle
              key={`mg-${i}`}
              cx={(pt.x + next.x) / 2}
              cy={(pt.y + next.y) / 2}
              r="5"
              fill="url(#rv-glow-green)"
              filter="url(#rv-blur)"
              opacity="0.6"
            />
          );
        })}

        {/* Markers */}
        {points.map((p, i) => {
          const isDonor = p.type === 'donor';
          const color = isDonor ? '#10b981' : '#f87171';
          const glowId = isDonor ? 'rv-glow-green' : 'rv-glow-red';
          const labelX = p.x + (p.x > 60 ? -3 : 3);
          const labelAnchor = p.x > 60 ? 'end' : 'start';

          return (
            <g key={p.id || i}>
              {/* Outer glow */}
              <circle cx={p.x} cy={p.y} r="5" fill={`url(#${glowId})`} filter="url(#rv-blur)"/>
              {/* Pulsing ring */}
              <circle cx={p.x} cy={p.y} r="3" fill="none" stroke={color} strokeWidth="0.5" opacity="0.6">
                <animate attributeName="r" values="3;5.5;3" dur="2.2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2.2s" repeatCount="indefinite"/>
              </circle>
              {/* Core dot */}
              <circle cx={p.x} cy={p.y} r="2.2" fill={color} filter="url(#rv-drop)"/>
              <circle cx={p.x} cy={p.y} r="1" fill="white" opacity="0.9"/>

              {/* Name label */}
              <text
                x={labelX}
                y={p.y - 3.5}
                fontSize="2.8"
                fill="white"
                fontFamily="system-ui, sans-serif"
                fontWeight="600"
                textAnchor={labelAnchor}
                opacity="0.95"
              >
                {p.name?.length > 14 ? p.name.slice(0, 13) + '…' : p.name}
              </text>

              {/* Distance badge */}
              {p.distanceFromPrev !== undefined && (
                <text
                  x={labelX}
                  y={p.y + 0.5}
                  fontSize="2.2"
                  fill="#60a5fa"
                  fontFamily="system-ui, sans-serif"
                  textAnchor={labelAnchor}
                  opacity="0.85"
                >
                  +{Number(p.distanceFromPrev).toFixed(0)} km
                </text>
              )}

              {/* City chip */}
              {p.city && (
                <text
                  x={labelX}
                  y={p.y + 3.5}
                  fontSize="2"
                  fill={isDonor ? '#6ee7b7' : '#fca5a5'}
                  fontFamily="system-ui, sans-serif"
                  textAnchor={labelAnchor}
                  opacity="0.7"
                >
                  {p.city}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Overlay legend */}
      <div className="absolute bottom-2.5 left-3 flex gap-4 text-[11px] font-semibold">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"/>
          Donor
        </span>
        <span className="flex items-center gap-1.5 text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-400 shadow-lg shadow-red-400/50"/>
          NGO
        </span>
        <span className="flex items-center gap-1.5 text-blue-400">
          <span className="inline-block w-4 border-t border-dashed border-blue-400"/>
          Two-Opt Route
        </span>
      </div>
    </div>
  );
}
