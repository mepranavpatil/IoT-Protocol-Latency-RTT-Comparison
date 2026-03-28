import { Activity, Wifi } from 'lucide-react';

export default function Header() {
  return (
    <header className="relative overflow-hidden border-b border-white/5">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-emerald-900/20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <Activity className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              IoT Protocol Latency Demo
            </h1>
            <p className="text-sm text-slate-400 font-mono mt-0.5">
              Round-Trip Time (RTT) Comparison — Node-RED + MQTT Broker
            </p>
          </div>
        </div>

        {/* Tool stack */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="text-slate-500">Powered by:</span>
          <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-300 flex items-center gap-1">
            🔴 Node-RED
          </span>
          <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 flex items-center gap-1">
            🦟 Mosquitto
          </span>
          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 flex items-center gap-1">
            🐇 RabbitMQ
          </span>
          <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 flex items-center gap-1">
            🐍 Python / aiocoap
          </span>
        </div>

        {/* Protocol badges */}
        <div className="flex flex-wrap gap-3 text-xs font-mono">
          <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 flex items-center gap-1.5">
            <Wifi className="w-3 h-3" /> MQTT
          </span>
          <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 flex items-center gap-1.5">
            ⚡ CoAP
          </span>
          <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 flex items-center gap-1.5">
            🏗️ AMQP
          </span>
          <span className="px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-300">
            CO3 + CO5 + SDG 9
          </span>
        </div>
      </div>
    </header>
  );
}
