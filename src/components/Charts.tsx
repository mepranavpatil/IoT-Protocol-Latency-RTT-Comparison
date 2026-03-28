import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
  ReferenceLine, Cell,
} from 'recharts';
import { protocols } from '../data/protocols';
import type { LatencyResult, ProtocolStats } from '../types';

interface Props {
  stats: ProtocolStats[];
  results: LatencyResult[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{entry.value}ms</span>
        </p>
      ))}
    </div>
  );
};

function ChartPanel({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="bg-dark-800 border border-white/5 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-widest">{title}</span>
        <span className="text-[10px] font-mono text-slate-600">— {sub}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function Charts({ stats, results }: Props) {
  const hasData = stats.some((s) => s.samples.length > 0);

  if (!hasData) {
    return (
      <div className="bg-dark-800 border border-white/5 rounded-2xl p-10 text-center">
        <p className="text-slate-600 text-sm font-mono">[ Run simulation to generate charts ]</p>
      </div>
    );
  }

  // ── Bar chart data: avg/min/max per protocol
  const barData = protocols.map((p) => {
    const s = stats.find((st) => st.protocol === p.id);
    return {
      name: p.name,
      avg: s?.avg ?? 0,
      min: s?.min ?? 0,
      max: s?.max ?? 0,
      color: p.color,
    };
  });

  // ── Line chart: latency over iterations (sampled)
  const maxIter = Math.max(...results.map((r) => r.iteration), 0);
  const step = maxIter > 80 ? Math.ceil(maxIter / 80) : 1;
  const lineData: Record<string, number | string>[] = [];
  for (let i = 1; i <= maxIter; i++) {
    const point: Record<string, number | string> = { i };
    protocols.forEach((p) => {
      const r = results.find((res) => res.protocol === p.id && res.iteration === i);
      if (r) point[p.name] = r.latency;
    });
    lineData.push(point);
  }
  const sampled = lineData.filter((_, idx) => idx % step === 0);

  // ── Scatter/distribution: latency frequency buckets
  const buckets = 12;
  const allLatencies = results.map((r) => r.latency);
  const minL = Math.min(...allLatencies, 0);
  const maxL = Math.max(...allLatencies, 120);
  const bucketSize = Math.ceil((maxL - minL) / buckets);
  const distData = Array.from({ length: buckets }, (_, i) => {
    const lo = minL + i * bucketSize;
    const hi = lo + bucketSize;
    const point: Record<string, number | string> = { range: `${lo}` };
    protocols.forEach((p) => {
      point[p.name] = results.filter(
        (r) => r.protocol === p.id && r.latency >= lo && r.latency < hi
      ).length;
    });
    return point;
  });

  // Averages for reference lines
  const avgs = Object.fromEntries(
    protocols.map((p) => [p.name, stats.find((s) => s.protocol === p.id)?.avg ?? 0])
  );

  return (
    <div className="space-y-4">
      {/* Row 1: Bar + Line side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Bar chart */}
        <ChartPanel title="RTT Comparison" sub="avg / min / max per protocol">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                unit="ms"
                width={42}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="min" name="min" radius={[3, 3, 0, 0]} opacity={0.4}>
                {barData.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Bar>
              <Bar dataKey="avg" name="avg" radius={[3, 3, 0, 0]}>
                {barData.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Bar>
              <Bar dataKey="max" name="max" radius={[3, 3, 0, 0]} opacity={0.3}>
                {barData.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Mini legend */}
          <div className="flex justify-center gap-4 mt-2">
            {[{k:'min',o:'opacity-40'},{k:'avg',o:'opacity-100'},{k:'max',o:'opacity-30'}].map(({k,o}) => (
              <span key={k} className={`text-[10px] font-mono text-slate-400 ${o}`}>■ {k}</span>
            ))}
          </div>
        </ChartPanel>

        {/* Line chart */}
        <ChartPanel title="Latency Over Time" sub="RTT per iteration">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={sampled}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis
                dataKey="i"
                tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'iteration', position: 'insideBottomRight', fill: '#475569', fontSize: 9, dy: 6 }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                unit="ms"
                width={42}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', paddingTop: 4, color: '#94a3b8' }}
                iconType="plainline"
                iconSize={16}
              />
              {protocols.map((p) => (
                <Line
                  key={p.id}
                  type="monotone"
                  dataKey={p.name}
                  stroke={p.color}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              ))}
              {protocols.map((p) =>
                avgs[p.name] > 0 ? (
                  <ReferenceLine
                    key={`ref-${p.id}`}
                    y={avgs[p.name]}
                    stroke={p.color}
                    strokeDasharray="4 4"
                    strokeOpacity={0.4}
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      {/* Row 2: Distribution histogram full width */}
      <ChartPanel title="Latency Distribution" sub="frequency count per ms bucket — all protocols">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={distData} barCategoryGap="5%">
            <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis
              dataKey="range"
              tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'latency (ms)', position: 'insideBottomRight', fill: '#475569', fontSize: 9, dy: 6 }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'count', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 9 }}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', paddingTop: 2, color: '#94a3b8' }}
              iconType="square"
              iconSize={8}
            />
            {protocols.map((p) => (
              <Bar key={p.id} dataKey={p.name} fill={p.color} opacity={0.75} radius={[2, 2, 0, 0]} stackId="dist" />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[10px] font-mono text-slate-600 mt-2 text-center">
          Stacked count shows how latency values cluster — tighter cluster = more stable protocol
        </p>
      </ChartPanel>

      {/* Stats table */}
      <div className="bg-dark-800 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-widest">Summary Statistics</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5">
                {['Protocol', 'Transport', 'Samples', 'Min (ms)', 'Avg (ms)', 'Max (ms)', 'Std Dev', 'Rank'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-slate-500 font-normal text-[10px] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {protocols.map((p) => {
                const s = stats.find((st) => st.protocol === p.id);
                const sorted = [...stats].filter(x => x.avg > 0).sort((a, b) => a.avg - b.avg);
                const rank = sorted.findIndex(x => x.protocol === p.id);
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-2.5 font-bold" style={{ color: p.color }}>{p.name}</td>
                    <td className="px-4 py-2.5 text-slate-500">{p.transport}</td>
                    <td className="px-4 py-2.5 text-slate-400">{s?.samples.length ?? 0}</td>
                    <td className="px-4 py-2.5 text-emerald-400">{s?.min ?? '—'}</td>
                    <td className="px-4 py-2.5 text-white font-bold">{s?.avg ?? '—'}</td>
                    <td className="px-4 py-2.5 text-red-400">{s?.max ?? '—'}</td>
                    <td className="px-4 py-2.5 text-slate-400">±{s?.stdDev ?? '—'}</td>
                    <td className="px-4 py-2.5">{rank >= 0 ? medals[rank] : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
