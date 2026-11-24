export type ProductCategory = 'camaras' | 'sensores' | 'domotica' | 'kits';

export type DeployableSensorType = 'ptz_thermal' | 'lidar_360' | 'infrared_bar' | 'domotic_lock';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  tagline: string;
  description: string;
  priceUsd: number;
  image: string;
  deployType?: DeployableSensorType;
  specs: {
    alcance: string;
    deteccion: string;
    proteccion: string;
    integracion: string;
  };
  highlights: string[];
}

export interface MonitoringZone {
  id: string;
  name: string;
  tier: 'exterior' | 'acceso' | 'interior';
  tierLabel: string;
  points: string;
  labelX: number;
  labelY: number;
  description: string;
}

export interface DeployedSensor {
  id: string;
  productId: string;
  label: string;
  type: DeployableSensorType;
  x: number; // 0..800 SVG coordinate
  y: number; // 0..480 SVG coordinate
  angle: number; // degrees (0 = right, 90 = down)
  fov: number; // degrees (360 for omnidirectional lidar)
  range: number; // SVG units (1 unit ~= 0.15m)
  zoneId: string;
  armed: boolean;
  custom?: boolean;
}

export interface SitePreset {
  id: 'residencial' | 'empresarial';
  name: string;
  subtitle: string;
  areaSqm: string;
  perimeterMeters: number;
  zones: MonitoringZone[];
  initialSensors: DeployedSensor[];
  intrusionPaths: {
    label: string;
    entity: 'Persona no autorizada' | 'Vehículo sin registro';
    waypoints: { x: number; y: number }[];
  }[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'blind-apex-ptz',
    name: 'BlinD Apex 4K Thermal PTZ',
    category: 'camaras',
    categoryLabel: 'Cámaras IA',
    tagline: 'Óptica dual 4K y espectro térmico con radar Doppler integrado.',
    description:
      'Cámara motorizada de grado perimetral diseñada para identificar personas y vehículos a 120 metros en oscuridad absoluta, niebla densa o lluvia intensa. Su procesador neuronal integrado discrimina fauna local y follaje en menos de 140 milisegundos.',
    priceUsd: 1890,
    image: '/src/assets/images/blind_camera_ptz_thermal_1795541319196.jpg',
    deployType: 'ptz_thermal',
    specs: {
      alcance: 'Hasta 120 m térmico / 90 m óptico',
      deteccion: 'IA en borde: humano, vehículo, merodeo',
      proteccion: 'IP67 / IK10 aluminio anodizado',
      integracion: 'PoE++ / KNX / HomeKit / ONVIF S',
    },
    highlights: [
      'Seguimiento automático motorizado con zoom óptico 25x',
      'Fusión térmica + visión nocturna a color en 0.0005 lux',
      'Disparo directo de escenas domóticas de iluminación y cierre',
    ],
  },
  {
    id: 'blind-sentinel-lidar',
    name: 'BlinD Sentinel LiDAR 360',
    category: 'sensores',
    categoryLabel: 'Sensores de Movimiento',
    tagline: 'Escaneo volumétrico láser 360° con mapa de profundidad milimétrico.',
    description:
      'Sensor perimetral de estado sólido que construye una nube de puntos en tiempo real alrededor de jardines, azoteas o patios logísticos. Define cercos virtuales tridimensionales inmunes a sombras, luces de vehículos y clima extremo.',
    priceUsd: 1240,
    image: '/src/assets/images/blind_sensor_lidar_360_1795541319948.jpg',
    deployType: 'lidar_360',
    specs: {
      alcance: 'Radio 30 m (60 m diámetro 360°)',
      deteccion: 'Volumétrica 3D ±2 cm de precisión',
      proteccion: 'IP67 cristal óptico calefactado',
      integracion: 'PoE / RS-485 / API tiempo real',
    },
    highlights: [
      'Clasificación de altura y velocidad para cero falsas alarmas por mascotas',
      'Zonas de exclusión configurables directamente desde el plano',
      'Operación continua 24/7 sin requerir iluminación ambiental',
    ],
  },
  {
    id: 'blind-horizon-bar',
    name: 'BlinD Horizon Dual-Beam',
    category: 'sensores',
    categoryLabel: 'Sensores de Movimiento',
    tagline: 'Barrera perimetral arquitectónica infrarroja y microondas.',
    description:
      'Columnas minimalistas en aluminio grafito que crean una cortina invisible de 8 haces cruzados a lo largo de muros, portones y linderos. Detecta intentos de escalamiento o cruce antes de que exista contacto físico con la propiedad.',
    priceUsd: 860,
    image: '/src/assets/images/blind_barrier_infrared_1795541318935.jpg',
    deployType: 'infrared_bar',
    specs: {
      alcance: 'Hasta 100 m entre columnas',
      deteccion: '8 haces IR + radar microondas 24 GHz',
      proteccion: 'IP66 aluminio extruido anti-sabotaje',
      integracion: 'Bus cifrado AES-256 / Domótica BlinD',
    },
    highlights: [
      'Alineación láser asistida para instalación limpia en fachadas',
      'Sensor antisabotaje térmico y de inclinación integrado',
      'Autocalibración ambiental ante niebla o polvo industrial',
    ],
  },
  {
    id: 'blind-core-hub',
    name: 'BlinD Core Domotic Hub',
    category: 'domotica',
    categoryLabel: 'Domótica',
    tagline: 'Central neuronal local de alerta temprana y automatización de accesos.',
    description:
      'El cerebro local de tu seguridad perimetral. Procesa flujos de hasta 32 sensores y cámaras sin depender de la nube, ejecutando respuestas domóticas instantáneas: encendido progresivo de reflectores, cierre electromagnético de portones y alertas cifradas.',
    priceUsd: 1450,
    image: '/src/assets/images/blind_domotic_ai_hub_1795541318427.jpg',
    deployType: 'domotic_lock',
    specs: {
      alcance: 'Hasta 32 cámaras IA y 64 nodos domóticos',
      deteccion: 'Motor NPU local 40 TOPS (<120 ms)',
      proteccion: 'Chasis CNC disipación pasiva silenciosa',
      integracion: 'Matter / KNX / Zigbee 3.0 / Dual LTE-5G',
    },
    highlights: [
      'Respaldo energético interno de 12 horas y enlace celular dual',
      'Escenas automáticas: Modo Noche, Ausencia y Disuasión Activa',
      'Almacenamiento cifrado NVMe de 8 TB sin cuotas mensuales obligatorias',
    ],
  },
  {
    id: 'blind-dome-micro',
    name: 'BlinD Dome Micro-AI',
    category: 'camaras',
    categoryLabel: 'Cámaras IA',
    tagline: 'Domo arquitectónico IK10 con analítica de accesos y audio disuasivo.',
    description:
      'Diseñada para integrarse discretamente en pórticos, galerías y accesos corporativos. Combina sensor 4K gran angular, radar de proximidad oculto y micrófono direccional para detectar merodeo prolongado o intentos de forzado.',
    priceUsd: 780,
    image: '/src/assets/images/blind_dome_micro_ai_1795541318846.jpg',
    deployType: 'ptz_thermal',
    specs: {
      alcance: '35 m angular 128° + radar 18 m',
      deteccion: 'Rostro autorizado, merodeo, audio anómalo',
      proteccion: 'IP67 / IK10 cristal de zafiro ahumado',
      integracion: 'PoE+ / Videoportero / Cierre inteligente',
    },
    highlights: [
      'Perfil arquitectónico de bajo impacto visual en titanio satinado',
      'Altavoz disuasivo integrado con mensajes personalizables',
      'Verificación biométrica opcional para apertura automática de puerta',
    ],
  },
  {
    id: 'blind-kit-residencial',
    name: 'Kit Perimetral Integral BlinD',
    category: 'kits',
    categoryLabel: 'Kits Completos',
    tagline: 'Ecosistema llave en mano para blindaje perimetral residencial o sede.',
    description:
      'Solución completa preconfigurada en fábrica con 2 cámaras IA 4K, 1 radar LiDAR 360°, 1 BlinD Core Domotic Hub y teclado biométrico de acero cepillado. Incluye diseño de plano perimetral e integración con iluminación y accesos existentes.',
    priceUsd: 4290,
    image: '/src/assets/images/blind_complete_perimeter_kit_1795541319532.jpg',
    specs: {
      alcance: 'Cobertura perimetral hasta 1,200 m²',
      deteccion: 'Multicapa: óptica + LiDAR + domótica',
      proteccion: 'Garantía estructural de 5 años',
      integracion: 'Instalación certificada y puesta en marcha',
    },
    highlights: [
      'Ahorro de 14% frente a la adquisición de componentes individuales',
      'Mapeo completo de zonas de alerta temprana incluido',
      'Soporte de ingeniería perimetral y mantenimiento preventivo',
    ],
  },
];

export const SENSOR_METADATA: Record<
  DeployableSensorType,
  {
    name: string;
    shortName: string;
    productId: string;
    defaultFov: number;
    defaultRange: number;
    color: string;
    unitPrice: number;
  }
> = {
  ptz_thermal: {
    name: 'Cámara IA 4K Thermal PTZ',
    shortName: 'Cámara IA PTZ',
    productId: 'blind-apex-ptz',
    defaultFov: 68,
    defaultRange: 175,
    color: '#28A9E0',
    unitPrice: 1890,
  },
  lidar_360: {
    name: 'Sensor Sentinel LiDAR 360°',
    shortName: 'Radar LiDAR 360°',
    productId: 'blind-sentinel-lidar',
    defaultFov: 360,
    defaultRange: 112,
    color: '#38BDF8',
    unitPrice: 1240,
  },
  infrared_bar: {
    name: 'Barrera Horizon Dual-Beam',
    shortName: 'Barrera Infrarroja',
    productId: 'blind-horizon-bar',
    defaultFov: 20,
    defaultRange: 210,
    color: '#60A5FA',
    unitPrice: 860,
  },
  domotic_lock: {
    name: 'Nodo Domótico de Bloqueo',
    shortName: 'Nodo Domótico',
    productId: 'blind-core-hub',
    defaultFov: 360,
    defaultRange: 64,
    color: '#7DD3FC',
    unitPrice: 1450,
  },
};

export const SITE_PRESETS: Record<'residencial' | 'empresarial', SitePreset> = {
  residencial: {
    id: 'residencial',
    name: 'Residencia Inteligente',
    subtitle: 'Vivienda unifamiliar · Jardín perimetral, acceso vehicular y domótica integrada',
    areaSqm: '1,150 m²',
    perimeterMeters: 142,
    zones: [
      {
        id: 'z-norte',
        name: 'Jardín Perimetral Norte',
        tier: 'exterior',
        tierLabel: 'Perímetro exterior',
        points: '60,44 740,44 740,145 585,145 585,120 215,120 215,145 60,145',
        labelX: 400,
        labelY: 74,
        description: 'Barrera temprana de jardines y muro frontal antes de acercarse a ventanales.',
      },
      {
        id: 'z-acceso',
        name: 'Acceso Vehicular y Pórtico',
        tier: 'acceso',
        tierLabel: 'Control de acceso',
        points: '60,145 215,145 215,436 60,436',
        labelX: 136,
        labelY: 392,
        description: 'Lectura de placas, detección de merodeo y bloqueo electromagnético del portón.',
      },
      {
        id: 'z-terraza',
        name: 'Terraza y Patio Sur',
        tier: 'exterior',
        tierLabel: 'Perímetro exterior',
        points: '585,145 740,145 740,436 585,436',
        labelX: 662,
        labelY: 392,
        description: 'Monitoreo volumétrico LiDAR con inmunidad total a mascotas domésticas.',
      },
      {
        id: 'z-casa',
        name: 'Núcleo Residencial y Domótica',
        tier: 'interior',
        tierLabel: 'Zona interior',
        points: '235,145 565,145 565,375 235,375',
        labelX: 400,
        labelY: 266,
        description: 'Escenas automáticas de iluminación perimetral, persianas y cerraduras inteligentes.',
      },
    ],
    initialSensors: [
      {
        id: 's-res-1',
        productId: 'blind-apex-ptz',
        label: 'PTZ-N1 Acceso Portón',
        type: 'ptz_thermal',
        x: 215,
        y: 152,
        angle: 145,
        fov: 68,
        range: 175,
        zoneId: 'z-acceso',
        armed: true,
      },
      {
        id: 's-res-2',
        productId: 'blind-horizon-bar',
        label: 'BAR-N2 Muro Frontal',
        type: 'infrared_bar',
        x: 92,
        y: 66,
        angle: 0,
        fov: 18,
        range: 280,
        zoneId: 'z-norte',
        armed: true,
      },
      {
        id: 's-res-3',
        productId: 'blind-sentinel-lidar',
        label: 'LDR-E1 Jardín Este',
        type: 'lidar_360',
        x: 646,
        y: 235,
        angle: 0,
        fov: 360,
        range: 112,
        zoneId: 'z-terraza',
        armed: true,
      },
      {
        id: 's-res-4',
        productId: 'blind-apex-ptz',
        label: 'PTZ-S2 Fachada Norte',
        type: 'ptz_thermal',
        x: 560,
        y: 148,
        angle: -58,
        fov: 72,
        range: 165,
        zoneId: 'z-norte',
        armed: true,
      },
      {
        id: 's-res-5',
        productId: 'blind-core-hub',
        label: 'HUB-01 Central Domótica',
        type: 'domotic_lock',
        x: 400,
        y: 222,
        angle: 0,
        fov: 360,
        range: 64,
        zoneId: 'z-casa',
        armed: true,
      },
    ],
    intrusionPaths: [
      {
        label: 'Aproximación por muro norte',
        entity: 'Persona no autorizada',
        waypoints: [
          { x: 460, y: 20 },
          { x: 495, y: 78 },
          { x: 545, y: 125 },
          { x: 615, y: 175 },
          { x: 648, y: 212 },
        ],
      },
      {
        label: 'Acceso vehicular nocturno',
        entity: 'Vehículo sin registro',
        waypoints: [
          { x: 35, y: 340 },
          { x: 112, y: 295 },
          { x: 158, y: 230 },
          { x: 188, y: 186 },
        ],
      },
    ],
  },
  empresarial: {
    id: 'empresarial',
    name: 'Planta Empresarial',
    subtitle: 'Complejo logístico y oficinas · Cerco perimetral, andenes de carga y centro de datos',
    areaSqm: '6,400 m²',
    perimeterMeters: 380,
    zones: [
      {
        id: 'z-cerco',
        name: 'Cerco Perimetral Industrial',
        tier: 'exterior',
        tierLabel: 'Perímetro exterior',
        points: '48,40 752,40 752,126 48,126',
        labelX: 400,
        labelY: 70,
        description: 'Doble anillo térmico e infrarrojo sobre el límite perimetral de 380 metros.',
      },
      {
        id: 'z-andenes',
        name: 'Patio de Carga y Andenes',
        tier: 'acceso',
        tierLabel: 'Control de acceso',
        points: '48,126 248,126 248,440 48,440',
        labelX: 148,
        labelY: 406,
        description: 'Analítica de vehículos pesados, apertura automatizada y disuasión luminosa.',
      },
      {
        id: 'z-nave',
        name: 'Nave Operativa Principal',
        tier: 'interior',
        tierLabel: 'Zona interior',
        points: '266,144 574,144 574,420 266,420',
        labelX: 420,
        labelY: 286,
        description: 'Control de accesos biométricos, cierre sectorizado y supervisión ambiental.',
      },
      {
        id: 'z-datacenter',
        name: 'Bóveda y Centro de Datos',
        tier: 'interior',
        tierLabel: 'Zona crítica',
        points: '592,144 752,144 752,420 592,420',
        labelX: 672,
        labelY: 286,
        description: 'Doble verificación LiDAR + domótica de enclavamiento electromagnético.',
      },
    ],
    initialSensors: [
      {
        id: 's-emp-1',
        productId: 'blind-horizon-bar',
        label: 'BAR-C1 Cerco Norte',
        type: 'infrared_bar',
        x: 78,
        y: 82,
        angle: 0,
        fov: 16,
        range: 310,
        zoneId: 'z-cerco',
        armed: true,
      },
      {
        id: 's-emp-2',
        productId: 'blind-apex-ptz',
        label: 'PTZ-A1 Garita Andenes',
        type: 'ptz_thermal',
        x: 248,
        y: 164,
        angle: 142,
        fov: 74,
        range: 195,
        zoneId: 'z-andenes',
        armed: true,
      },
      {
        id: 's-emp-3',
        productId: 'blind-sentinel-lidar',
        label: 'LDR-C2 Flanco Este',
        type: 'lidar_360',
        x: 660,
        y: 112,
        angle: 0,
        fov: 360,
        range: 118,
        zoneId: 'z-cerco',
        armed: true,
      },
      {
        id: 's-emp-4',
        productId: 'blind-apex-ptz',
        label: 'PTZ-D1 Acceso Bóveda',
        type: 'ptz_thermal',
        x: 594,
        y: 382,
        angle: -38,
        fov: 65,
        range: 150,
        zoneId: 'z-datacenter',
        armed: true,
      },
      {
        id: 's-emp-5',
        productId: 'blind-core-hub',
        label: 'HUB-EMP Central Neuronal',
        type: 'domotic_lock',
        x: 672,
        y: 230,
        angle: 0,
        fov: 360,
        range: 70,
        zoneId: 'z-datacenter',
        armed: true,
      },
    ],
    intrusionPaths: [
      {
        label: 'Cruce en patio de carga',
        entity: 'Vehículo sin registro',
        waypoints: [
          { x: 24, y: 310 },
          { x: 108, y: 274 },
          { x: 162, y: 215 },
          { x: 212, y: 175 },
        ],
      },
      {
        label: 'Intento sobre cerco norte-este',
        entity: 'Persona no autorizada',
        waypoints: [
          { x: 560, y: 18 },
          { x: 604, y: 68 },
          { x: 652, y: 102 },
          { x: 678, y: 158 },
        ],
      },
    ],
  },
};

export interface CaseStudy {
  id: string;
  metric: string;
  timeframe: string;
  client: string;
  role: string;
  sector: string;
  quote: string;
  outcome: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cs-1',
    metric: '98.4% menos falsas alarmas',
    timeframe: 'Medido en 14 meses de operación continua',
    client: 'Ing. Rodrigo Valdivia',
    role: 'Director de Operaciones · Parque Logístico Altiplano',
    sector: 'Empresarial · 14,500 m²',
    quote:
      'Antes recibíamos entre 12 y 18 alertas nocturnas falsas cada semana por lluvia y fauna. Con los sensores LiDAR y cámaras térmicas BlinD, la central solo escala eventos verificados y los reflectores disuaden antes del contacto con el cerco.',
    outcome: 'Tiempo medio de alerta temprana reducido a 0.18 segundos en 420 m de perímetro.',
  },
  {
    id: 'cs-2',
    metric: '0 intrusiones efectivas',
    timeframe: 'En 18 residencias protegidas en zona privada',
    client: 'Arq. Valeria Mendoza',
    role: 'Socia Fundadora · Estudio Mendoza Arquitectura',
    sector: 'Residencial · Domótica integral',
    quote:
      'Necesitábamos hardware que respetara fachadas minimalistas sin cables visibles ni focos invasivos. BlinD integró cámaras domo, barreras infrarrojas y cierre automático de persianas en una sola interfaz silenciosa.',
    outcome: 'Integración nativa KNX con respuesta luminosa y bloqueo de accesos en menos de 1 segundo.',
  },
];
