import { useEffect, useState, useRef } from 'react';
import type { ProtocolStats, LatencyResult } from '../types';
import { protocols } from '../data/protocols';

interface Props {
  isRunning: boolean;
  stats: ProtocolStats[];
  results: LatencyResult[];
  currentIteration: number;
  totalIterations: number;
  activeProtocol: string | null;
}

interface Packet {
  id: number;
  protocol: string;
  direction: 'pub' | 'sub';
  topic: string;
  payload: string;
  qos: number;
  latency?: number;
  ts: string;
  color: string;
}

const topicMap: Record<string, { pub: string; sub: string; qos: number }> = {
  mqtt: { pub: 'iot/latency/mqtt', sub: 'iot/response/mqtt', qos: 1 },
  coap: { pub: 'coap://srv:5683/latency', sub: 'coap://srv:5683/ack', qos: 0 },
  amqp: { pub: 'amq.direct/latency.key', sub: 'response.queue', qos: 1 },
};

const protocolMeta: Record<string, { color: string; border: string; bg: string; label: string }> = {
  mqtt: { color: '#a78bfa', border: 'border-purple-500/40', bg: 'bg-purple-500/10', label: 'MQTT' },
  coap: { color: '#34d399', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', label: 'CoAP' },
  amqp: { color: '#fbbf24', border: 'border-amber-500/40', bg: 'bg-amber-500/10', label: 'AMQP' },
};

export default function MQTTBrokerMonitor({
  isRunning, stats, results, currentIteration, totalIterations, activeProtocol,
}: Props) {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [totalMsgCount, setTotalMsgCount] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  // Generate packets as simulation runs
  useEffect(() => {
    if (!isRunning || !activeProtocol) return;
    const latest = results[results.length - 1];
    if (!latest) return;

    const topics = topicMap[activeProtocol];
    const meta = protocolMeta[activeProtocol];
    const now = new Date();
    const ts = now.toTimeString().slice(0, 8) + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const iter = latest.iteration;
    const lat = latest.latency;

    const pub: Packet = {
      id: ++idRef.current,
      protocol: activeProtocol,
      direction: 'pub',
      topic: topics.pub,
      payload: `{"msg":"Hello","ts":${Date.now()},"iter":${iter}}`,
      qos: topics.qos,
      ts,
      color: meta.color,
    };
    const sub: Packet = {
      id: ++idRef.current,
      protocol: activeProtocol,
      direction: 'sub',
      topic: topics.sub,
      payload: `{"msg":"ACK","rtt":${lat},"iter":${iter}}`,
      qos: topics.qos,
      latency: lat,
      ts,
      color: meta.color,
    };

    setPackets((prev) => [...prev.slice(-40), pub, sub]);
    setTotalMsgCount((c) => c + 2);
  }, [isRunning, activeProtocol, currentIteration, results]);

  // Auto-scroll
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [packets]);

  const progress = totalIterations > 0 ? (currentIteration / totalIterations) * 100 : 0;
  const connectedClients = 3;
  const activeTopics = Object.keys(topicMap).length * 2;
  const mqttStat = stats.find((s) => s.protocol === 'mqtt');

  // Per-protocol live stats
  const liveStats = protocols.map((p) => {
    const s = stats.find((st) => st.protocol === p.id);
    const meta = protocolMeta[p.id];
    const isActive = activeProtocol === p.id && isRunning;
    return { p, s, meta, isActive };
  });

  return (
    <div className="bg-dark-800 border border-white/5 rounded-2xl overflow-hidden">
      {/* Mosquitto header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1030] border-b border-purple-900/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-xs font-mono text-purple-300 font-semibold">mosquitto</span>
            <span className="text-xs font-mono text-slate-500">v2.0.18</span>
          </div>
          <span className="text-slate-600 text-xs">|</span>
          <span className="text-xs font-mono text-slate-400">localhost:1883</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="text-purple-400 font-bold">{connectedClients}</span> clients
          </span>
          <span className="flex items-center gap-1">
            <span className="text-purple-400 font-bold">{activeTopics}</span> topics
          </span>
          <span className="flex items-center gap-1">
            <span className="text-purple-400 font-bold">{totalMsgCount}</span> msgs
          </span>
          {mqttStat && mqttStat.avg > 0 && (
            <span className="flex items-center gap-1">
              <span className="text-purple-400 font-bold">{mqttStat.avg}ms</span> avg RTT
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {isRunning && (
        <div className="h-0.5 bg-dark-700 relative overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #8b5cf6, #34d399, #f59e0b)',
            }}
          />
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Live per-protocol stat bars */}
        <div className="grid grid-cols-3 gap-2">
          {liveStats.map(({ p, s, meta, isActive }) => (
            <div
              key={p.id}
              className={`rounded-xl border p-3 transition-all duration-300 ${meta.border} ${meta.bg} ${isActive ? 'ring-1 ring-white/10' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold" style={{ color: meta.color }}>{meta.label}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'animate-pulse' : 'opacity-30'}`} style={{ backgroundColor: meta.color }} />
              </div>
              <div className="text-xs font-mono text-white font-bold">
                {s && s.avg > 0 ? `${s.avg}ms` : '—'}
              </div>
              <div className="text-[9px] font-mono text-slate-500 mt-0.5">avg RTT</div>
              {s && s.avg > 0 && (
                <div className="mt-2 h-1 rounded-full bg-dark-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min((s.avg / 120) * 100, 100)}%`,
                      backgroundColor: meta.color,
                      opacity: 0.7,
                    }}
                  />
                </div>
              )}
              <div className="flex justify-between mt-1 text-[8px] font-mono text-slate-600">
                <span>{s ? `↓${s.min}` : '—'}</span>
                <span>{s ? `↑${s.max}` : '—'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Topic subscriptions */}
        <div className="rounded-xl border border-white/5 bg-dark-900/50 p-3">
          <div className="text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-widest">Active Subscriptions</div>
          <div className="space-y-1">
            {Object.entries(topicMap).flatMap(([proto, t]) => {
              const meta = protocolMeta[proto];
              const isActive = activeProtocol === proto && isRunning;
              return [
                <div key={`${proto}-pub`} className={`flex items-center gap-2 text-[10px] font-mono py-0.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                  <span className="text-slate-600">PUB</span>
                  <span style={{ color: meta.color }} className="truncate">{t.pub}</span>
                  <span className="ml-auto text-slate-600">QoS{t.qos}</span>
                </div>,
                <div key={`${proto}-sub`} className={`flex items-center gap-2 text-[10px] font-mono py-0.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                  <span className="text-slate-600">SUB</span>
                  <span style={{ color: meta.color }} className="truncate">{t.sub}</span>
                  <span className="ml-auto text-slate-600">QoS{t.qos}</span>
                </div>,
              ];
            })}
          </div>
        </div>

        {/* Live packet log */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Live Packet Log</span>
            {isRunning && <span className="text-[9px] font-mono text-green-400 animate-pulse">● LIVE</span>}
          </div>
          <div
            ref={logRef}
            className="h-48 overflow-y-auto rounded-xl bg-dark-900/80 border border-white/5 p-2 space-y-0.5 font-mono text-[10px] scroll-smooth"
          >
            {packets.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 italic">
                Waiting for simulation…
              </div>
            ) : (
              packets.map((pkt) => (
                <div
                  key={pkt.id}
                  className="flex items-start gap-2 leading-relaxed py-0.5 border-b border-white/3"
                >
                  <span className="text-slate-600 shrink-0">{pkt.ts}</span>
                  <span
                    className={`shrink-0 font-bold px-1 rounded text-[9px] ${pkt.direction === 'pub' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}
                  >
                    {pkt.direction === 'pub' ? 'PUB' : 'SUB'}
                  </span>
                  <span style={{ color: pkt.color }} className="shrink-0">[{protocolMeta[pkt.protocol].label}]</span>
                  <span className="text-slate-400 truncate">{pkt.topic}</span>
                  {pkt.latency !== undefined && (
                    <span className="ml-auto shrink-0 text-emerald-400">{pkt.latency}ms</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
