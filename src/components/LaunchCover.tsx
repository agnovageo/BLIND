import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from 'lucide-react';
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
  const [view, setView] = useState<'countdown' | 'contact'>('countdown');

  // Minimalist contact form state
  const [segment, setSegment] = useState<'empresa' | 'hogar'>('empresa');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  useEffect(() => {
    const updateClock = () => {
      setRemaining(computeTimeRemaining(Date.now()));
    };
    updateClock();
    const intervalId = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Ingresa tu nombre completo.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    if (phone.trim().replace(/\D/g, '').length < 7) {
      setError('Ingresa un teléfono de contacto válido.');
      return;
    }

    setSubmittedCode(`BLD-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  const handleResetAndReturn = () => {
    setView('countdown');
    setError('');
    if (submittedCode) {
      setSubmittedCode(null);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }
  };

  const units = [
    { key: 'days', value: padTwo(remaining.days), label: 'Días' },
    { key: 'hours', value: padTwo(remaining.hours), label: 'Horas' },
    { key: 'minutes', value: padTwo(remaining.minutes), label: 'Minutos' },
    { key: 'seconds', value: padTwo(remaining.seconds), label: 'Segundos' },
  ];

  return (
    <main
      aria-label="Portada de estreno oficial BlinD 01/01/2027"
      className="carbon-surface fixed inset-0 h-dvh w-screen overflow-hidden select-none flex flex-col justify-between px-6 py-7 sm:px-12 sm:py-10 lg:px-16 lg:py-12"
    >
      {/* Top & bottom brushed metallic specular hairlines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/40 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-300/25 to-transparent"
      />

      {/* Left glowing circuit traces */}
      <svg
        aria-hidden="true"
        viewBox="0 0 280 720"
        fill="none"
        className="pointer-events-none absolute left-0 top-0 h-full w-44 sm:w-64 lg:w-80 opacity-50"
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
        className="pointer-events-none absolute right-0 top-0 h-full w-44 sm:w-64 lg:w-80 opacity-50"
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
              {view === 'contact'
                ? 'Seguridad Perimetral · Contacto directo'
                : 'Seguridad Perimetral · Cuenta regresiva de estreno'}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          {view === 'contact' ? (
            <button
              type="button"
              onClick={handleResetAndReturn}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700/90 bg-[#0A111A]/90 px-4 py-2 text-xs sm:text-sm font-medium text-slate-200 transition-colors duration-150 hover:border-sky-400/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-sky-400" />
              <span>Volver</span>
            </button>
          ) : (
            <>
              <p className="text-[11px] sm:text-xs text-slate-400">Fecha objetivo</p>
              <p className="mt-0.5 font-mono text-sm sm:text-xl font-semibold text-sky-200 tabular-nums">
                01 / 01 / 2027
              </p>
            </>
          )}
        </div>
      </div>

      {/* Center Stage: Countdown View OR Minimalist Branded Contact Form */}
      {view === 'countdown' ? (
        <div className="relative z-10 mx-auto flex w-full max-w-[1360px] flex-1 flex-col items-center justify-center py-6 sm:py-10">
          <div className="relative w-full">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-12 top-1/2 -z-10 h-44 -translate-y-1/2 rounded-full bg-sky-500/10 blur-3xl"
            />

            <div
              aria-label="Tiempo restante para el estreno del 1 de enero de 2027"
              className="grid w-full grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8"
            >
              {units.map((unit) => (
                <div
                  key={unit.key}
                  className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/90 bg-[#0A111A]/90 px-4 py-7 sm:py-11 lg:py-14 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
                >
                  <span className="font-mono text-5xl sm:text-7xl lg:text-8xl xl:text-[6.25rem] font-semibold leading-none tracking-tight text-sky-100 tabular-nums drop-shadow-[0_0_24px_rgba(56,189,248,0.42)]">
                    {unit.value}
                  </span>
                  <span className="mt-3.5 sm:mt-5 font-display text-sm sm:text-base lg:text-lg font-medium tracking-wide text-slate-400">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Single Branded Contact CTA */}
          <div className="mt-8 sm:mt-11">
            <button
              type="button"
              onClick={() => setView('contact')}
              className="group inline-flex items-center gap-3 rounded-xl border border-sky-400/50 bg-gradient-to-r from-[#28A9E0]/18 via-[#28A9E0]/12 to-[#7DD3FC]/15 px-7 py-3.5 text-sm sm:text-base font-semibold tracking-wide text-sky-100 shadow-[0_0_32px_rgba(40,169,224,0.22)] transition-all duration-150 hover:border-sky-300/80 hover:bg-[#28A9E0] hover:text-slate-950 hover:shadow-[0_0_40px_rgba(56,189,248,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Mail className="h-4 w-4 text-sky-300 transition-colors group-hover:text-slate-950" />
              <span>Contacto</span>
              <ArrowRight className="h-4 w-4 text-sky-300 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-slate-950" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 items-center justify-center overflow-y-auto py-6">
          <div className="w-full rounded-2xl border border-slate-800/90 bg-[#0A111A]/95 p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.65)]">
            {submittedCode ? (
              <div className="py-4 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-sky-300" />
                <h1 className="mt-4 font-display text-2xl font-semibold text-white">
                  Mensaje enviado · #{submittedCode}
                </h1>
                <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                  Gracias, <span className="text-white font-medium">{name}</span>. Nuestro equipo de{' '}
                  <span className="text-sky-300">BlinD</span> te responderá pronto al correo{' '}
                  <span className="text-white">{email}</span>.
                </p>
                <button
                  type="button"
                  onClick={handleResetAndReturn}
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-[#28A9E0] px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 whitespace-nowrap cursor-pointer"
                >
                  Volver a la portada
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h1 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-white">
                    Contacto
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400">
                    Déjanos tus datos para proyectos de seguridad perimetral o preventa 2027.
                  </p>
                </div>

                {/* Segmented Selector: Empresa / Hogar */}
                <div
                  role="radiogroup"
                  aria-label="Tipo de proyecto"
                  className="grid grid-cols-2 gap-1.5 rounded-lg border border-slate-800 bg-[#070B10] p-1"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={segment === 'empresa'}
                    onClick={() => setSegment('empresa')}
                    className={`rounded-md py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      segment === 'empresa'
                        ? 'bg-[#28A9E0] text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Empresarial
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={segment === 'hogar'}
                    onClick={() => setSegment('hogar')}
                    className={`rounded-md py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      segment === 'hogar'
                        ? 'bg-[#28A9E0] text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hogar
                  </button>
                </div>

                <div>
                  <label htmlFor="blind-contact-name" className="mb-1.5 block text-xs text-slate-400">
                    Nombre completo
                  </label>
                  <input
                    id="blind-contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre o empresa"
                    autoComplete="name"
                    className="w-full rounded-lg border border-slate-800 bg-[#070B10] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-sky-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="blind-contact-email" className="mb-1.5 block text-xs text-slate-400">
                      Correo electrónico
                    </label>
                    <input
                      id="blind-contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@dominio.pe"
                      autoComplete="email"
                      className="w-full rounded-lg border border-slate-800 bg-[#070B10] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="blind-contact-phone" className="mb-1.5 block text-xs text-slate-400">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      id="blind-contact-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+51 999 000 000"
                      autoComplete="tel"
                      className="w-full rounded-lg border border-slate-800 bg-[#070B10] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="blind-contact-msg" className="mb-1.5 block text-xs text-slate-400">
                    Mensaje (opcional)
                  </label>
                  <textarea
                    id="blind-contact-msg"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Cuéntanos brevemente tu proyecto perimetral..."
                    className="w-full resize-none rounded-lg border border-slate-800 bg-[#070B10] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-sky-400 focus:outline-none"
                  />
                </div>

                {error && (
                  <p className="text-xs font-medium text-red-300" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#28A9E0] px-5 py-3 text-sm font-semibold text-slate-950 transition-colors duration-150 hover:bg-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 cursor-pointer"
                >
                  Enviar mensaje
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bottom Row: Official Launch Notice */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1360px] flex-col gap-2 border-t border-slate-800/80 pt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-6 text-xs sm:text-sm text-slate-400">
        <span>
          {remaining.isLaunched
            ? 'Estreno oficial disponible hoy · Seguridad perimetral empresarial y hogar'
            : 'Lanzamiento nacional · Seguridad perimetral empresarial y hogar · Domótica e IA'}
        </span>
        <span className="font-mono tabular-nums text-sky-300 shrink-0">
          www.blind.pe · 01 Ene 2027
        </span>
      </div>
    </main>
  );
};
