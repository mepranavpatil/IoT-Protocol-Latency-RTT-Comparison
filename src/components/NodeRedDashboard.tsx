import type { ProtocolStats, LatencyResult } from '../types';
import { protocols } from '../data/protocols';

interface Props {
  stats: ProtocolStats[];
  results: LatencyResult[];
  isRunning: boolean;
}

function GaugeWidget({ label, value, max, color, unit = 'ms' }: {
  label: string;
  value: number;
  max: number;
  color: string;
  unit?: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const angle = (percentage / 100) * 180;
  const radians = (angle * Math.PI) / 180;
  const needleX = 50 + 35 * Math.cos(Math.PI - radians);
  const needleY = 55 - 35 * Math.sin(Math.PI - radians);

  return (
    <div className="bg-dark-700/50 rounded-xl p-3 border border-white/5 flex flex-col items-center">
      <div className="text-[10px] font-mono text-slate-400 mb-1">{label}</div>
      <svg viewBox="0 0 100 60" className="w-full max-w-[120px]">
        {/* Background arc */}
        <path
          d="M 10 55 A 40 40 0 0 1 90 55"
          fill="none"
          stroke="#1a1a2e"
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d="M 10 55 A 40 40 0 0 1 90 55"
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${percentage * 1.26} 126`}
          opacity={0.8}
        />
        {/* Tick marks */}
        {[0, 45, 90, 135, 180].map((deg, i) => {
          const r1 = 35;
          const r2 = 40;
          const rad = (deg * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={50 + r1 * Math.cos(Math.PI - rad)}
              y1={55 - r1 * Math.sin(Math.PI - rad)}
              x2={50 + r2 * Math.cos(Math.PI - rad)}
              y2={55 - r2 * Math.sin(Math.PI - rad)}
              stroke="#555"
              strokeWidth={1}
            />
          );
        })}
        {/* Needle */}
        <line
          x1={50}
          y1={55}
          x2={needleX}
          y2={needleY}
          stroke="#fff"
          strokeWidth={1.5}
          strokeLinecap="round"
          style={{ transition: 'all 0.5s ease-out' }}
        />
        <circle cx={50} cy={55} r={3} fill="#fff" />
        {/* Value */}
        <text x={50} y={50} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="bold" fontFamily="monospace">
          {value || '—'}
        </text>
        {/* Min / Max */}
        <text x={12} y={58} fill="#666" fontSize={5} fontFamily="monospace">0</text>
        <text x={82} y={58} fill="#666" fontSize={5} fontFamily="monospace">{max}</text>
      </svg>
      <div className="text-xs font-mono mt-0.5" style={{ color }}>{value ? `${value} ${unit}` : '—'}</div>
    </div>
  );
}

function MiniChart({ samples, color, label }: { samples: number[]; color: string; label: string }) {
  if (samples.length < 2) {
    return (
      <div className="bg-dark-700/50 rounded-xl p-3 border border-white/5 h-24 flex items-center justify-center">
        <span className="text-slate-600 text-[10px] font-mono">No data</span>
      </div>
    );
  }

  const last20 = samples.slice(-20);
  const max = Math.max(...last20) * 1.1;
  const min = Math.min(...last20) * 0.9;
  const range = max - min || 1;
  const w = 200;
  const h = 50;
  const points = last20.map((v, i) => {
    const x = (i / (last20.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <div className="bg-dark-700/50 rounded-xl p-3 border border-white/5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono text-slate-400">{label}</span>
        <span className="text-[10px] font-mono" style={{ color }}>
          {last20[last20.length - 1]}ms
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12">
        <polygon points={areaPoints} fill={color} opacity={0.1} />
        <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} />
        {/* Latest point */}
        {last20.length > 0 && (
          <circle
            cx={(last20.length - 1) / (last20.length - 1) * w}
            cy={h - ((last20[last20.length - 1] - min) / range) * h}
            r={3}
            fill={color}
          >
            <animate attributeName="r" values="3;5;3" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
    </div>
  );
}

function StatusLed({ label, active, color }: { label: string; active: boolean; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-700/30 rounded-lg border border-white/5">
      <span
        className={`w-2.5 h-2.5 rounded-full ${active ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: active ? color : '#333' }}
      />
      <span className="text-[11px] font-mono text-slate-400">{label}</span>
      <span className="text-[10px] font-mono ml-auto" style={{ color: active ? color : '#555' }}>
        {active ? 'ACTIVE' : 'IDLE'}
      </span>
    </div>
  );
}

export default function NodeRedDashboard({ stats, isRunning }: Props) {
  const hasData = stats.some((s) => s.samples.length > 0);

  return (
    <div className="bg-dark-800 border border-white/5 rounded-2xl overflow-hidden">
      {/* Dashboard header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-gradient-to-r from-[#1a1a2e] to-[#0d2137]">
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <span className="font-semibold text-white text-sm">Node-RED Dashboard</span>
          <span className="text-xs text-slate-500 font-mono">ui</span>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="text-[10px] font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              LIVE
            </span>
          )}
          <span className="text-xs text-slate-500 font-mono">localhost:1880/ui</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Gauges */}
        <div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">⏱ Latency Gauges (RTT)</div>
          <div className="grid grid-cols-3 gap-3">
            {protocols.map((p) => {
              const s = stats.find((st) => st.protocol === p.id);
              return (
                <GaugeWidget
                  key={p.id}
                  label={p.name}
                  value={s?.avg || 0}
                  max={p.id === 'amqp' ? 200 : 120}
                  color={p.color}
                />
              );
            })}
          </div>
        </div>

        {/* Live charts */}
        <div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">📈 Live RTT Trend</div>
          <div className="grid grid-cols-3 gap-3">
            {protocols.map((p) => {
              const s = stats.find((st) => st.protocol === p.id);
              return (
                <MiniChart
                  key={p.id}
                  samples={s?.samples || []}
                  color={p.color}
                  label={p.name}
                />
              );
            })}
          </div>
        </div>

        {/* Connection status */}
        <div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">🔌 Broker Connections</div>
          <div className="grid grid-cols-3 gap-3">
            <StatusLed label="Mosquitto :1883" active={isRunning} color="#8B5CF6" />
            <StatusLed label="CoAP Server :5683" active={isRunning} color="#10B981" />
            <StatusLed label="RabbitMQ :5672" active={isRunning} color="#F59E0B" />
          </div>
        </div>

        {/* Summary table */}
        {hasData && (
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">📋 Results Summary</div>
            <div className="overflow-hidden rounded-lg border border-white/5">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="bg-dark-700/50">
                    <th className="text-left px-3 py-2 text-slate-400 font-medium">Protocol</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">Avg</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">Min</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">Max</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">σ</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">Samples</th>
                  </tr>
                </thead>
                <tbody>
                  {protocols.map((p) => {
                    const s = stats.find((st) => st.protocol === p.id);
                    if (!s || s.samples.length === 0) return null;
                    return (
                      <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                        <td className="px-3 py-2 font-semibold" style={{ color: p.color }}>
                          {p.icon} {p.name}
                        </td>
                        <td className="text-right px-3 py-2 text-white font-bold">{s.avg}ms</td>
                        <td className="text-right px-3 py-2 text-slate-400">{s.min}ms</td>
                        <td className="text-right px-3 py-2 text-slate-400">{s.max}ms</td>
                        <td className="text-right px-3 py-2 text-slate-400">{s.stdDev}ms</td>
                        <td className="text-right px-3 py-2 text-slate-400">{s.samples.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
