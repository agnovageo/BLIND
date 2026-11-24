import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export const EvaluationForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [segment, setSegment] = useState<'hogar' | 'empresa'>('empresa');
  const [perimeter, setPerimeter] = useState('100 - 300 metros');
  const [error, setError] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Ingresa tu nombre para agendar la evaluación.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    if (phone.trim().replace(/\D/g, '').length < 7) {
      setError('Ingresa un número de teléfono válido.');
      return;
    }

    setSubmittedRef(`EVL-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  return (
    <section
      id="evaluacion"
      aria-label="Solicitar evaluación perimetral gratuita"
      className="mx-auto max-w-[1280px] border-t border-slate-800/70 px-5 sm:px-8 py-20"
    >
      <div className="grid grid-cols-1 gap-10 rounded-2xl border border-slate-800/90 bg-[#0D141D] p-7 sm:p-12 lg:grid-cols-12 items-center">
        <div className="lg:col-span-6">
          <p className="text-xs font-medium text-sky-400">
            Levantamiento de plano perimetral sin costo
          </p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-semibold tracking-tight text-white text-balance">
            Diseñamos la cobertura exacta de sensores para tu propiedad
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Nuestro equipo de ingeniería analiza puntos ciegos, accesos vehiculares y compatibilidad
            domótica para entregarte un plano de despliegue y presupuesto cerrado en 24 horas.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-slate-800/80 pt-6 text-xs">
            <div>
              <dt className="text-slate-400">Atención directa</dt>
              <dd className="mt-1 font-mono text-sm text-white">proyectos@blindseguridad.com</dd>
            </div>
            <div>
              <dt className="text-slate-400">Tiempo de respuesta</dt>
              <dd className="mt-1 font-mono text-sm text-white">Menos de 2 horas hábiles</dd>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-6">
          {submittedRef ? (
            <div className="rounded-xl border border-sky-500/35 bg-[#080E16] p-7 text-center">
              <CheckCircle2 className="mx-auto h-9 w-9 text-sky-300" />
              <h3 className="mt-3 text-xl font-semibold text-white">
                Evaluación registrada · #{submittedRef}
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Gracias, {name}. Coordinaremos el estudio perimetral para tu inmueble{' '}
                {segment === 'empresa' ? 'empresarial' : 'residencial'} ({perimeter}).
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmittedRef(null);
                  setName('');
                  setEmail('');
                  setPhone('');
                }}
                className="mt-5 rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 hover:text-white cursor-pointer"
              >
                Registrar otra propiedad
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSegment('empresa')}
                  className={`rounded-lg border px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                    segment === 'empresa'
                      ? 'border-sky-400 bg-sky-500/15 text-white'
                      : 'border-slate-800 bg-[#080E16] text-slate-400 hover:text-white'
                  }`}
                >
                  Seguridad Empresarial
                </button>
                <button
                  type="button"
                  onClick={() => setSegment('hogar')}
                  className={`rounded-lg border px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                    segment === 'hogar'
                      ? 'border-sky-400 bg-sky-500/15 text-white'
                      : 'border-slate-800 bg-[#080E16] text-slate-400 hover:text-white'
                  }`}
                >
                  Residencia y Domótica
                </button>
              </div>

              <div>
                <label htmlFor="eval-name" className="block text-xs text-slate-400 mb-1.5">
                  Nombre o empresa
                </label>
                <input
                  id="eval-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Constructora Horizonte / Ana Torres"
                  className="w-full rounded-lg border border-slate-700/90 bg-[#080E16] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="eval-email" className="block text-xs text-slate-400 mb-1.5">
                    Correo corporativo o personal
                  </label>
                  <input
                    id="eval-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contacto@dominio.com"
                    className="w-full rounded-lg border border-slate-700/90 bg-[#080E16] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="eval-phone" className="block text-xs text-slate-400 mb-1.5">
                    Teléfono de contacto
                  </label>
                  <input
                    id="eval-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+51 987 654 321"
                    className="w-full rounded-lg border border-slate-700/90 bg-[#080E16] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="eval-perimeter" className="block text-xs text-slate-400 mb-1.5">
                  Extensión aproximada del perímetro
                </label>
                <select
                  id="eval-perimeter"
                  value={perimeter}
                  onChange={(e) => setPerimeter(e.target.value)}
                  className="w-full rounded-lg border border-slate-700/90 bg-[#080E16] px-4 py-2.5 text-sm text-white focus:border-sky-400 focus:outline-none"
                >
                  <option value="Menos de 100 metros">Menos de 100 metros (Residencia)</option>
                  <option value="100 - 300 metros">100 – 300 metros (Condominio / Sede)</option>
                  <option value="300 - 1,000 metros">300 – 1,000 metros (Planta industrial)</option>
                  <option value="Más de 1,000 metros">Más de 1,000 metros (Parque logístico)</option>
                </select>
              </div>

              {error && (
                <p className="text-xs font-medium text-red-300" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-[#28A9E0] px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-300 cursor-pointer"
              >
                Agendar evaluación perimetral
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
