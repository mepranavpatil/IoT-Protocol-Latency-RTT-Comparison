import Header from './components/Header';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import SimulationControl from './components/SimulationControl';
import Charts from './components/Charts';
import Findings from './components/Findings';
import NodeRedFlow from './components/NodeRedFlow';
import MQTTBrokerMonitor from './components/MQTTBrokerMonitor';
import NodeRedDashboard from './components/NodeRedDashboard';
import { useLatencySimulation } from './hooks/useLatencySimulation';

export default function App() {
  const {
    results,
    isRunning,
    currentIteration,
    totalIterations,
    activeProtocol,
    stats,
    runSimulation,
    stopSimulation,
  } = useLatencySimulation();

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── 1. Simulation Control ── */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <SimulationControl
            isRunning={isRunning}
            currentIteration={currentIteration}
            totalIterations={totalIterations}
            onRun={runSimulation}
            onStop={stopSimulation}
          />
        </section>

        {/* ── 2. Node-RED Flow ── */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <SectionLabel icon="🔴" title="Node-RED Flow" sub="Visual IoT flow programming — localhost:1880" />
          <NodeRedFlow
            isRunning={isRunning}
            stats={stats}
            results={results}
            activeProtocol={activeProtocol}
          />
        </section>

        {/* ── 3. MQTT Broker Monitor + Architecture (side by side) ── */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div>
              <SectionLabel icon="🦟" title="Mosquitto MQTT Broker" sub="localhost:1883 — live packet stream" />
              <MQTTBrokerMonitor
                isRunning={isRunning}
                stats={stats}
                results={results}
                currentIteration={currentIteration}
                totalIterations={totalIterations}
                activeProtocol={activeProtocol}
              />
            </div>
            <div>
              <SectionLabel icon="📡" title="Data Transfer" sub="Device → Broker → Server → Response" />
              <ArchitectureDiagram
                activeProtocol={activeProtocol}
                isRunning={isRunning}
                currentIteration={currentIteration}
                totalIterations={totalIterations}
                stats={stats}
                results={results}
              />
            </div>
          </div>
        </section>

        {/* ── 4. Node-RED Dashboard ── */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <SectionLabel icon="📊" title="Node-RED Dashboard" sub="localhost:1880/ui — live gauges & metrics" />
          <NodeRedDashboard stats={stats} results={results} isRunning={isRunning} />
        </section>

        {/* ── 5. Visual Analysis (Charts) ── */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <SectionLabel icon="📈" title="Visual Analysis" sub="RTT distribution, latency over time, comparison" />
          <Charts stats={stats} results={results} />
        </section>

        {/* ── 6. Findings & Context ── */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Findings />
        </section>
      </main>

      <footer className="border-t border-white/5 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-1">
          <p className="text-xs text-slate-500 font-mono">
            IoT Protocol RTT Latency Comparison — Node-RED + Mosquitto MQTT Broker
          </p>
          <p className="text-[10px] text-slate-600 font-mono">
            MQTT • CoAP • AMQP &nbsp;|&nbsp; Mosquitto v2.0 • RabbitMQ • aiocoap &nbsp;|&nbsp; CO3 + CO5 + SDG 9
          </p>
        </div>
      </footer>
    </div>
  );
}

function SectionLabel({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-base">{icon}</span>
      <span className="text-sm font-semibold text-white">{title}</span>
      <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">— {sub}</span>
    </div>
  );
}
