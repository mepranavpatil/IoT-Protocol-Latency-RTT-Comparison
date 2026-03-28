import { Play, Square, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface Props {
  isRunning: boolean;
  currentIteration: number;
  totalIterations: number;
  onRun: (iterations: number) => void;
  onStop: () => void;
}

export default function SimulationControl({
  isRunning,
  currentIteration,
  totalIterations,
  onRun,
  onStop,
}: Props) {
  const [iterations, setIterations] = useState(100);
  const progress = totalIterations > 0 ? (currentIteration / totalIterations) * 100 : 0;

  return (
    <div className="bg-dark-800 border border-white/5 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">🚀 Run Simulation</h2>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
        <div className="flex-1">
          <label className="text-xs text-slate-400 font-mono mb-2 block">
            Iterations (per protocol)
          </label>
          <div className="flex gap-2">
            {[20, 50, 100, 200].map((n) => (
              <button
                key={n}
                onClick={() => setIterations(n)}
                disabled={isRunning}
                className={`flex-1 px-3 py-2 text-sm font-mono rounded-lg border transition-colors
                  ${iterations === n
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'bg-dark-700 border-white/10 text-slate-400 hover:border-white/20'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {!isRunning ? (
            <button
              onClick={() => onRun(iterations)}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors"
            >
              <Play className="w-4 h-4" />
              Start Test
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600/80 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {(isRunning || currentIteration > 0) && (
        <div className="mt-4">
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>Progress</span>
            <span>
              {currentIteration} / {totalIterations} iterations
              {isRunning && (
                <span className="ml-2 text-purple-400 inline-flex items-center gap-1">
                  <RotateCcw className="w-3 h-3 animate-spin" />
                  Running...
                </span>
              )}
            </span>
          </div>
          <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-emerald-500 to-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
