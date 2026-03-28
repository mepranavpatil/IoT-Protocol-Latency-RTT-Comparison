import { useState } from 'react';
import type { ProtocolStats, LatencyResult } from '../types';
import { protocols } from '../data/protocols';

interface Props {
  isRunning: boolean;
  stats: ProtocolStats[];
  results: LatencyResult[];
  activeProtocol: string | null;
}

interface FlowNode {
  id: string;
  type: string;
  label: string;
  sublabel?: string;
  icon: string;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const flowNodes: FlowNode[] = [
  // Row 1: MQTT flow
  { id: 'inject-mqtt', type: 'inject', label: 'Inject', sublabel: 'timestamp', icon: '💉', color: '#9CA3AF', x: 30, y: 30, w: 110, h: 36 },
  { id: 'mqtt-out', type: 'mqtt-out', label: 'mqtt out', sublabel: 'iot/latency/mqtt', icon: '📤', color: '#8B5CF6', x: 180, y: 30, w: 140, h: 36 },
  { id: 'mqtt-in', type: 'mqtt-in', label: 'mqtt in', sublabel: 'iot/response/mqtt', icon: '📥', color: '#8B5CF6', x: 360, y: 30, w: 140, h: 36 },
  { id: 'func-mqtt', type: 'function', label: 'Calc RTT', sublabel: 'Δt = t₂ - t₁', icon: '⚙️', color: '#F59E0B', x: 540, y: 30, w: 120, h: 36 },
  { id: 'chart-mqtt', type: 'chart', label: 'Dashboard', sublabel: 'gauge + chart', icon: '📊', color: '#10B981', x: 700, y: 30, w: 120, h: 36 },

  // Row 2: CoAP flow
  { id: 'inject-coap', type: 'inject', label: 'Inject', sublabel: 'timestamp', icon: '💉', color: '#9CA3AF', x: 30, y: 95, w: 110, h: 36 },
  { id: 'coap-req', type: 'coap-req', label: 'coap request', sublabel: 'coap://server:5683', icon: '📤', color: '#10B981', x: 180, y: 95, w: 140, h: 36 },
  { id: 'coap-res', type: 'coap-res', label: 'coap response', sublabel: 'ACK 2.05', icon: '📥', color: '#10B981', x: 360, y: 95, w: 140, h: 36 },
  { id: 'func-coap', type: 'function', label: 'Calc RTT', sublabel: 'Δt = t₂ - t₁', icon: '⚙️', color: '#F59E0B', x: 540, y: 95, w: 120, h: 36 },
  { id: 'chart-coap', type: 'chart', label: 'Dashboard', sublabel: 'gauge + chart', icon: '📊', color: '#10B981', x: 700, y: 95, w: 120, h: 36 },

  // Row 3: AMQP flow
  { id: 'inject-amqp', type: 'inject', label: 'Inject', sublabel: 'timestamp', icon: '💉', color: '#9CA3AF', x: 30, y: 160, w: 110, h: 36 },
  { id: 'amqp-out', type: 'amqp-out', label: 'amqp out', sublabel: 'latency.exchange', icon: '📤', color: '#F59E0B', x: 180, y: 160, w: 140, h: 36 },
  { id: 'amqp-in', type: 'amqp-in', label: 'amqp in', sublabel: 'response.queue', icon: '📥', color: '#F59E0B', x: 360, y: 160, w: 140, h: 36 },
  { id: 'func-amqp', type: 'function', label: 'Calc RTT', sublabel: 'Δt = t₂ - t₁', icon: '⚙️', color: '#F59E0B', x: 540, y: 160, w: 120, h: 36 },
  { id: 'chart-amqp', type: 'chart', label: 'Dashboard', sublabel: 'gauge + chart', icon: '📊', color: '#10B981', x: 700, y: 160, w: 120, h: 36 },
];

// Wire connections: [from_id, to_id]
const wires: [string, string][] = [
  ['inject-mqtt', 'mqtt-out'], ['mqtt-out', 'mqtt-in'], ['mqtt-in', 'func-mqtt'], ['func-mqtt', 'chart-mqtt'],
  ['inject-coap', 'coap-req'], ['coap-req', 'coap-res'], ['coap-res', 'func-coap'], ['func-coap', 'chart-coap'],
  ['inject-amqp', 'amqp-out'], ['amqp-out', 'amqp-in'], ['amqp-in', 'func-amqp'], ['func-amqp', 'chart-amqp'],
];

export default function NodeRedFlow({ isRunning, stats, activeProtocol }: Props) {
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);

  const getNodeById = (id: string) => flowNodes.find((n) => n.id === id)!;

  const isActiveRow = (nodeId: string) => {
    if (!isRunning || !activeProtocol) return false;
    return nodeId.includes(activeProtocol);
  };

  return (
    <div className="bg-dark-800 border border-white/5 rounded-2xl overflow-hidden">
      {/* Node-RED style top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#8f0000] border-b border-red-900/50">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 100 30" className="h-5 w-auto">
            <text x="0" y="22" fill="white" fontWeight="bold" fontSize="20" fontFamily="Arial">Node-</text>
            <text x="60" y="22" fill="white" fontWeight="300" fontSize="20" fontFamily="Arial">RED</text>
          </svg>
          <span className="text-red-200/60 text-xs ml-2 font-mono">v3.1.0</span>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-white/80 bg-white/10 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Flow Running
            </span>
          )}
          <span className="text-xs text-red-200/50 font-mono">IoT Latency Flow</span>
        </div>
      </div>

      {/* Flow canvas */}
      <div className="relative p-4">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, #666 0.5px, transparent 0.5px)',
          backgroundSize: '20px 20px',
        }} />

        <div className="relative" style={{ height: 230 }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 860 220" preserveAspectRatio="xMidYMid meet">
            {/* Wires */}
            {wires.map(([fromId, toId], i) => {
              const from = getNodeById(fromId);
              const to = getNodeById(toId);
              const x1 = from.x + from.w;
              const y1 = from.y + from.h / 2;
              const x2 = to.x;
              const y2 = to.y + to.h / 2;
              const active = isActiveRow(fromId) || isActiveRow(toId);

              return (
                <g key={i}>
                  <path
                    d={`M ${x1} ${y1} C ${x1 + 20} ${y1}, ${x2 - 20} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={active ? '#fff' : '#444'}
                    strokeWidth={active ? 2 : 1.5}
                    opacity={active ? 0.8 : 0.4}
                  />
                  {/* Animated dot on wire */}
                  {isRunning && active && (
                    <circle r="3" fill="#fff">
                      <animateMotion
                        path={`M ${x1} ${y1} C ${x1 + 20} ${y1}, ${x2 - 20} ${y2}, ${x2} ${y2}`}
                        dur={activeProtocol === 'coap' ? '0.6s' : activeProtocol === 'mqtt' ? '0.9s' : '1.3s'}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {flowNodes.map((node) => {
              const active = isActiveRow(node.id);
              const protocolId = node.id.includes('mqtt') ? 'mqtt' : node.id.includes('coap') ? 'coap' : 'amqp';
              const proto = protocols.find((p) => p.id === protocolId);

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                  className="cursor-pointer"
                >
                  {/* Node body */}
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.w}
                    height={node.h}
                    rx={6}
                    fill={active ? `${node.color}22` : '#1a1a2e'}
                    stroke={active ? node.color : '#333'}
                    strokeWidth={active ? 2 : 1}
                  />
                  {/* Left color strip */}
                  <rect
                    x={node.x}
                    y={node.y}
                    width={4}
                    height={node.h}
                    rx={2}
                    fill={node.color}
                    opacity={active ? 1 : 0.5}
                  />
                  {/* Active glow */}
                  {isRunning && active && (
                    <rect
                      x={node.x - 2}
                      y={node.y - 2}
                      width={node.w + 4}
                      height={node.h + 4}
                      rx={8}
                      fill="none"
                      stroke={node.color}
                      strokeWidth={1}
                      opacity={0.3}
                    >
                      <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1s" repeatCount="indefinite" />
                    </rect>
                  )}
                  {/* Input port */}
                  {node.type !== 'inject' && (
                    <circle cx={node.x} cy={node.y + node.h / 2} r={4} fill="#666" stroke="#333" strokeWidth={1} />
                  )}
                  {/* Output port */}
                  {node.type !== 'chart' && (
                    <circle cx={node.x + node.w} cy={node.y + node.h / 2} r={4} fill="#666" stroke="#333" strokeWidth={1} />
                  )}
                  {/* Label */}
                  <text x={node.x + 14} y={node.y + 16} fill="#e2e8f0" fontSize={10} fontFamily="sans-serif" fontWeight="500">
                    {node.label}
                  </text>
                  {node.sublabel && (
                    <text x={node.x + 14} y={node.y + 28} fill="#94a3b8" fontSize={7.5} fontFamily="monospace">
                      {node.sublabel}
                    </text>
                  )}

                  {/* Show latest value on function nodes when running */}
                  {isRunning && active && node.type === 'function' && (
                    <g>
                      <rect x={node.x + node.w - 35} y={node.y - 14} width={35} height={14} rx={3} fill={proto?.color || '#fff'} opacity={0.9} />
                      <text x={node.x + node.w - 32} y={node.y - 4} fill="#fff" fontSize={8} fontWeight="bold" fontFamily="monospace">
                        {stats.find((s) => s.protocol === protocolId)?.avg || '—'}ms
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Row labels */}
            <text x={855} y={52} fill="#8B5CF6" fontSize={10} fontWeight="bold" textAnchor="end" opacity={0.6}>MQTT</text>
            <text x={855} y={117} fill="#10B981" fontSize={10} fontWeight="bold" textAnchor="end" opacity={0.6}>CoAP</text>
            <text x={855} y={182} fill="#F59E0B" fontSize={10} fontWeight="bold" textAnchor="end" opacity={0.6}>AMQP</text>
          </svg>
        </div>

        {/* Node info panel */}
        {selectedNode && (
          <div className="mt-2 p-3 rounded-lg bg-dark-700 border border-white/10 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white">{selectedNode.icon} {selectedNode.label}</span>
              <span className="text-slate-500 font-mono">{selectedNode.type}</span>
            </div>
            <p className="text-slate-400 font-mono">{selectedNode.sublabel}</p>
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-900/50 border-t border-white/5 text-[10px] font-mono text-slate-500">
        <span>Flows: IoT_Latency_Test</span>
        <span className="flex items-center gap-3">
          <span>Nodes: {flowNodes.length}</span>
          <span>Wires: {wires.length}</span>
          {isRunning ? (
            <span className="text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Connected
            </span>
          ) : (
            <span className="text-slate-600">Idle</span>
          )}
        </span>
      </div>
    </div>
  );
}
