import React from 'react';
import { CASE_STUDIES } from '../data/catalog';

export const DomoticsAndProof: React.FC = () => {
  return (
    <>
      {/* Section 1: Asymmetric Architecture & Early Warning Capabilities */}
      <section
        id="domotica"
        aria-label="Arquitectura de domótica y alerta temprana por inteligencia artificial"
        className="mx-auto max-w-[1280px] border-t border-slate-800/70 px-5 sm:px-8 py-20"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-sky-400">
            Ingeniería perimetral y automatización local
          </p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-semibold tracking-tight text-white text-balance">
            Alerta temprana antes del contacto, vinculada a la domótica de tu espacio
          </h2>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-xl border border-slate-800/90 bg-[#0D141D] p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">
                01. Detección previa a la intrusión en tres anillos
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Los sistemas tradicionales avisan cuando una puerta ya fue forzada. BlinD construye
                tres anillos concéntricos —cerco infrarrojo, radar volumétrico LiDAR y analítica
                térmica 4K— para identificar trayectorias sospechosas desde el perímetro exterior y
                actuar en menos de 180 milisegundos.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-800/80 pt-6">
              <div>
                <p className="font-mono text-2xl font-semibold text-sky-300 tabular-nums">
                  &lt; 180 ms
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Latencia de clasificación IA local en el borde
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-semibold text-white tabular-nums">
                  120 m
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Alcance térmico nocturno sin iluminación artificial
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-semibold text-white tabular-nums">
                  24 / 7
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Autonomía local con respaldo LTE/5G y batería de 12 h
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-xl border border-slate-800/90 bg-[#0D141D] p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">
                02. Respuesta domótica autónoma
              </h3>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Cada alerta verificada dispara escenas en protocolos KNX, Matter y relés industriales:
                iluminación perimetral progresiva, bloqueo electromagnético de portones, descenso de
                persianas y notificación directa a tu dispositivo o central privada.
              </p>
            </div>

            <div className="mt-6 border-t border-slate-800/80 pt-5 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Escena Modo Noche</span>
                <span className="font-medium text-white">Armado automático 22:00 – 06:00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Escena Disuasión</span>
                <span className="font-medium text-white">Reflectores + audio direccional</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Privacidad de video</span>
                <span className="font-medium text-white">Cifrado local AES-256 sin nube</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-xl border border-slate-800/90 bg-[#0D141D] p-7 sm:p-8">
            <h3 className="text-xl font-semibold text-white">
              03. Inmunidad climática y filtro de mascotas
            </h3>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Al cruzar la silueta térmica con el volumen tridimensional del LiDAR, BlinD ignora
              lluvia torrencial, ramas en movimiento, faros de vehículos externos y mascotas de hasta
              35 kg sin reducir la sensibilidad frente a intrusiones humanas.
            </p>
          </div>

          {/* Official Brand Certification Card featuring User's Official Color Logo */}
          <div className="lg:col-span-7 rounded-xl border border-slate-800/90 bg-[#0D141D] p-7 sm:p-8 flex flex-col sm:flex-row items-center gap-7">
            <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-xl bg-white p-4">
              <img
                src="/assets/aistudio/original_a75d392d.jpeg"
                alt="Logotipo oficial BlinD Seguridad Perimetral"
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-sky-400">
                Ingeniería certificada para residencias y plantas industriales
              </p>
              <h3 className="mt-1.5 text-xl font-semibold text-white">
                Diseño de arquitectura perimetral llave en mano
              </h3>
              <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                Cada proyecto BlinD comienza con el levantamiento topográfico de zonas ciegas,
                cálculo de ángulos ópticos e integración limpia con la arquitectura y la domótica
                existente del inmueble.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Proof & Case Studies (Adjacent to Claims) */}
      <section
        id="proyectos"
        aria-label="Resultados verificados en proyectos empresariales y residenciales"
        className="mx-auto max-w-[1280px] border-t border-slate-800/70 px-5 sm:px-8 py-20"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-sky-400">
            Resultados auditados en campo
          </p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-semibold tracking-tight text-white text-balance">
            Despliegues reales en parques logísticos y residencias de alto perfil
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {CASE_STUDIES.map((cs) => (
            <article
              key={cs.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800/90 bg-[#0D141D] p-7 sm:p-8"
            >
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800/80 pb-5">
                  <div>
                    <p className="font-display text-2xl sm:text-3xl font-semibold text-sky-300 tabular-nums">
                      {cs.metric}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{cs.timeframe}</p>
                  </div>
                  <span className="text-xs text-slate-400">{cs.sector}</span>
                </div>

                <blockquote className="mt-6 text-sm sm:text-base text-slate-200 leading-relaxed">
                  “{cs.quote}”
                </blockquote>

                <p className="mt-4 text-xs font-medium text-sky-300">{cs.outcome}</p>
              </div>

              <div className="mt-6 border-t border-slate-800/80 pt-4">
                <p className="text-sm font-semibold text-white">{cs.client}</p>
                <p className="text-xs text-slate-400">{cs.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
};
