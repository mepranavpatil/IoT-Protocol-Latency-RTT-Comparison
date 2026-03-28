export interface ProtocolConfig {
  id: string;
  name: string;
  fullName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  transport: string;
  port: number;
  pattern: string;
  qos: string;
  overhead: string;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  description: string;
  icon: string;
}

export interface LatencyResult {
  protocol: string;
  iteration: number;
  latency: number;
  timestamp: number;
}

export interface ProtocolStats {
  protocol: string;
  avg: number;
  min: number;
  max: number;
  stdDev: number;
  samples: number[];
}
