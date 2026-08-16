# 🌐 IoT Protocol Latency (RTT) Comparison Dashboard

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react\&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript\&logoColor=white)](https://typescriptlang.org)
[![Node-RED](https://img.shields.io/badge/Node--RED-3.1-8F0000?logo=nodered\&logoColor=white)](https://nodered.org)
[![Mosquitto](https://img.shields.io/badge/Mosquitto-2.0-3C1361)](https://mosquitto.org)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.12-FF6600?logo=rabbitmq\&logoColor=white)](https://rabbitmq.com)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker\&logoColor=white)](https://docker.com)

---

# 📖 Project Overview

The **IoT Protocol Latency (RTT) Comparison Dashboard** is an educational and analytical platform designed to compare the communication performance of three major IoT protocols:

* **MQTT (Message Queuing Telemetry Transport)**
* **CoAP (Constrained Application Protocol)**
* **AMQP (Advanced Message Queuing Protocol)**

The project simulates real IoT communication workflows and measures the **Round Trip Time (RTT)** required for a message to travel from a device to a broker/server and return with an acknowledgment.

The system combines:

* A modern React-based visualization dashboard
* Node-RED flow orchestration
* Mosquitto MQTT broker
* RabbitMQ AMQP broker
* CoAP server implementation
* Real-time charts and analytics
* Docker containerization for deployment

This project helps students, researchers, and IoT developers understand how communication protocols behave under different conditions and which protocol is best suited for specific IoT applications.

---

# 🎯 Problem Statement

IoT devices communicate using different protocols depending on power consumption, bandwidth, latency requirements, and reliability.

Choosing the wrong protocol can result in:

* Increased network congestion
* Higher power consumption
* Slow device responses
* Scalability issues

This project analyzes and visualizes the latency characteristics of MQTT, CoAP, and AMQP to help determine the most efficient protocol for a given IoT scenario.

---

# 🎯 Objectives

The main objectives of this project are:

### 1. Measure Protocol Performance

Calculate Round Trip Time (RTT) for:

* MQTT
* CoAP
* AMQP

### 2. Visualize Communication Flow

Display how data travels through:

```text id="xz8vcm"
IoT Device
   ↓
Protocol Layer
   ↓
Broker / Server
   ↓
Acknowledgement
   ↓
IoT Device
```

### 3. Compare Protocol Characteristics

Evaluate:

* Speed
* Reliability
* Overhead
* Scalability
* Resource consumption

### 4. Demonstrate Real IoT Infrastructure

Use industry-standard tools:

* Node-RED
* Mosquitto
* RabbitMQ
* Docker

---

# 🧠 Understanding RTT (Round Trip Time)

RTT represents the total time required for:

1. Sending a request
2. Processing the request
3. Receiving the response

Formula:

```text id="ub14zy"
RTT = Response Time − Request Time
```

Example:

```text id="z73h9c"
Request Sent   : 10:00:00.100
Response Arrive: 10:00:00.145

RTT = 45 ms
```

Lower RTT means:

* Faster communication
* Better user experience
* Lower network delay

---

# 📡 Protocol Overview

## MQTT

### What is MQTT?

MQTT is a lightweight messaging protocol specifically designed for IoT devices.

### Communication Model

```text id="6qv9dx"
Publisher
    │
    ▼
MQTT Broker
    │
    ▼
Subscriber
```

### Why MQTT?

* Low bandwidth consumption
* Reliable TCP communication
* Publish/Subscribe architecture
* Ideal for sensors and smart devices

### Real World Usage

* Smart Homes
* Industrial IoT
* Agriculture Monitoring
* Vehicle Tracking

### Expected RTT

```text id="75d4to"
~45 ms
```

---

## CoAP

### What is CoAP?

CoAP is a lightweight protocol built on UDP.

Unlike MQTT, it does not require a broker.

### Communication Model

```text id="nd7q70"
Client
   │
   ▼
CoAP Server
   │
   ▼
Response
```

### Why CoAP?

* Very low overhead
* Fast transmission
* Minimal resource usage

### Real World Usage

* Battery-powered devices
* Smart lighting
* Wearable devices

### Expected RTT

```text id="o3t7uq"
~30 ms
```

---

## AMQP

### What is AMQP?

AMQP is an enterprise-grade messaging protocol.

It provides advanced routing, security, and message guarantees.

### Communication Model

```text id="1tdqf6"
Publisher
    │
    ▼
Exchange
    │
    ▼
Queue
    │
    ▼
Consumer
```

### Why AMQP?

* Reliable delivery
* Enterprise integration
* Message persistence

### Real World Usage

* Banking
* Logistics
* Enterprise Systems

### Expected RTT

```text id="1g6w3n"
~80 ms
```

---

# 🏗 System Architecture

```text id="n7g4t8"
+------------------+
| IoT Device       |
+------------------+
          |
          |
          ▼
+------------------+
| Protocol Layer   |
| MQTT / CoAP      |
| AMQP             |
+------------------+
          |
          ▼
+------------------+
| Broker / Server  |
| Mosquitto        |
| RabbitMQ         |
| CoAP Server      |
+------------------+
          |
          ▼
+------------------+
| Response         |
+------------------+
          |
          ▼
+------------------+
| Dashboard        |
+------------------+
```

---

# 🔴 Detailed MQTT Workflow

This is the most important part of the project.

The MQTT RTT measurement process works as follows.

---

## Step 1: Message Creation

An IoT device creates a message.

Example:

```json
{
  "message": "Hello",
  "timestamp": 1710000000000
}
```

The timestamp records the exact sending time.

---

## Step 2: Node-RED Inject Node

Node-RED automatically generates a message every second.

Purpose:

* Simulate sensor traffic
* Generate continuous test data

---

## Step 3: MQTT Publish

The MQTT Out Node publishes data to:

```text id="e12ws9"
iot/latency/mqtt
```

---

## Step 4: Mosquitto Broker Processing

Mosquitto receives the message.

Broker responsibilities:

* Accept connection
* Validate packet
* Route message
* Forward to subscribers

---

## Step 5: Subscriber Receives Message

Python subscriber listens on:

```text id="o6b67t"
iot/latency/mqtt
```

When received:

1. Read timestamp
2. Generate ACK
3. Send ACK back

---

## Step 6: ACK Published

ACK topic:

```text id="5mkwu7"
iot/response/mqtt
```

---

## Step 7: RTT Calculation

Node-RED receives ACK.

Function node executes:

```javascript
var rtt = Date.now() - msg.payload.timestamp;
```

---

## Step 8: Dashboard Visualization

Results displayed on:

* Gauge
* Line Chart
* Statistics Table
* Protocol Ranking

---

# 🔴 Why Mosquitto?

Mosquitto acts as the communication hub.

Functions:

* Message routing
* Client authentication
* Topic management
* QoS handling

Supported QoS:

| Level | Meaning       |
| ----- | ------------- |
| QoS 0 | At most once  |
| QoS 1 | At least once |
| QoS 2 | Exactly once  |

---

# 🔴 Why Node-RED?

Node-RED simplifies IoT workflow creation.

Benefits:

* Visual programming
* Drag-and-drop interface
* Real-time dashboards
* Easy MQTT integration

Node-RED handles:

1. Message injection
2. MQTT publishing
3. ACK reception
4. RTT calculation
5. Dashboard updates

---

# 📊 Dashboard Components

## Protocol Comparison Chart

Displays average RTT.

Purpose:

* Compare protocol performance

---

## Live Gauge

Shows current RTT.

Purpose:

* Instant latency monitoring

---

## Line Chart

Displays RTT over time.

Purpose:

* Detect spikes
* Identify network instability

---

## Distribution Histogram

Shows latency distribution.

Purpose:

* Understand consistency

---

## Statistics Table

Displays:

* Minimum RTT
* Average RTT
* Maximum RTT
* Standard Deviation

---

# 🐳 Docker Deployment Architecture

```text id="z8r92m"
Developer
    │
    ▼
Docker Build
    │
    ▼
Docker Image
    │
    ▼
Docker Container
    │
    ▼
Nginx Server
    │
    ▼
React Dashboard
```

---

# 🏗 Docker Build Process

### Step 1

Install dependencies:

```bash
npm install
```

### Step 2

Build application:

```bash
npm run build
```

### Step 3

Generate production files:

```text id="qj4f40"
dist/
```

### Step 4

Docker copies build files into Nginx.

### Step 5

Container serves application on:

```text id="yooxaw"
Port 80
```

---

# 🚀 Running with Docker

Build image:

```bash
docker build -t iot-latency-dashboard .
```

Run:

```bash
docker run -d \
--name iot-dashboard \
-p 8080:80 \
iot-latency-dashboard
```

Open:

```text id="r9z3u6"
http://localhost:8080
```

---

# 📁 Project Structure

```text id="jcgq5q"
src/
├── components/
│   ├── Header.tsx
│   ├── SimulationControl.tsx
│   ├── NodeRedFlow.tsx
│   ├── MQTTBrokerMonitor.tsx
│   ├── NodeRedDashboard.tsx
│   ├── ArchitectureDiagram.tsx
│   ├── Charts.tsx
│   └── Findings.tsx
│
├── hooks/
│   └── useLatencySimulation.ts
│
├── data/
│   └── protocols.ts
│
├── App.tsx
├── main.tsx
├── index.css
└── types.ts
```

---

# 🎓 Academic Relevance

### CO3

Analyze IoT communication protocols and evaluate network performance.

### CO5

Implement IoT communication using Node-RED, brokers, and protocol testing.

### SDG 9

Build resilient digital infrastructure through efficient communication technologies.

---

# 🔮 Future Enhancements

Potential improvements:

* Real MQTT broker integration
* Live protocol testing
* Kubernetes deployment
* Prometheus monitoring
* Grafana dashboards
* WebSocket support
* TLS-secured MQTT communication
* Cloud deployment on AWS or Azure

---

# 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push changes
5. Open Pull Request

---

# 📄 License

MIT License

See LICENSE file for details.

---

<p align="center">
  <strong>MQTT • CoAP • AMQP</strong><br>
  <em>React + Node-RED + Mosquitto + RabbitMQ + Docker</em><br>
  <sub>Comprehensive IoT Protocol Performance Analysis Platform</sub>
</p>
