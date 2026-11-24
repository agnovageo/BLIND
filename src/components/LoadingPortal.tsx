import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { BlindMark } from './BlindMark';

interface LoadingPortalProps {
  visible: boolean;
  onComplete: () => void;
}

const BOOT_STAGES = [
  { threshold: 0, label: 'Inicializando matriz de seguridad perimetral' },
  { threshold: 28, label: 'Calibrando sensores LiDAR y barreras infrarrojas' },
  { threshold: 58, label: 'Enlazando analítica de alerta temprana IA' },
  { threshold: 84, label: 'Sincronizando nodos de domótica residencial y empresarial' },
  { threshold: 100, label: 'Perímetro activo · Listo para monitoreo' },
];

export const LoadingPortal: React.FC<LoadingPortalProps> = ({ visible, onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setProgress(100);
      const quickTimer = window.setTimeout(onComplete, 450);
      return () => window.clearTimeout(quickTimer);
    }

    setProgress(0);
    const startTime = performance.now();
    const durationMs = 2700;
    let rafId = 0;
    let closeTimeout = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const ratio = Math.min(elapsed / durationMs, 1);
      // Smooth tactical ease-out curve with brief realistic micro-settle around 68%
      const eased = 1 - Math.pow(1 - ratio, 2.35);
      const nextVal = Math.min(100, Math.round(eased * 100));
      setProgress(nextVal);

      if (ratio < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        closeTimeout = window.setTimeout(onComplete, 480);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(closeTimeout);
    };
  }, [visible, onComplete]);

  const currentStage =
    [...BOOT_STAGES].reverse().find((stage) => progress >= stage.threshold)?.label ??
    BOOT_STAGES[0].label;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.015 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#04070B] p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Portal de carga BlinD Seguridad Perimetral"
        >
          {/* Metallic brushed bezel frame echoing the reference tactical display */}
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-500/35 bg-gradient-to-b from-slate-700/45 via-slate-900/80 to-slate-700/40 p-[2px] shadow-[0_32px_100px_rgba(0,0,0,0.85)]">
            <div className="carbon-surface relative flex min-h-[480px] sm:min-h-[540px] flex-col items-center justify-center overflow-hidden rounded-[14px] px-6 py-12 sm:px-14">
              {/* Top & bottom brushed metallic light reflection */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/45 to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-300/25 to-transparent"
              />

              {/* Left glowing PCB circuit traces */}
              <svg
                aria-hidden="true"
                viewBox="0 0 260 440"
                fill="none"
                className="pointer-events-none absolute left-0 top-0 h-full w-40 sm:w-64 opacity-70"
                preserveAspectRatio="xMinYMid slice"
              >
                <g stroke="#28A9E0" strokeOpacity="0.22" strokeWidth="1.5">
                  <path d="M 0 70 H 62 L 96 104 H 146" />
                  <path d="M 0 128 H 44 L 84 168 H 138" />
                  <path d="M 0 218 H 76 L 108 186 H 158" />
                  <path d="M 0 290 H 52 L 94 248 H 134" />
                  <path d="M 0 364 H 72 L 112 324 H 168" />
                </g>
                <g stroke="#7DD3FC" strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M 0 70 H 62 L 96 104 H 146" className="animate-trace" />
                  <path d="M 0 218 H 76 L 108 186 H 158" className="animate-trace" style={{ animationDelay: '0.9s' }} />
                  <path d="M 0 364 H 72 L 112 324 H 168" className="animate-trace" style={{ animationDelay: '1.6s' }} />
                </g>
                <g fill="#38BDF8" fillOpacity="0.45">
                  <circle cx="148" cy="104" r="3" />
                  <circle cx="140" cy="168" r="2.5" />
                  <circle cx="160" cy="186" r="3" />
                  <circle cx="136" cy="248" r="2.5" />
                  <circle cx="170" cy="324" r="3" />
                </g>
              </svg>

              {/* Right glowing PCB circuit traces */}
              <svg
                aria-hidden="true"
                viewBox="0 0 260 440"
                fill="none"
                className="pointer-events-none absolute right-0 top-0 h-full w-40 sm:w-64 opacity-70"
                preserveAspectRatio="xMaxYMid slice"
              >
                <g stroke="#28A9E0" strokeOpacity="0.22" strokeWidth="1.5">
                  <path d="M 260 66 H 196 L 160 102 H 112" />
                  <path d="M 260 144 H 212 L 170 186 H 116" />
                  <path d="M 260 226 H 184 L 148 262 H 104" />
                  <path d="M 260 306 H 204 L 166 268 H 124" />
                  <path d="M 260 374 H 188 L 146 332 H 96" />
                </g>
                <g stroke="#7DD3FC" strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M 260 66 H 196 L 160 102 H 112" className="animate-trace" style={{ animationDelay: '0.4s' }} />
                  <path d="M 260 226 H 184 L 148 262 H 104" className="animate-trace" style={{ animationDelay: '1.2s' }} />
                  <path d="M 260 374 H 188 L 146 332 H 96" className="animate-trace" style={{ animationDelay: '2.0s' }} />
                </g>
                <g fill="#38BDF8" fillOpacity="0.45">
                  <circle cx="110" cy="102" r="3" />
                  <circle cx="114" cy="186" r="2.5" />
                  <circle cx="102" cy="262" r="3" />
                  <circle cx="122" cy="268" r="2.5" />
                  <circle cx="94" cy="332" r="3" />
                </g>
              </svg>

              {/* Central Luminous BLIND Loading Lockup */}
              <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
                <div className="relative mb-5">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-6 rounded-full bg-sky-400/15 blur-2xl"
                  />
                  <BlindMark className="relative h-28 w-28 sm:h-32 sm:w-32" glow animated />
                </div>

                {/* Wordmark + Integrated Luminous Progress Bar matching reference */}
                <div className="w-full max-w-[330px] sm:max-w-[380px]">
                  <div
                    className="font-display text-5xl sm:text-6xl font-extrabold tracking-[0.14em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-sky-200 via-sky-300 to-white drop-shadow-[0_0_24px_rgba(56,189,248,0.45)] select-none"
                  >
                    BLIND
                  </div>

                  {/* Luminous horizontal progress rail directly under BLIND */}
                  <div
                    className="relative mt-2.5 h-3.5 w-full overflow-hidden rounded-full border border-sky-400/45 bg-[#06111D]/90 p-[2px] shadow-[0_0_24px_rgba(40,169,224,0.22)]"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progreso de inicialización perimetral"
                  >
                    <div
                      className="relative h-full rounded-full bg-gradient-to-r from-[#28A9E0] via-[#7DD3FC] to-white shadow-[0_0_18px_rgba(125,211,252,0.95)] transition-[width] duration-75 ease-out"
                      style={{ width: `${Math.max(progress, 3)}%` }}
                    />
                  </div>

                  <p className="mt-3 font-display text-xs sm:text-sm font-semibold tracking-[0.26em] text-sky-300/95">
                    SEGURIDAD PERIMETRAL
                  </p>
                </div>

                {/* Tabular Digital Percentage Readout */}
                <div className="mt-6 flex flex-col items-center gap-2">
                  <span className="font-mono text-3xl sm:text-4xl font-semibold tracking-[0.12em] text-sky-100 tabular-nums drop-shadow-[0_0_14px_rgba(56,189,248,0.6)]">
                    {progress}%
                  </span>
                  <p className="min-h-[20px] text-xs sm:text-sm text-slate-400">
                    {currentStage}
                  </p>
                </div>

                {/* Zero-latency interactive entry action */}
                <button
                  type="button"
                  onClick={onComplete}
                  className="mt-8 inline-flex items-center gap-2 rounded-lg border border-sky-400/35 bg-sky-500/10 px-5 py-2.5 text-sm font-medium text-sky-100 transition-colors duration-150 hover:bg-sky-500/20 hover:border-sky-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Ingresar al portal</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
