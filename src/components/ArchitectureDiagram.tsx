import { useState, useEffect, useMemo } from 'react';
import { protocols } from '../data/protocols';
import type { ProtocolStats, LatencyResult } from '../types';

interface Props {
  activeProtocol: string | null;
  isRunning: boolean;
  currentIteration: number;
  totalIterations: number;
  stats: ProtocolStats[];
  results: LatencyResult[];
}

export default function ArchitectureDiagram({
  activeProtocol,
  isRunning,
  currentIteration,
  totalIterations,
  stats,
  results,
}: Props) {
  const [hoveredProtocol, setHoveredProtocol] = useState<string | null>(null);
  const highlighted = activeProtocol || hoveredProtocol;

  // Get the latest latency for each protocol
  const latestLatencies = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of results) {
      map[r.protocol] = r.latency;
    }
    return map;
  }, [results]);

  // Flash key for latency updates
  const [flashKey, setFlashKey] = useState(0);
  useEffect(() => {
    setFlashKey((k) => k + 1);
  }, [currentIteration]);

  // Determine speed class per protocol
  const getSpeedClass = (protocolId: string) => {
    if (protocolId === 'coap') return 'fast';
    if (protocolId === 'mqtt') return 'medium';
    return 'slow';
  };

  const progress = totalIterations > 0 ? (currentIteration / totalIterations) * 100 : 0;

  return (
    <div className="bg-dark-800 border border-white/5 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
      {/* Running overlay glow */}
      {isRunning && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-purple-500/5 blur-3xl signal-wave" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-emerald-500/5 blur-3xl signal-wave-delayed" />
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <h2 className="text-lg font-semibold text-white">📐 Architecture</h2>
        {isRunning && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 status-blink" />
              <span className="text-xs font-mono text-emerald-400">LIVE</span>
            </div>
            <div className="text-xs font-mono text-slate-400 bg-dark-700 px-2.5 py-1 rounded-lg border border-white/5">
              Iteration{' '}
              <span key={flashKey} className="text-white font-bold counter-tick inline-block">
                {currentIteration}
              </span>
              <span className="text-slate-500">/{totalIterations}</span>
            </div>
          </div>
        )}
      </div>
      <p className="text-sm text-slate-400 mb-6 relative z-10">
        Device → Protocol → Server → Response → Device &nbsp;|&nbsp;
        <span className="font-mono text-slate-300">Latency = Response Time − Request Time</span>
      </p>

      {/* Flow diagram */}
      <div className="relative flex items-center justify-between gap-2 py-8 px-2 sm:px-6">
        {/* ── Device Node ── */}
        <div className="flex flex-col items-center gap-2 z-10 min-w-[80px] sm:min-w-[100px]">
          <div className="relative">
            {/* Ping rings when running */}
            {isRunning && (
              <>
                <div
                  className="absolute inset-0 rounded-2xl border-2 border-purple-400/40 ping-ring"
                />
                <div
                  className="absolute inset-0 rounded-2xl border-2 border-purple-400/20 ping-ring"
                  style={{ animationDelay: '0.5s' }}
                />
              </>
            )}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-all duration-500
                ${isRunning
                  ? 'bg-dark-600 border-2 border-purple-500/50 box-pulse'
                  : 'bg-dark-700 border-2 border-slate-600'
                }`}
              style={isRunning ? { '--glow-color': 'rgba(139,92,246,0.35)' } as React.CSSProperties : {}}
            >
              📱
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">IoT Device</span>
          {/* Sending indicator */}
          {isRunning && (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-mono text-purple-400 status-blink">
                SENDING
              </span>
              <span className="text-[9px] font-mono text-slate-500 bg-dark-700 px-1.5 py-0.5 rounded">
                "Hello" →
              </span>
            </div>
          )}
        </div>

        {/* ── Protocol Lanes ── */}
        <div className="flex-1 flex flex-col gap-2.5 mx-2 sm:mx-4">
          {protocols.map((p) => {
            const isActive = highlighted === p.id;
            const speed = getSpeedClass(p.id);
            const stat = stats.find((s) => s.protocol === p.id);
            const latestMs = latestLatencies[p.id];
            const hasData = stat && stat.samples.length > 0;

            return (
              <div
                key={p.id}
                onMouseEnter={() => setHoveredProtocol(p.id)}
                onMouseLeave={() => setHoveredProtocol(null)}
                className={`relative flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-300 cursor-pointer
                  ${isActive
                    ? `${p.bgColor} ${p.borderColor} scale-[1.02]`
                    : 'bg-dark-700/50 border-white/5 opacity-60 hover:opacity-100'
                  }`}
              >
                {/* Protocol icon + name */}
                <span className="text-sm">{p.icon}</span>
                <span className={`text-xs font-mono font-semibold min-w-[40px] ${isActive ? p.textColor : 'text-slate-400'}`}>
                  {p.name}
                </span>
                <span className="hidden sm:inline text-[10px] text-slate-500 ml-0.5">
                  ({p.transport}:{p.port})
                </span>

                {/* ── Animated Lane ── */}
                <div
                  className="flex-1 relative h-2 mx-2 overflow-hidden rounded-full"
                  style={{ backgroundColor: isActive ? `${p.color}15` : '#1a1a2e' }}
                >
                  {/* Background pulse when running */}
                  {isRunning && isActive && (
                    <div
                      className="absolute inset-0 rounded-full opacity-30"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${p.color}40, transparent)`,
                        animation: `slide-right ${speed === 'fast' ? '0.8s' : speed === 'medium' ? '1.2s' : '1.8s'} ease-in-out infinite`,
                      }}
                    />
                  )}

                  {/* Forward packet (Hello →) */}
                  {isActive && (
                    <div
                      className={`absolute top-0 h-full w-3 rounded-full packet-send-${speed}`}
                      style={{ backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}` }}
                    />
                  )}
                  {/* Second forward packet staggered */}
                  {isRunning && isActive && (
                    <div
                      className={`absolute top-0 h-full w-2 rounded-full packet-send-${speed}`}
                      style={{
                        backgroundColor: p.color,
                        opacity: 0.5,
                        animationDelay: speed === 'fast' ? '0.3s' : speed === 'medium' ? '0.5s' : '0.7s',
                      }}
                    />
                  )}

                  {/* Return packet (← ACK) — moves right to left */}
                  {isRunning && isActive && (
                    <div
                      className={`absolute top-0 h-full w-2.5 rounded-full packet-return-${speed}`}
                      style={{
                        backgroundColor: p.color,
                        opacity: 0.7,
                        filter: `brightness(1.5)`,
                      }}
                    />
                  )}
                </div>

                {/* ── Live Stats Badges ── */}
                <div className="flex items-center gap-1.5 min-w-[90px] sm:min-w-[120px] justify-end">
                  {isRunning && isActive ? (
                    <>
                      {/* Live latency reading */}
                      <span
                        key={`${p.id}-${flashKey}`}
                        className="latency-flash inline-block text-xs font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{ color: p.color, backgroundColor: `${p.color}15` }}
                      >
                        {latestMs != null ? `${latestMs}ms` : '...'}
                      </span>
                      {/* Status dot */}
                      <span
                        className="w-1.5 h-1.5 rounded-full status-blink"
                        style={{ backgroundColor: p.color }}
                      />
                    </>
                  ) : hasData ? (
                    <span className="text-[10px] font-mono text-slate-400 bg-dark-700/80 px-1.5 py-0.5 rounded">
                      avg {stat!.avg}ms
                    </span>
                  ) : (
                    <span className={`text-[10px] font-mono ${isActive ? p.textColor : 'text-slate-500'}`}>
                      ~{p.avgLatency}ms
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Message legend under lanes */}
          {isRunning && (
            <div className="flex items-center justify-center gap-6 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-purple-400" />
                <span className="text-[9px] font-mono text-slate-500">→ "Hello" (request)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1.5 rounded-full bg-emerald-300" />
                <span className="text-[9px] font-mono text-slate-500">← "ACK" (response)</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Server Node ── */}
        <div className="flex flex-col items-center gap-2 z-10 min-w-[80px] sm:min-w-[100px]">
          <div className="relative">
            {/* Ping rings when running */}
            {isRunning && (
              <>
                <div
                  className="absolute inset-0 rounded-2xl border-2 border-emerald-400/40 ping-ring"
                />
                <div
                  className="absolute inset-0 rounded-2xl border-2 border-emerald-400/20 ping-ring"
                  style={{ animationDelay: '0.7s' }}
                />
              </>
            )}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-all duration-500
                ${isRunning
                  ? 'bg-dark-600 border-2 border-emerald-500/50 box-pulse'
                  : 'bg-dark-700 border-2 border-slate-600'
                }`}
              style={isRunning ? { '--glow-color': 'rgba(16,185,129,0.35)' } as React.CSSProperties : {}}
            >
              🖥️
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">Server</span>
          {/* Responding indicator */}
          {isRunning && (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-mono text-emerald-400 status-blink">
                REPLYING
              </span>
              <span className="text-[9px] font-mono text-slate-500 bg-dark-700 px-1.5 py-0.5 rounded">
                ← "ACK"
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Live Metrics Bar (shows during simulation) ── */}
      {isRunning && stats.some((s) => s.samples.length > 0) && (
        <div className="mt-2 grid grid-cols-3 gap-3">
          {protocols.map((p) => {
            const stat = stats.find((s) => s.protocol === p.id);
            if (!stat || stat.samples.length === 0) return (
              <div key={p.id} className="bg-dark-700/50 rounded-xl p-3 border border-white/5 flex items-center justify-center">
                <span className="text-[10px] text-slate-500 font-mono">Waiting...</span>
              </div>
            );

            return (
              <div
                key={p.id}
                className="rounded-xl p-3 border transition-all duration-300"
                style={{
                  backgroundColor: `${p.color}08`,
                  borderColor: `${p.color}25`,
                }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs">{p.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: p.color }}>{p.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full status-blink ml-auto" style={{ backgroundColor: p.color }} />
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div>
                    <div className="text-[9px] text-slate-500 font-mono">MIN</div>
                    <div className="text-xs font-mono font-bold text-slate-300">{stat.min}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 font-mono">AVG</div>
                    <div
                      key={`avg-${p.id}-${flashKey}`}
                      className="text-xs font-mono font-bold latency-flash inline-block"
                      style={{ color: p.color }}
                    >
                      {stat.avg}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 font-mono">MAX</div>
                    <div className="text-xs font-mono font-bold text-slate-300">{stat.max}</div>
                  </div>
                </div>
                {/* Mini sparkline bar */}
                <div className="mt-2 h-1 rounded-full bg-dark-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (stat.samples.length / (totalIterations || 1)) * 100)}%`,
                      backgroundColor: p.color,
                      opacity: 0.6,
                    }}
                  />
                </div>
                <div className="text-[8px] text-slate-600 font-mono mt-0.5 text-right">
                  {stat.samples.length} samples
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Progress Bar (during simulation) ── */}
      {isRunning && (
        <div className="mt-4 relative">
          <div className="h-1 rounded-full bg-dark-700 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #8B5CF6, #10B981, #F59E0B)',
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] font-mono text-slate-600">{Math.round(progress)}%</span>
            <span className="text-[9px] font-mono text-slate-600">
              {currentIteration}/{totalIterations} iterations
            </span>
          </div>
        </div>
      )}

      {/* Code snippet — only when idle */}
      {!isRunning && (
        <div className="mt-4 p-4 bg-dark-700/50 rounded-xl border border-white/5">
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            <span className="text-slate-300">// Measurement Logic (per protocol)</span><br />
            <span className="text-purple-400">for</span> i <span className="text-purple-400">in</span> range(100):<br />
            &nbsp;&nbsp;start = time.now()<br />
            &nbsp;&nbsp;send(<span className="text-emerald-400">"Hello"</span>)&nbsp;&nbsp;
            <span className="text-slate-500">→ wait for</span> <span className="text-emerald-400">"ACK"</span><br />
            &nbsp;&nbsp;latency = time.now() - start<br />
            &nbsp;&nbsp;results.append(latency)
          </p>
        </div>
      )}
    </div>
  );
}
