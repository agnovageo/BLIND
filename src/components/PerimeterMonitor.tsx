import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  Crosshair,
  Eye,
  Lightbulb,
  Lock,
  Plus,
  Radar,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import {
  DeployedSensor,
  DeployableSensorType,
  SENSOR_METADATA,
  SITE_PRESETS,
} from '../data/catalog';

interface PerimeterMonitorProps {
  onAddProductToQuote: (productId: string) => void;
  pendingDeployType: DeployableSensorType | null;
  onClearPendingDeploy: () => void;
}

interface TelemetryEvent {
  id: string;
  time: string;
  kind: 'info' | 'deploy' | 'alert' | 'domotic';
  title: string;
  detail: string;
}

interface ActiveSimulation {
  running: boolean;
  pathIndex: number;
  x: number;
  y: number;
  entity: string;
  progress: number;
  detectedBy: string[];
  domoticsFired: boolean;
}

function formatClock(date = new Date()): string {
  return date.toLocaleTimeString('es-PE', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function normalizeAngle(deg: number): number {
  let a = deg % 360;
  if (a < -180) a += 360;
  if (a > 180) a -= 360;
  return a;
}

function isPointInSensor(px: number, py: number, sensor: DeployedSensor): boolean {
  if (!sensor.armed) return false;
  const dx = px - sensor.x;
  const dy = py - sensor.y;
  const dist = Math.hypot(dx, dy);
  if (dist > sensor.range) return false;
  if (sensor.fov >= 355) return true;

  const targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const diff = Math.abs(normalizeAngle(targetAngle - sensor.angle));
  return diff <= sensor.fov / 2;
}

function describeConePath(x: number, y: number, range: number, angleDeg: number, fovDeg: number): string {
  const half = fovDeg / 2;
  const startRad = ((angleDeg - half) * Math.PI) / 180;
  const endRad = ((angleDeg + half) * Math.PI) / 180;
  const x1 = x + range * Math.cos(startRad);
  const y1 = y + range * Math.sin(startRad);
  const x2 = x + range * Math.cos(endRad);
  const y2 = y + range * Math.sin(endRad);
  const largeArc = fovDeg > 180 ? 1 : 0;
  return `M ${x} ${y} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${range} ${range} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
}

function interpolatePath(waypoints: { x: number; y: number }[], t: number): { x: number; y: number } {
  if (waypoints.length < 2) return waypoints[0] ?? { x: 400, y: 240 };
  const segCount = waypoints.length - 1;
  const scaled = Math.max(0, Math.min(1, t)) * segCount;
  const idx = Math.min(Math.floor(scaled), segCount - 1);
  const localT = scaled - idx;
  const a = waypoints[idx];
  const b = waypoints[idx + 1];
  return {
    x: a.x + (b.x - a.x) * localT,
    y: a.y + (b.y - a.y) * localT,
  };
}

export const PerimeterMonitor: React.FC<PerimeterMonitorProps> = ({
  onAddProductToQuote,
  pendingDeployType,
  onClearPendingDeploy,
}) => {
  const [siteId, setSiteId] = useState<'residencial' | 'empresarial'>('residencial');
  const preset = SITE_PRESETS[siteId];

  const [sensors, setSensors] = useState<DeployedSensor[]>(SITE_PRESETS.residencial.initialSensors);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(
    SITE_PRESETS.residencial.initialSensors[0].id
  );
  const [deployModeType, setDeployModeType] = useState<DeployableSensorType | null>(null);
  const [showZones, setShowZones] = useState(true);
  const [showCoverage, setShowCoverage] = useState(true);

  const [domotics, setDomotics] = useState({
    reflectores: true,
    cierreAccesos: true,
    disuasionAcustica: true,
    filtroFauna: true,
  });

  const [simulation, setSimulation] = useState<ActiveSimulation>({
    running: false,
    pathIndex: 0,
    x: 0,
    y: 0,
    entity: '',
    progress: 0,
    detectedBy: [],
    domoticsFired: false,
  });

  const [events, setEvents] = useState<TelemetryEvent[]>([
    {
      id: 'init-1',
      time: formatClock(),
      kind: 'info',
      title: 'Perímetro residencial calibrado',
      detail: '5 nodos activos enlazados a la central neuronal BlinD Core.',
    },
  ]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const sensorsRef = useRef(sensors);
  sensorsRef.current = sensors;
  const domoticsRef = useRef(domotics);
  domoticsRef.current = domotics;
  const loggedSensorsRef = useRef<Set<string>>(new Set());
  const domoticLoggedRef = useRef(false);

  const pushEvent = (kind: TelemetryEvent['kind'], title: string, detail: string) => {
    setEvents((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: formatClock(),
        kind,
        title,
        detail,
      },
      ...prev.slice(0, 7),
    ]);
  };

  // Handle external "Probar en mapa" trigger from ProductCatalog
  useEffect(() => {
    if (pendingDeployType) {
      setDeployModeType(pendingDeployType);
      setSelectedSensorId(null);
      pushEvent(
        'info',
        `Modo despliegue: ${SENSOR_METADATA[pendingDeployType].shortName}`,
        'Haz clic sobre cualquier punto del plano para instalar el sensor en vivo.'
      );
      onClearPendingDeploy();
    }
  }, [pendingDeployType, onClearPendingDeploy]);

  // Switch between Residencia Inteligente and Planta Empresarial
  const handleSiteChange = (nextSite: 'residencial' | 'empresarial') => {
    setSiteId(nextSite);
    const nextPreset = SITE_PRESETS[nextSite];
    setSensors(nextPreset.initialSensors);
    setSelectedSensorId(nextPreset.initialSensors[0]?.id ?? null);
    setDeployModeType(null);
    setSimulation({
      running: false,
      pathIndex: 0,
      x: 0,
      y: 0,
      entity: '',
      progress: 0,
      detectedBy: [],
      domoticsFired: false,
    });
    pushEvent(
      'info',
      `Plano cargado: ${nextPreset.name}`,
      `${nextPreset.initialSensors.length} sensores desplegados en ${nextPreset.perimeterMeters} m de perímetro.`
    );
  };

  // Run real-time intrusion simulation loop
  useEffect(() => {
    if (!simulation.running) return;

    const activePath = preset.intrusionPaths[simulation.pathIndex % preset.intrusionPaths.length];
    const startTime = performance.now();
    const durationMs = 6800;
    let rafId = 0;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / durationMs, 1);
      const pos = interpolatePath(activePath.waypoints, t);

      const currentSensors = sensorsRef.current;
      const detecting = currentSensors
        .filter((sensor) => isPointInSensor(pos.x, pos.y, sensor))
        .map((sensor) => sensor.id);

      detecting.forEach((sensorId) => {
        if (!loggedSensorsRef.current.has(sensorId)) {
          loggedSensorsRef.current.add(sensorId);
          const s = currentSensors.find((item) => item.id === sensorId);
          if (s) {
            pushEvent(
              'alert',
              `Alerta temprana · ${s.label}`,
              `${activePath.entity} detectado a 160 ms · Confianza IA 99.1%`
            );
          }
        }
      });

      let fired = domoticLoggedRef.current;
      if (detecting.length > 0 && !domoticLoggedRef.current) {
        domoticLoggedRef.current = true;
        fired = true;
        const activeActions: string[] = [];
        if (domoticsRef.current.reflectores) activeActions.push('reflectores perimetrales al 100%');
        if (domoticsRef.current.cierreAccesos) activeActions.push('bloqueo electromagnético de accesos');
        if (domoticsRef.current.disuasionAcustica) activeActions.push('disuasión acústica direccional');

        if (activeActions.length > 0) {
          pushEvent(
            'domotic',
            'Respuesta domótica autónoma ejecutada',
            `Activado: ${activeActions.join(', ')}.`
          );
        }
      }

      setSimulation((prev) => ({
        ...prev,
        x: pos.x,
        y: pos.y,
        progress: t,
        detectedBy: detecting,
        domoticsFired: fired || prev.domoticsFired,
        running: t < 1,
      }));

      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        pushEvent(
          'info',
          'Simulación finalizada',
          detecting.length > 0 || domoticLoggedRef.current
            ? 'Intrusión contenida antes del contacto con la edificación.'
            : 'Objetivo fuera de cobertura. Despliega un sensor en esa zona para blindarla.'
        );
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [simulation.running, simulation.pathIndex, preset.intrusionPaths]);

  const startSimulation = () => {
    loggedSensorsRef.current = new Set();
    domoticLoggedRef.current = false;
    const nextPathIndex = (simulation.pathIndex + 1) % preset.intrusionPaths.length;
    const chosenPath = preset.intrusionPaths[nextPathIndex];
    const startPt = chosenPath.waypoints[0];
    setDeployModeType(null);
    pushEvent(
      'info',
      `Simulación iniciada: ${chosenPath.label}`,
      `Evaluando respuesta de ${sensors.filter((s) => s.armed).length} sensores armados.`
    );
    setSimulation({
      running: true,
      pathIndex: nextPathIndex,
      x: startPt.x,
      y: startPt.y,
      entity: chosenPath.entity,
      progress: 0,
      detectedBy: [],
      domoticsFired: false,
    });
  };

  const stopSimulation = () => {
    setSimulation((prev) => ({
      ...prev,
      running: false,
      detectedBy: [],
      domoticsFired: false,
    }));
  };

  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!deployModeType || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * 800);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * 480);

    const meta = SENSOR_METADATA[deployModeType];
    const count = sensors.filter((s) => s.type === deployModeType).length + 1;
    const prefix =
      deployModeType === 'ptz_thermal'
        ? 'PTZ'
        : deployModeType === 'lidar_360'
        ? 'LDR'
        : deployModeType === 'infrared_bar'
        ? 'BAR'
        : 'HUB';

    // Aim inward/outward gracefully toward center of property
    const aimAngle = Math.round((Math.atan2(240 - y, 400 - x) * 180) / Math.PI);

    const newSensor: DeployedSensor = {
      id: `custom-${Date.now()}`,
      productId: meta.productId,
      label: `${prefix}-0${count} Personalizado`,
      type: deployModeType,
      x: Math.max(40, Math.min(760, x)),
      y: Math.max(36, Math.min(444, y)),
      angle: aimAngle,
      fov: meta.defaultFov,
      range: meta.defaultRange,
      zoneId: preset.zones[0].id,
      armed: true,
      custom: true,
    };

    setSensors((prev) => [...prev, newSensor]);
    setSelectedSensorId(newSensor.id);
    setDeployModeType(null);
    pushEvent(
      'deploy',
      `Sensor desplegado: ${newSensor.label}`,
      `${meta.name} instalado en coordenadas (${newSensor.x}, ${newSensor.y}).`
    );
  };

  const selectedSensor = useMemo(
    () => sensors.find((s) => s.id === selectedSensorId) ?? null,
    [sensors, selectedSensorId]
  );

  const updateSelectedSensor = (patch: Partial<DeployedSensor>) => {
    if (!selectedSensorId) return;
    setSensors((prev) =>
      prev.map((sensor) => (sensor.id === selectedSensorId ? { ...sensor, ...patch } : sensor))
    );
  };

  const removeSelectedSensor = () => {
    if (!selectedSensorId) return;
    const target = sensors.find((s) => s.id === selectedSensorId);
    setSensors((prev) => prev.filter((s) => s.id !== selectedSensorId));
    setSelectedSensorId(null);
    if (target) {
      pushEvent('info', `Nodo retirado: ${target.label}`, 'Mapa de cobertura recalculado.');
    }
  };

  const resetMap = () => {
    setSensors(preset.initialSensors);
    setSelectedSensorId(preset.initialSensors[0]?.id ?? null);
    setDeployModeType(null);
    stopSimulation();
    pushEvent('info', 'Plano restablecido', `Configuración base de ${preset.name} restaurada.`);
  };

  const armedCount = sensors.filter((s) => s.armed).length;
  const activeAlertCount = simulation.detectedBy.length;
  const isFloodlightOn = simulation.domoticsFired && domotics.reflectores;
  const isGateLocked = simulation.domoticsFired && domotics.cierreAccesos;

  const estimatedCoveragePct = Math.min(
    99,
    Math.round(
      sensors.reduce((acc, s) => {
        if (!s.armed) return acc;
        const areaFactor = s.fov >= 355 ? 20 : s.fov > 45 ? 18 : 14;
        return acc + areaFactor * (s.range / 150);
      }, 0)
    )
  );

  return (
    <section
      id="monitor"
      aria-label="Mapa interactivo de despliegue de sensores y zonas de monitoreo"
      className="mx-auto max-w-[1280px] px-5 sm:px-8 pt-6 pb-20"
    >
      {/* Interactive Module Toolbar */}
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-800/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium text-sky-400">
            Despliegue interactivo en tiempo real · {preset.areaSqm} · {preset.perimeterMeters} m de perímetro
          </p>
          <h2 className="mt-1.5 text-2xl sm:text-3xl font-semibold tracking-tight text-white text-balance">
            Simulador de sensores y zonas de monitoreo perimetral
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Site Preset Segmented Control */}
          <div
            role="tablist"
            aria-label="Tipo de inmueble"
            className="inline-flex items-center rounded-lg border border-slate-800 bg-[#0D141D] p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={siteId === 'residencial'}
              onClick={() => handleSiteChange('residencial')}
              className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                siteId === 'residencial'
                  ? 'bg-[#28A9E0] text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Residencia Inteligente
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={siteId === 'empresarial'}
              onClick={() => handleSiteChange('empresarial')}
              className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                siteId === 'empresarial'
                  ? 'bg-[#28A9E0] text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Planta Empresarial
            </button>
          </div>

          <button
            type="button"
            onClick={simulation.running ? stopSimulation : startSimulation}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              simulation.running
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-white text-slate-950 hover:bg-sky-100'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>{simulation.running ? 'Detener simulación' : 'Simular alerta temprana'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDeployModeType((prev) => (prev ? null : 'ptz_thermal'));
              setSelectedSensorId(null);
            }}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              deployModeType
                ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                : 'border-slate-700 bg-[#0D141D] text-slate-200 hover:border-slate-500 hover:text-white'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>{deployModeType ? 'Cancelar despliegue' : 'Desplegar sensor'}</span>
          </button>

          <button
            type="button"
            onClick={resetMap}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0D141D] px-3.5 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
            title="Restablecer sensores predeterminados"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>

      {/* Main Tactical Blueprint + Inspector Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Left/Center: Live Architectural Blueprint Canvas (8 columns) */}
        <div className="lg:col-span-8 flex flex-col overflow-hidden rounded-xl border border-slate-800/90 bg-[#0A1018]">
          {/* Top bar of the canvas */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-5 py-3.5 text-xs">
            <div className="flex flex-wrap items-center gap-3 text-slate-300">
              <span className="font-semibold text-white">{preset.name}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-mono tabular-nums text-sky-300">
                {armedCount}/{sensors.length} sensores armados
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-mono tabular-nums text-slate-300">
                Cobertura {estimatedCoveragePct}%
              </span>
            </div>

            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showZones}
                  onChange={(e) => setShowZones(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 accent-[#28A9E0]"
                />
                <span>Zonas</span>
              </label>
              <label className="inline-flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showCoverage}
                  onChange={(e) => setShowCoverage(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 accent-[#28A9E0]"
                />
                <span>Haces y radar</span>
              </label>
            </div>
          </div>

          {/* Contextual Alert or Placement Banner inside Canvas */}
          {deployModeType && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-500/30 bg-sky-500/10 px-5 py-2.5 text-xs text-sky-100">
              <div className="flex items-center gap-2">
                <Crosshair className="h-4 w-4 text-sky-300 shrink-0" />
                <span>
                  Haz clic sobre el plano para instalar:{' '}
                  <strong className="font-semibold text-white">
                    {SENSOR_METADATA[deployModeType].name}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {(Object.keys(SENSOR_METADATA) as DeployableSensorType[]).map((typeKey) => (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => setDeployModeType(typeKey)}
                    className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      deployModeType === typeKey
                        ? 'bg-[#28A9E0] text-slate-950 font-semibold'
                        : 'bg-slate-900/80 text-slate-300 hover:text-white'
                    }`}
                  >
                    {SENSOR_METADATA[typeKey].shortName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeAlertCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-500/40 bg-red-500/12 px-5 py-2.5 text-xs text-red-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
                <span>
                  <strong className="font-semibold text-white">Alerta temprana activa:</strong>{' '}
                  {simulation.entity} en cobertura de {activeAlertCount}{' '}
                  {activeAlertCount === 1 ? 'sensor' : 'sensores'}
                </span>
              </div>
              <span className="font-mono tabular-nums text-red-200">
                {isFloodlightOn ? 'Reflectores ON' : 'Solo registro'}
                {isGateLocked ? ' · Accesos bloqueados' : ''}
              </span>
            </div>
          )}

          {/* Interactive SVG Architectural Blueprint */}
          <div className="blueprint-grid relative flex-1 min-h-[380px] sm:min-h-[460px] flex items-center justify-center p-3 sm:p-4">
            <svg
              ref={svgRef}
              viewBox="0 0 800 480"
              onClick={handleCanvasClick}
              className={`h-full w-full max-h-[500px] select-none ${
                deployModeType ? 'cursor-crosshair' : 'cursor-default'
              }`}
              role="img"
              aria-label={`Plano interactivo de seguridad perimetral para ${preset.name}`}
            >
              <defs>
                <radialGradient id="floodlight-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="lidar-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.24" />
                  <stop offset="85%" stopColor="#28A9E0" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#28A9E0" stopOpacity="0.02" />
                </radialGradient>
                <radialGradient id="lidar-alert-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.34" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05" />
                </radialGradient>
              </defs>

              {/* Outer Property Boundary Wall */}
              <rect
                x="48"
                y="40"
                width="704"
                height="400"
                rx="6"
                fill="#0A111A"
                fillOpacity="0.65"
                stroke="#334E68"
                strokeWidth="2.5"
              />

              {/* Monitoring Zone Polygons */}
              {showZones &&
                preset.zones.map((zone) => {
                  const zoneHasAlert = sensors.some(
                    (s) => s.zoneId === zone.id && simulation.detectedBy.includes(s.id)
                  );
                  const fillColor = zoneHasAlert
                    ? 'rgba(239, 68, 68, 0.14)'
                    : zone.tier === 'exterior'
                    ? 'rgba(40, 169, 224, 0.055)'
                    : zone.tier === 'acceso'
                    ? 'rgba(56, 189, 248, 0.085)'
                    : 'rgba(148, 163, 184, 0.05)';
                  const strokeColor = zoneHasAlert
                    ? 'rgba(248, 113, 113, 0.65)'
                    : 'rgba(56, 189, 248, 0.22)';

                  return (
                    <g key={zone.id}>
                      <polygon
                        points={zone.points}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={zoneHasAlert ? '1.8' : '1'}
                        strokeDasharray={zone.tier === 'exterior' ? '5 4' : undefined}
                      />
                      <text
                        x={zone.labelX}
                        y={zone.labelY}
                        textAnchor="middle"
                        fill={zoneHasAlert ? '#FCA5A5' : '#647F99'}
                        fontSize="11"
                        fontWeight="600"
                        letterSpacing="0.04em"
                      >
                        {zone.name}
                      </text>
                    </g>
                  );
                })}

              {/* Architectural Footprint Details */}
              {siteId === 'residencial' ? (
                <g stroke="#486581" strokeWidth="1.6" fill="none">
                  {/* Main house structure */}
                  <rect x="235" y="145" width="330" height="230" fill="#101B27" fillOpacity="0.82" />
                  {/* Interior rooms */}
                  <line x1="235" y1="255" x2="430" y2="255" strokeOpacity="0.55" />
                  <line x1="430" y1="145" x2="430" y2="375" strokeOpacity="0.55" />
                  <line x1="430" y1="275" x2="565" y2="275" strokeOpacity="0.55" />
                  {/* Pool in terrace */}
                  <rect
                    x="622"
                    y="272"
                    width="82"
                    height="96"
                    rx="4"
                    fill="#0C2A3E"
                    fillOpacity="0.6"
                    stroke="#28A9E0"
                    strokeOpacity="0.4"
                  />
                  {/* Driveway path */}
                  <rect
                    x="74"
                    y="165"
                    width="124"
                    height="196"
                    stroke="#334E68"
                    strokeDasharray="4 4"
                    strokeOpacity="0.7"
                  />
                  {/* Main Motorized Access Gate on West wall */}
                  <line
                    x1="48"
                    y1="230"
                    x2="48"
                    y2="340"
                    stroke={isGateLocked ? '#EF4444' : '#38BDF8'}
                    strokeWidth="5"
                  />
                  <text
                    x="62"
                    y="289"
                    fill={isGateLocked ? '#FCA5A5' : '#94A8BC'}
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                    stroke="none"
                  >
                    {isGateLocked ? 'PORTÓN BLOQUEADO' : 'PORTÓN PRINCIPAL'}
                  </text>
                </g>
              ) : (
                <g stroke="#486581" strokeWidth="1.6" fill="none">
                  {/* Main Logistics Hall */}
                  <rect x="266" y="144" width="308" height="276" fill="#101B27" fillOpacity="0.82" />
                  {/* Warehouse bays */}
                  <line x1="266" y1="236" x2="574" y2="236" strokeOpacity="0.45" />
                  <line x1="266" y1="328" x2="574" y2="328" strokeOpacity="0.45" />
                  {/* Data center / Vault */}
                  <rect
                    x="592"
                    y="144"
                    width="160"
                    height="276"
                    fill="#0E1A29"
                    fillOpacity="0.9"
                    stroke="#28A9E0"
                    strokeOpacity="0.45"
                  />
                  {/* Loading dock slots */}
                  <rect x="232" y="176" width="34" height="44" fill="#162436" strokeOpacity="0.75" />
                  <rect x="232" y="246" width="34" height="44" fill="#162436" strokeOpacity="0.75" />
                  <rect x="232" y="316" width="34" height="44" fill="#162436" strokeOpacity="0.75" />
                  {/* Security Gatehouse */}
                  <line
                    x1="48"
                    y1="224"
                    x2="48"
                    y2="348"
                    stroke={isGateLocked ? '#EF4444' : '#38BDF8'}
                    strokeWidth="5"
                  />
                  <text
                    x="62"
                    y="290"
                    fill={isGateLocked ? '#FCA5A5' : '#94A8BC'}
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                    stroke="none"
                  >
                    {isGateLocked ? 'GARITA CERRADA' : 'ACCESO LOGÍSTICO'}
                  </text>
                </g>
              )}

              {/* Domotics Perimeter Floodlights (illuminate when alert triggers and reflectores enabled) */}
              {isFloodlightOn && (
                <g pointerEvents="none">
                  <circle cx="72" cy="64" r="96" fill="url(#floodlight-glow)" />
                  <circle cx="728" cy="64" r="96" fill="url(#floodlight-glow)" />
                  <circle cx="72" cy="416" r="96" fill="url(#floodlight-glow)" />
                  <circle cx="728" cy="416" r="96" fill="url(#floodlight-glow)" />
                </g>
              )}

              {/* Sensor Coverage Cones / LiDAR Rings */}
              {showCoverage &&
                sensors.map((sensor) => {
                  if (!sensor.armed) return null;
                  const isTriggered = simulation.detectedBy.includes(sensor.id);
                  const isSelected = selectedSensorId === sensor.id;

                  if (sensor.fov >= 355) {
                    return (
                      <g key={`cov-${sensor.id}`} pointerEvents="none">
                        <circle
                          cx={sensor.x}
                          cy={sensor.y}
                          r={sensor.range}
                          fill={isTriggered ? 'url(#lidar-alert-grad)' : 'url(#lidar-grad)'}
                          stroke={isTriggered ? '#EF4444' : isSelected ? '#7DD3FC' : '#28A9E0'}
                          strokeWidth={isSelected || isTriggered ? '1.6' : '1'}
                          strokeOpacity={isSelected || isTriggered ? '0.85' : '0.42'}
                          strokeDasharray={sensor.type === 'domotic_lock' ? '3 4' : undefined}
                        />
                        {isTriggered && domotics.disuasionAcustica && (
                          <circle
                            cx={sensor.x}
                            cy={sensor.y}
                            r={sensor.range * 0.62}
                            fill="none"
                            stroke="#F59E0B"
                            strokeWidth="1.5"
                            strokeDasharray="6 6"
                          />
                        )}
                      </g>
                    );
                  }

                  const conePath = describeConePath(
                    sensor.x,
                    sensor.y,
                    sensor.range,
                    sensor.angle,
                    sensor.fov
                  );

                  return (
                    <path
                      key={`cov-${sensor.id}`}
                      d={conePath}
                      pointerEvents="none"
                      fill={
                        isTriggered
                          ? 'rgba(239, 68, 68, 0.24)'
                          : sensor.type === 'infrared_bar'
                          ? 'rgba(96, 165, 250, 0.22)'
                          : 'rgba(40, 169, 224, 0.16)'
                      }
                      stroke={isTriggered ? '#F87171' : isSelected ? '#BAE6FD' : '#38BDF8'}
                      strokeWidth={isSelected || isTriggered ? '1.6' : '1'}
                      strokeOpacity={isSelected || isTriggered ? '0.9' : '0.45'}
                    />
                  );
                })}

              {/* Sensor Interactive Nodes */}
              {sensors.map((sensor) => {
                const isSelected = selectedSensorId === sensor.id;
                const isTriggered = simulation.detectedBy.includes(sensor.id);
                const nodeStroke = !sensor.armed
                  ? '#64748B'
                  : isTriggered
                  ? '#EF4444'
                  : isSelected
                  ? '#FFFFFF'
                  : '#38BDF8';
                const nodeFill = !sensor.armed
                  ? '#1E293B'
                  : isTriggered
                  ? '#7F1D1D'
                  : '#0A2538';

                return (
                  <g
                    key={sensor.id}
                    transform={`translate(${sensor.x}, ${sensor.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSensorId(sensor.id);
                      setDeployModeType(null);
                    }}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <circle
                        r="18"
                        fill="none"
                        stroke="#7DD3FC"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}
                    <circle r="12" fill={nodeFill} stroke={nodeStroke} strokeWidth="2.2" />
                    <circle
                      r="4"
                      fill={!sensor.armed ? '#64748B' : isTriggered ? '#FCA5A5' : '#7DD3FC'}
                    />
                    <text
                      y="-17"
                      textAnchor="middle"
                      fill={isTriggered ? '#FCA5A5' : isSelected ? '#FFFFFF' : '#CBD5E1'}
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight={isSelected || isTriggered ? '600' : '500'}
                    >
                      {sensor.label.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              {/* Simulated Moving Intrusion Signature */}
              {(simulation.running || simulation.detectedBy.length > 0) && simulation.progress > 0 && (
                <g transform={`translate(${simulation.x}, ${simulation.y})`} pointerEvents="none">
                  <circle
                    r="16"
                    fill={simulation.detectedBy.length > 0 ? 'rgba(239,68,68,0.22)' : 'rgba(245,158,11,0.2)'}
                    stroke={simulation.detectedBy.length > 0 ? '#EF4444' : '#F59E0B'}
                    strokeWidth="1.6"
                  />
                  <circle
                    r="5.5"
                    fill={simulation.detectedBy.length > 0 ? '#EF4444' : '#F59E0B'}
                  />
                  <rect
                    x="14"
                    y="-22"
                    width="148"
                    height="22"
                    rx="4"
                    fill="#070B10"
                    fillOpacity="0.92"
                    stroke={simulation.detectedBy.length > 0 ? '#EF4444' : '#F59E0B'}
                    strokeWidth="1"
                  />
                  <text
                    x="22"
                    y="-8"
                    fill="#F8FAFC"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {simulation.detectedBy.length > 0 ? 'IA: ALERTA TEMPRANA' : 'OBJETIVO EN RUTA'}
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Bottom Legend Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 px-5 py-3 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-4">
              <span>PTZ: Cámara 4K Térmica IA</span>
              <span aria-hidden="true">·</span>
              <span>LDR: Radar LiDAR 360°</span>
              <span aria-hidden="true">·</span>
              <span>BAR: Barrera Infrarroja</span>
              <span aria-hidden="true">·</span>
              <span>HUB: Central Domótica</span>
            </div>
            <span className="text-slate-500">Haz clic en cualquier nodo para calibrar su ángulo y alcance</span>
          </div>
        </div>

        {/* Right Column: Inspector, Domotics & Live Telemetry Feed (4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Panel 1: Selected Sensor Inspector OR Deployment Picker */}
          <div className="rounded-xl border border-slate-800/90 bg-[#0D141D] p-5">
            {selectedSensor ? (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-sky-400">
                      {SENSOR_METADATA[selectedSensor.type].name}
                    </p>
                    <h3 className="mt-0.5 text-base font-semibold text-white">
                      {selectedSensor.label}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSelectedSensor({ armed: !selectedSensor.armed })}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedSensor.armed
                        ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {selectedSensor.armed ? 'Armado' : 'En espera'}
                  </button>
                </div>

                {/* Live Calibration Sliders */}
                <div className="mt-4 space-y-3.5 border-t border-slate-800 pt-4">
                  {selectedSensor.fov < 355 && (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-400 inline-flex items-center gap-1.5">
                          <Sliders className="h-3.5 w-3.5 text-sky-400" />
                          Orientación angular
                        </span>
                        <span className="font-mono tabular-nums text-slate-200">
                          {Math.round(selectedSensor.angle)}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        value={selectedSensor.angle}
                        onChange={(e) => updateSelectedSensor({ angle: Number(e.target.value) })}
                        className="w-full accent-[#28A9E0] cursor-pointer"
                        aria-label="Orientación angular del sensor"
                      />
                    </div>
                  )}

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-400 inline-flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-sky-400" />
                        Alcance de detección
                      </span>
                      <span className="font-mono tabular-nums text-slate-200">
                        {Math.round(selectedSensor.range * 0.18)} m
                      </span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={280}
                      value={selectedSensor.range}
                      onChange={(e) => updateSelectedSensor({ range: Number(e.target.value) })}
                      className="w-full accent-[#28A9E0] cursor-pointer"
                      aria-label="Alcance de detección del sensor"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => onAddProductToQuote(selectedSensor.productId)}
                    className="flex-1 rounded-lg bg-[#28A9E0] px-3.5 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-sky-300 whitespace-nowrap cursor-pointer"
                  >
                    Cotizar equipo (${SENSOR_METADATA[selectedSensor.type].unitPrice.toLocaleString()})
                  </button>
                  {selectedSensor.custom && (
                    <button
                      type="button"
                      onClick={removeSelectedSensor}
                      aria-label="Retirar sensor personalizado"
                      className="rounded-lg border border-slate-700 p-2 text-slate-400 transition-colors hover:border-red-500/50 hover:text-red-300 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Seleccionar sensor a desplegar</h3>
                  {deployModeType && (
                    <button
                      type="button"
                      onClick={() => setDeployModeType(null)}
                      aria-label="Salir de modo despliegue"
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Elige un dispositivo y haz clic sobre el plano para evaluar su cobertura real.
                </p>
                <div className="mt-3.5 grid grid-cols-2 gap-2">
                  {(
                    [
                      { key: 'ptz_thermal', icon: Camera },
                      { key: 'lidar_360', icon: Radar },
                      { key: 'infrared_bar', icon: ShieldCheck },
                      { key: 'domotic_lock', icon: Lock },
                    ] as const
                  ).map(({ key, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDeployModeType(key)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer ${
                        deployModeType === key
                          ? 'border-sky-400 bg-sky-500/15 text-white'
                          : 'border-slate-800 bg-[#080E16] text-slate-300 hover:border-slate-600 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 text-sky-400 shrink-0" />
                      <span className="truncate">{SENSOR_METADATA[key].shortName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel 2: Domótica Automated Countermeasures */}
          <div className="rounded-xl border border-slate-800/90 bg-[#0D141D] p-5">
            <h3 className="text-sm font-semibold text-white">Respuesta domótica automática</h3>
            <p className="mt-1 text-xs text-slate-400">
              Reglas locales ejecutadas por BlinD Core al confirmar una alerta temprana.
            </p>
            <div className="mt-3.5 divide-y divide-slate-800/80">
              {(
                [
                  {
                    key: 'reflectores',
                    label: 'Reflectores LED perimetrales',
                    desc: 'Iluminación disuasiva inmediata en los 4 vértices',
                    icon: Lightbulb,
                  },
                  {
                    key: 'cierreAccesos',
                    label: 'Bloqueo de portones y accesos',
                    desc: 'Enclavamiento electromagnético automático',
                    icon: Lock,
                  },
                  {
                    key: 'disuasionAcustica',
                    label: 'Disuasión acústica direccional',
                    desc: 'Aviso vocal focalizado en zona detectada',
                    icon: Volume2,
                  },
                ] as const
              ).map(({ key, label, desc, icon: Icon }) => {
                const enabled = domotics[key];
                return (
                  <div key={key} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${enabled ? 'text-sky-400' : 'text-slate-500'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-100 truncate">{label}</p>
                        <p className="text-[11px] text-slate-400 truncate">{desc}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={label}
                      onClick={() => setDomotics((prev) => ({ ...prev, [key]: !prev[key] }))}
                      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors cursor-pointer ${
                        enabled ? 'bg-[#28A9E0]' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                          enabled ? 'translate-x-4.5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel 3: Real-Time Event Log */}
          <div className="flex-1 rounded-xl border border-slate-800/90 bg-[#0D141D] p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Registro en tiempo real</h3>
              <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                {events.length} eventos
              </span>
            </div>
            <ul className="mt-3 space-y-2.5 max-h-[188px] overflow-y-auto pr-1">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="border-b border-slate-800/70 pb-2.5 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span
                      className={`font-semibold ${
                        ev.kind === 'alert'
                          ? 'text-red-300'
                          : ev.kind === 'domotic'
                          ? 'text-amber-300'
                          : ev.kind === 'deploy'
                          ? 'text-sky-300'
                          : 'text-slate-200'
                      }`}
                    >
                      {ev.title}
                    </span>
                    <span className="font-mono text-slate-500 tabular-nums shrink-0">
                      {ev.time}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400 leading-snug">{ev.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
