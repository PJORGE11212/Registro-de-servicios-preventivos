import { EquipmentType, EquipmentTypeDefinition, FailureCategory } from '../types';
import { EQUIPMENT_IMAGES } from '../assets/equipmentImages';

export const EQUIPMENT_TYPES: Record<EquipmentType, EquipmentTypeDefinition> = {
  grillo: {
    type: 'grillo',
    prefix: '20',
    name: 'Grillo',
    fullName: 'Grillo / Equipos Serie 20',
    image: EQUIPMENT_IMAGES.grillo,
    color: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-500 dark:text-amber-400',
      border: 'border-amber-500/30',
      badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
      accent: 'amber',
    },
    defaultModel: 'Grillo Industrial / Portuario',
    description: 'Equipos con prefijo 20 (Grillos / Tractores Utilitarios)',
  },
  pettibone: {
    type: 'pettibone',
    prefix: '40',
    name: 'Pettibone',
    fullName: 'Pettibone / Equipos Serie 40 (PTT)',
    image: EQUIPMENT_IMAGES.pettibone,
    color: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-500 dark:text-blue-400',
      border: 'border-blue-500/30',
      badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30',
      accent: 'blue',
    },
    defaultModel: 'Pettibone Cary-Lift 204i / Telehandler',
    description: 'Equipos con prefijo 40 (Pettibone / Manipuladores PTT)',
  },
  hyster: {
    type: 'hyster',
    prefix: '45',
    name: 'Hyster',
    fullName: 'Hyster / Montacargas Serie 45',
    image: EQUIPMENT_IMAGES.hyster,
    color: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-500 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
      accent: 'emerald',
    },
    defaultModel: 'Hyster Heavy-Duty Forklift H16XD-6',
    description: 'Equipos con prefijo 45 (Hyster / Montacargas Pesados)',
  },
  terberg: {
    type: 'terberg',
    prefix: '50',
    name: 'TT / Terberg',
    fullName: 'Tractor Terminal / Terberg Serie 50 (TT)',
    image: EQUIPMENT_IMAGES.terberg,
    color: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-500 dark:text-orange-400',
      border: 'border-orange-500/30',
      badge: 'bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-500/30',
      accent: 'orange',
    },
    defaultModel: 'Terberg YT222 / Terminal Tractor 4x2',
    description: 'Equipos con prefijo 50 (TT / Terberg Tractor Terminal)',
  },
  otro: {
    type: 'otro',
    prefix: '00',
    name: 'Otro Equipo',
    fullName: 'Otros Equipos Auxiliares',
    image: EQUIPMENT_IMAGES.terberg,
    color: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-500 dark:text-slate-400',
      border: 'border-slate-500/30',
      badge: 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30',
      accent: 'slate',
    },
    defaultModel: 'Equipo Especializado',
    description: 'Equipo sin prefijo convencional',
  },
};

/**
 * Detects the equipment type based on the equipment code prefix:
 * - Starts with 20 -> Grillo
 * - Starts with 40 -> Pettibone
 * - Starts with 45 -> Hyster
 * - Starts with 50 -> TT / Terberg
 */
export function detectEquipmentType(code: string): {
  type: EquipmentType;
  prefix: string;
  matchedRule: boolean;
} {
  const cleanCode = code.trim().replace(/^#/, '');

  // Check 45 first before general 4x
  if (cleanCode.startsWith('45')) {
    return { type: 'hyster', prefix: '45', matchedRule: true };
  }
  if (cleanCode.startsWith('20')) {
    return { type: 'grillo', prefix: '20', matchedRule: true };
  }
  if (cleanCode.startsWith('40')) {
    return { type: 'pettibone', prefix: '40', matchedRule: true };
  }
  if (cleanCode.startsWith('50')) {
    return { type: 'terberg', prefix: '50', matchedRule: true };
  }

  return { type: 'otro', prefix: cleanCode.slice(0, 2) || '00', matchedRule: false };
}

export function formatEquipmentCode(prefix: string, number: number | string, padLength = 4): string {
  const numStr = String(number).trim();
  const padded = numStr.padStart(padLength, '0');
  return `${prefix}-${padded}`;
}

export const FAILURE_CATEGORIES: { id: FailureCategory; label: string; icon: string }[] = [
  { id: 'hidraulico', label: 'Sistema Hidráulico', icon: 'Pipette' },
  { id: 'motor', label: 'Motor y Combustible', icon: 'Cpu' },
  { id: 'electrico', label: 'Sistema Eléctrico / Electrónico', icon: 'Zap' },
  { id: 'transmision', label: 'Transmisión y Diferencial', icon: 'Cog' },
  { id: 'frenos', label: 'Frenos y Neumática', icon: 'Disc' },
  { id: 'direccion', label: 'Dirección y Ejes', icon: 'Compass' },
  { id: 'neumaticos', label: 'Neumáticos / Llantas', icon: 'CircleDot' },
  { id: 'sistema_elevacion', label: 'Mástil / Torre / Sistema de Levante', icon: 'ArrowUpCircle' },
  { id: 'estructura', label: 'Chasis y Estructura', icon: 'Shield' },
  { id: 'otro', label: 'Otro / General', icon: 'Wrench' },
];

export const STATUS_CONFIG = {
  operativo: {
    label: 'Operativo',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  en_mantenimiento: {
    label: 'En Mantenimiento',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-500',
  },
  inoperativo: {
    label: 'Inoperativo / Parado',
    color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-500',
  },
  en_espera: {
    label: 'En Espera Repuesto',
    color: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    dot: 'bg-purple-500',
  },
};
