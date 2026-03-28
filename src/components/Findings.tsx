import { Target, Globe, Lightbulb, Cpu, GitBranch } from 'lucide-react';

function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <div className="font-mono text-[10px] bg-dark-900/70 border border-white/5 rounded-lg p-3 space-y-0.5">
      {lines.map((l, i) => (
        <p key={i} className={l.startsWith('#') || l.startsWith('//') ? 'text-slate-600' : 'text-emerald-300'}>{l}</p>
      ))}
    </div>
  );
}

function Step({ n, color, text }: { n: string; color: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[9px] font-bold border ${color}`}>{n}</span>
      <span className="text-xs text-slate-400 leading-relaxed">{text}</span>
    </div>
  );
}

export default function Findings() {
  return (
    <div className="space-y-5">

      {/* ── Key Findings ── */}
      <div className="bg-dark-800 border border-white/5 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Key Findings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              icon: '⚡', label: 'CoAP — Fastest', color: 'emerald',
              desc: 'UDP transport — no connection handshake. 4-byte header ideal for constrained IoT devices.',
              rtt: '~30ms avg RTT',
            },
            {
              icon: '📡', label: 'MQTT — Balanced', color: 'purple',
              desc: 'TCP for reliable delivery. Lightweight pub/sub with 2-byte min header via Mosquitto broker.',
              rtt: '~45ms avg RTT',
            },
            {
              icon: '🏗️', label: 'AMQP — Reliable', color: 'amber',
              desc: 'Enterprise-grade routing, queuing, exactly-once delivery. Higher latency due to heavier stack.',
              rtt: '~80ms avg RTT',
            },
          ].map((item) => (
            <div key={item.label} className={`p-4 rounded-xl bg-${item.color}-500/5 border border-${item.color}-500/20`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{item.icon}</span>
                <h3 className={`font-semibold text-${item.color}-400 text-sm`}>{item.label}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              <div className={`mt-3 px-2 py-1 bg-${item.color}-500/10 rounded text-[10px] font-mono text-${item.color}-300`}>{item.rtt}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How Node-RED + MQTT Work in This Project ── */}
      <div className="bg-dark-800 border border-white/5 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-red-400" />
          How Node-RED + MQTT Broker Work in This Project
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: architecture explanation */}
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-red-400 font-semibold">Node-RED</span> acts as the IoT flow orchestrator —
              it visually wires together inject triggers, protocol nodes, function logic, and the dashboard UI.
              <span className="text-purple-400 font-semibold"> Mosquitto</span> is the MQTT message broker that
              sits between publisher and subscriber, routing messages via topic-based delivery.
            </p>

            {/* Flow diagram in text */}
            <div className="rounded-xl bg-dark-900/60 border border-white/5 p-4 font-mono text-[10px] space-y-2">
              <p className="text-slate-500 mb-2">// Node-RED flow execution:</p>
              <div className="flex flex-col gap-1.5">
                {[
                  { node: '[inject]', desc: 'Fires every 1s — sends timestamp payload', color: 'text-slate-400' },
                  { node: '[mqtt out]', desc: 'Publishes to iot/latency/mqtt via Mosquitto:1883', color: 'text-purple-400' },
                  { node: '[Mosquitto]', desc: 'Brokers the message — routes to all subscribers', color: 'text-purple-300' },
                  { node: '[mqtt in]', desc: 'Receives ACK on iot/response/mqtt', color: 'text-purple-400' },
                  { node: '[function]', desc: 'RTT = Date.now() - msg.payload.ts', color: 'text-amber-400' },
                  { node: '[ui_gauge]', desc: 'Renders live RTT on Dashboard at /ui', color: 'text-emerald-400' },
                ].map(({ node, desc, color }, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`shrink-0 ${color} font-bold w-[82px]`}>{node}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-slate-400">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest">Data flow per measurement</p>
              <div className="space-y-1.5">
                <Step n="1" color="border-red-500/40 text-red-400" text="Node-RED inject node stamps current time (t₁) into message payload and triggers publish" />
                <Step n="2" color="border-purple-500/40 text-purple-400" text="mqtt-out node sends Hello to Mosquitto broker on topic iot/latency/mqtt (QoS 1)" />
                <Step n="3" color="border-emerald-500/40 text-emerald-400" text="Subscriber receives message via mqtt-in, immediately publishes ACK to iot/response/mqtt" />
                <Step n="4" color="border-amber-500/40 text-amber-400" text="Function node receives ACK: RTT = t₂ - t₁. Stores in flow context for aggregation" />
                <Step n="5" color="border-sky-500/40 text-sky-400" text="Dashboard nodes (gauge, chart) display live RTT — visible at localhost:1880/ui" />
              </div>
            </div>
          </div>

          {/* Right: setup + flow JSON */}
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">1 · Install & start Mosquitto broker</p>
              <CodeBlock lines={[
                '$ sudo apt install mosquitto mosquitto-clients',
                '$ sudo systemctl enable --now mosquitto',
                '# Broker running on localhost:1883',
                '$ mosquitto_sub -t "iot/response/mqtt" -v  # monitor ACKs',
              ]} />
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">2 · Install & start Node-RED</p>
              <CodeBlock lines={[
                '$ sudo npm install -g --unsafe-perm node-red',
                '$ node-red',
                '# Open http://localhost:1880',
                '# Menu → Import → paste flow JSON below',
              ]} />
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">3 · Node-RED MQTT flow (import JSON)</p>
              <div className="font-mono text-[9px] bg-dark-900/70 border border-white/5 rounded-lg p-3 max-h-36 overflow-y-auto text-slate-500">
                <pre>{`[{"id":"inj1","type":"inject","name":"Trigger",
  "repeat":"1","wires":[["mqttOut1"]]},
{"id":"mqttOut1","type":"mqtt out",
  "topic":"iot/latency/mqtt","broker":"broker1",
  "wires":[]},
{"id":"mqttIn1","type":"mqtt in",
  "topic":"iot/response/mqtt","broker":"broker1",
  "wires":[["calcRTT"]]},
{"id":"calcRTT","type":"function",
  "func":"var rtt=Date.now()-msg.payload.ts;\\n
msg.payload={rtt:rtt};return msg;",
  "wires":[["gauge1"]]},
{"id":"gauge1","type":"ui_gauge",
  "min":0,"max":200,"name":"RTT Gauge"},
{"id":"broker1","type":"mqtt-broker",
  "host":"localhost","port":"1883"}]`}</pre>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">4 · Python latency test (runs alongside)</p>
              <CodeBlock lines={[
                '$ pip install paho-mqtt aiocoap pika',
                '$ python latency_test.py --n 100',
                '# Results automatically sent to Node-RED',
                '# via MQTT topic iot/results/summary',
              ]} />
            </div>
          </div>
        </div>

        {/* Why Node-RED + MQTT */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              icon: '🔴', title: 'Node-RED Role', color: 'red',
              points: ['Visual flow programming — no-code IoT wiring', 'Orchestrates inject → broker → function → dashboard', 'Built-in dashboard for live gauges & charts', 'Runs on Raspberry Pi — real device deployment'],
            },
            {
              icon: '🦟', title: 'Mosquitto MQTT Broker', color: 'purple',
              points: ['Central message router for MQTT pub/sub', 'Topics: iot/latency/* and iot/response/*', 'QoS 1 ensures at-least-once delivery', 'Lightweight — ideal for IoT edge devices'],
            },
            {
              icon: '📊', title: 'What Gets Measured', color: 'emerald',
              points: ['RTT = t_subscribe − t_publish (per message)', '100 iterations per protocol for statistical validity', 'Min/Max/Avg/StdDev calculated in function node', 'Results persisted in flow context + displayed on /ui'],
            },
          ].map((card) => (
            <div key={card.title} className={`p-4 rounded-xl border border-${card.color}-500/20 bg-${card.color}-500/5`}>
              <div className="flex items-center gap-2 mb-3">
                <span>{card.icon}</span>
                <span className={`text-xs font-semibold text-${card.color}-400`}>{card.title}</span>
              </div>
              <ul className="space-y-1.5">
                {card.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-1.5 text-[10px] text-slate-400">
                    <span className={`text-${card.color}-500 mt-0.5`}>▸</span>{pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Course Outcomes + SDG ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-dark-800 border border-white/5 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Course Outcomes
          </h2>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <h4 className="text-xs font-semibold text-purple-400 mb-1">CO3 — Protocol Analysis</h4>
              <p className="text-[11px] text-slate-400">Analyze and compare IoT protocols (MQTT, CoAP, AMQP) based on latency, throughput, and reliability using measured data.</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <h4 className="text-xs font-semibold text-emerald-400 mb-1">CO5 — Implementation</h4>
              <p className="text-[11px] text-slate-400">Design and implement IoT applications using Node-RED + Mosquitto MQTT broker, measuring real-world RTT performance.</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-800 border border-white/5 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            SDG 9 — Industry, Innovation & Infrastructure
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Evaluating IoT communication protocols supports resilient, efficient, and sustainable infrastructure.
          </p>
          <div className="space-y-2">
            {[
              'Optimizing data transmission reduces energy in IoT networks',
              'Low-latency protocols enable real-time smart infrastructure',
              'Protocol selection guides scalable industrial IoT systems',
              'Supports innovation in smart cities and automation',
            ].map((text) => (
              <div key={text} className="flex items-start gap-2 text-[11px] text-slate-400">
                <span className="text-emerald-500 mt-0.5">▸</span><span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tech Stack ── */}
      <div className="bg-dark-800 border border-white/5 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-400" />
          Full Tech Stack
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="border-b border-white/5">
                {['Component', 'Tool', 'Port', 'Role'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-slate-600 font-normal text-[9px] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { comp: 'Flow Orchestration', tool: 'Node-RED v3.1', port: '1880', role: 'Visual wiring of inject → broker → dashboard' },
                { comp: 'MQTT Broker', tool: 'Mosquitto v2.0', port: '1883', role: 'Message routing for pub/sub MQTT protocol' },
                { comp: 'AMQP Broker', tool: 'RabbitMQ v3.12', port: '5672', role: 'Enterprise message queue for AMQP testing' },
                { comp: 'CoAP Library', tool: 'aiocoap (Python)', port: '5683', role: 'UDP-based CoAP request/response latency test' },
                { comp: 'MQTT Client', tool: 'paho-mqtt (Python)', port: '1883', role: 'Publishes & subscribes alongside Node-RED' },
                { comp: 'Dashboard UI', tool: 'This React App', port: '5173', role: 'Simulates + visualizes all protocol RTT data' },
              ].map((row) => (
                <tr key={row.comp} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-3 py-2 text-slate-300">{row.comp}</td>
                  <td className="px-3 py-2 text-sky-400">{row.tool}</td>
                  <td className="px-3 py-2 text-amber-400">:{row.port}</td>
                  <td className="px-3 py-2 text-slate-500">{row.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
