import { useState, useCallback, useRef } from 'react';
import { protocols } from '../data/protocols';
import { LatencyResult, ProtocolStats } from '../types';

function generateLatency(avg: number, min: number, max: number): number {
  // Use normal-ish distribution centered around avg
  const u1 = Math.random();
  const u2 = Math.random();
  const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const stdDev = (max - min) / 6;
  const value = avg + normal * stdDev;
  return Math.max(min, Math.min(max, Math.round(value * 10) / 10));
}

function calcStats(samples: number[]): { avg: number; min: number; max: number; stdDev: number } {
  if (samples.length === 0) return { avg: 0, min: 0, max: 0, stdDev: 0 };
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const variance = samples.reduce((sum, val) => sum + (val - avg) ** 2, 0) / samples.length;
  const stdDev = Math.round(Math.sqrt(variance) * 100) / 100;
  return { avg: Math.round(avg * 100) / 100, min, max, stdDev };
}

export function useLatencySimulation() {
  const [results, setResults] = useState<LatencyResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [totalIterations, setTotalIterations] = useState(100);
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null);
  const cancelRef = useRef(false);

  const getStats = useCallback((): ProtocolStats[] => {
    return protocols.map((p) => {
      const samples = results
        .filter((r) => r.protocol === p.id)
        .map((r) => r.latency);
      const stats = calcStats(samples);
      return {
        protocol: p.id,
        ...stats,
        samples,
      };
    });
  }, [results]);

  const runSimulation = useCallback(async (iterations: number) => {
    setIsRunning(true);
    setResults([]);
    setCurrentIteration(0);
    setTotalIterations(iterations);
    cancelRef.current = false;

    const allResults: LatencyResult[] = [];

    for (let i = 1; i <= iterations; i++) {
      if (cancelRef.current) break;

      for (const protocol of protocols) {
        if (cancelRef.current) break;

        setActiveProtocol(protocol.id);
        const latency = generateLatency(protocol.avgLatency, protocol.minLatency, protocol.maxLatency);
        
        allResults.push({
          protocol: protocol.id,
          iteration: i,
          latency,
          timestamp: Date.now(),
        });
      }

      setResults([...allResults]);
      setCurrentIteration(i);

      // Delay between iterations for visual effect
      const delay = iterations <= 20 ? 150 : iterations <= 50 ? 60 : 25;
      await new Promise((r) => setTimeout(r, delay));
    }

    setActiveProtocol(null);
    setIsRunning(false);
  }, []);

  const stopSimulation = useCallback(() => {
    cancelRef.current = true;
  }, []);

  return {
    results,
    isRunning,
    currentIteration,
    totalIterations,
    activeProtocol,
    stats: getStats(),
    runSimulation,
    stopSimulation,
  };
}
