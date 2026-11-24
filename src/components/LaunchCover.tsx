import React, { useEffect, useState } from 'react';
import { BlindMark } from './BlindMark';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLaunched: boolean;
}

const TARGET_LAUNCH_TIMESTAMP = new Date(2027, 0, 1, 0, 0, 0).getTime();

function computeTimeRemaining(nowMs: number): TimeRemaining {
  const diff = TARGET_LAUNCH_TIMESTAMP - nowMs;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLaunched: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, isLaunched: false };
}

function padTwo(value: number): string {
  return String(value).padStart(2, '0');
}

export const LaunchCover: React.FC = () => {
  const [remaining, setRemaining] = useState<TimeRemaining>(() =>
    computeTimeRemaining(Date.now())
  );

  useEffect(() => {
    const updateClock = () => {
      setRemaining(computeTimeRemaining(Date.now()));
    };
    updateClock();
    const intervalId = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const units = [
    { key: 'days', value: padTwo(remaining.days), label: 'Días' },
    { key: 'hours', value: padTwo(remaining.hours), label: 'Horas' },
    { key: 'minutes', value: padTwo(remaining.minutes), label: 'Minutos' },
    { key: 'seconds', value: padTwo(remaining.seconds), label: 'Segundos' },
  ];

  return (
    <main
      aria-label="Portada de estreno oficial BlinD 01/01/2027"
      onContextMenu={(e) => e.preventDefault()}
      className="carbon-surface fixed inset-0 h-dvh w-screen overflow-hidden select-none pointer-events-none flex flex-col justify-between px-6 py-8 sm:px-12 sm:py-10 lg:px-16 lg:py-12"
    >
      {/* Top & bottom brushed metallic specular hairlines */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/40 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-300/25 to-transparent"
      />

      {/* Left glowing circuit traces */}
      <svg
        aria-hidden="true"
        viewBox="0 0 280 720"
        fill="none"
        className="absolute left-0 top-0 h-full w-44 sm:w-64 lg:w-80 opacity-50"
        preserveAspectRatio="xMinYMid slice"
      >
        <g stroke="#28A9E0" strokeOpacity="0.2" strokeWidth="1.4">
          <path d="M 0 110 H 74 L 116 152 H 188" />
          <path d="M 0 230 H 54 L 102 278 H 164" />
          <path d="M 0 360 H 86 L 128 318 H 204" />
          <path d="M 0 490 H 62 L 110 442 H 176" />
          <path d="M 0 610 H 80 L 122 568 H 196" />
        </g>
        <g stroke="#7DD3FC" strokeOpacity="0.65" strokeWidth="1.5" strokeLinecap="round">
          <path d="M 0 110 H 74 L 116 152 H 188" className="animate-trace" />
          <path
            d="M 0 360 H 86 L 128 318 H 204"
            className="animate-trace"
            style={{ animationDelay: '1.1s' }}
          />
          <path
            d="M 0 610 H 80 L 122 568 H 196"
            className="animate-trace"
            style={{ animationDelay: '2.1s' }}
          />
        </g>
        <g fill="#38BDF8" fillOpacity="0.45">
          <circle cx="190" cy="152" r="3" />
          <circle cx="166" cy="278" r="2.5" />
          <circle cx="206" cy="318" r="3" />
          <circle cx="178" cy="442" r="2.5" />
          <circle cx="198" cy="568" r="3" />
        </g>
      </svg>

      {/* Right glowing circuit traces */}
      <svg
        aria-hidden="true"
        viewBox="0 0 280 720"
        fill="none"
        className="absolute right-0 top-0 h-full w-44 sm:w-64 lg:w-80 opacity-50"
        preserveAspectRatio="xMaxYMid slice"
      >
        <g stroke="#28A9E0" strokeOpacity="0.2" strokeWidth="1.4">
          <path d="M 280 110 H 206 L 164 152 H 92" />
          <path d="M 280 230 H 226 L 178 278 H 116" />
          <path d="M 280 360 H 194 L 152 318 H 76" />
          <path d="M 280 490 H 218 L 170 442 H 104" />
          <path d="M 280 610 H 200 L 158 568 H 84" />
        </g>
        <g stroke="#7DD3FC" strokeOpacity="0.65" strokeWidth="1.5" strokeLinecap="round">
          <path
            d="M 280 110 H 206 L 164 152 H 92"
            className="animate-trace"
            style={{ animationDelay: '0.5s' }}
          />
          <path
            d="M 280 360 H 194 L 152 318 H 76"
            className="animate-trace"
            style={{ animationDelay: '1.5s' }}
          />
          <path
            d="M 280 610 H 200 L 158 568 H 84"
            className="animate-trace"
            style={{ animationDelay: '2.4s' }}
          />
        </g>
        <g fill="#38BDF8" fillOpacity="0.45">
          <circle cx="90" cy="152" r="3" />
          <circle cx="114" cy="278" r="2.5" />
          <circle cx="74" cy="318" r="3" />
          <circle cx="102" cy="442" r="2.5" />
          <circle cx="82" cy="568" r="3" />
        </g>
      </svg>

      {/* Top Row: Brand Identity & Target Date */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4 border-b border-slate-800/80 pb-5 sm:pb-6">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <BlindMark className="h-11 w-11 sm:h-14 sm:w-14 shrink-0" glow animated />
          <div>
            <p className="font-display text-xl sm:text-3xl font-extrabold tracking-[0.16em] text-white leading-none">
              BLIND
            </p>
            <p className="mt-1 text-xs sm:text-sm font-medium text-sky-400">
              Seguridad Perimetral · Cuenta regresiva de estreno
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[11px] sm:text-xs text-slate-400">Fecha objetivo</p>
          <p className="mt-0.5 font-mono text-sm sm:text-xl font-semibold text-sky-200 tabular-nums">
            01 / 01 / 2027
          </p>
        </div>
      </div>

      {/* Center Focal Anchor: Full-Width Descending Countdown */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1360px] flex-1 flex-col items-center justify-center py-6 sm:py-10">
        <div className="relative w-full">
          {/* Ambient luminous halo */}
          <div
            aria-hidden="true"
            className="absolute inset-x-12 top-1/2 -z-10 h-44 -translate-y-1/2 rounded-full bg-sky-500/10 blur-3xl"
          />

          <div
            aria-label="Tiempo restante para el estreno del 1 de enero de 2027"
            className="grid w-full grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8"
          >
            {units.map((unit) => (
              <div
                key={unit.key}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/90 bg-[#0A111A]/90 px-4 py-8 sm:py-12 lg:py-16 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
              >
                <span className="font-mono text-5xl sm:text-7xl lg:text-8xl xl:text-[6.5rem] font-semibold leading-none tracking-tight text-sky-100 tabular-nums drop-shadow-[0_0_24px_rgba(56,189,248,0.42)]">
                  {unit.value}
                </span>
                <span className="mt-4 sm:mt-5 font-display text-sm sm:text-base lg:text-lg font-medium tracking-wide text-slate-400">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Official Launch Notice */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1360px] flex-col gap-2 border-t border-slate-800/80 pt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-6 text-xs sm:text-sm text-slate-400">
        <span>
          {remaining.isLaunched
            ? 'Estreno oficial disponible hoy · Seguridad perimetral empresarial y hogar'
            : 'Lanzamiento nacional · Seguridad perimetral empresarial y hogar · Domótica e IA'}
        </span>
        <span className="font-mono tabular-nums text-sky-300 shrink-0">
          00:00 h · 01 Ene 2027
        </span>
      </div>
    </main>
  );
};
