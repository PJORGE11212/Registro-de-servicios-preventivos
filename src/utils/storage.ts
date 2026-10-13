import { Equipment, CorrectiveMaintenanceRecord } from '../types';
import { detectEquipmentType } from './equipmentPrefix';
import { buildOfficialFleet } from '../data/fleetData';

const EQUIPMENTS_KEY = 'mainttrack_equipments_v2';
const RECORDS_KEY = 'mainttrack_records_v3';

export const INITIAL_EQUIPMENTS: Equipment[] = buildOfficialFleet();

export const INITIAL_RECORDS: CorrectiveMaintenanceRecord[] = [
  {
    id: 'rec-001',
    equipmentId: 'eq-50-2045',
    equipmentCode: '50-2045',
    equipmentType: 'terberg',
    date: '2026-10-08',
    time: '14:30',
    failureCategory: 'hidraulico',
    failureCategories: ['hidraulico', 'sistema_elevacion'],
    horometer: 5670,
    failureDescription: 'Pérdida de presión en elevación de quinta rueda y fuga severa en manguera flexible de retorno.',
    correctiveAction: 'Se desmontó la manguera fisurada, se reemplazaron niples y se reacondicionó el racor giratorio de la válvula distribuidora.',
    items: [
      {
        id: 'item-101',
        name: 'Manguera hidráulica SAE 100 R2AT 3/4"',
        action: 'cambiado',
        quantity: 2,
        partNumber: 'HYD-34-R2AT',
      },
      {
        id: 'item-102',
        name: 'Racor giratorio 90° de válvula',
        action: 'reacondicionado',
        quantity: 1,
        partNumber: 'TER-RC-90',
      },
      {
        id: 'item-103',
        name: 'Sellos tóricos viton (O-rings)',
        action: 'cambiado',
        quantity: 4,
        partNumber: 'OR-VIT-18',
      },
    ],
    downtimeHours: 4.5,
    technician: 'Ing. Carlos Mendoza / Mec. R. Morales',
    status: 'en_proceso',
    notes: 'Falta prueba de carga con contenedor cargado de 30T',
    createdAt: '2026-10-08T15:00:00Z',
  },
  {
    id: 'rec-002',
    equipmentId: 'eq-40-2155',
    equipmentCode: '40-2155',
    equipmentType: 'pettibone',
    date: '2026-10-07',
    time: '09:15',
    failureCategory: 'hidraulico',
    failureCategories: ['hidraulico'],
    horometer: 5210,
    failureDescription: 'Fuga masiva de aceite por sellos del vástago del cilindro telescópico principal. Inoperativo por seguridad.',
    correctiveAction: 'Desmontaje de cilindro telescópico, inspección de vástago por rayaduras, pulido fino y cambio de kit de sellos.',
    items: [
      {
        id: 'item-201',
        name: 'Kit de sellos cilindro extensión telescópica',
        action: 'cambiado',
        quantity: 1,
        partNumber: 'PET-SK-8840',
      },
      {
        id: 'item-202',
        name: 'Vástago cromado de 4 pulgadas',
        action: 'reacondicionado',
        quantity: 1,
        partNumber: 'PET-VST-4',
      },
      {
        id: 'item-203',
        name: 'Aceite hidráulico ISO VG 68 (galones)',
        action: 'cambiado',
        quantity: 8,
        partNumber: 'OIL-ISO68',
      },
    ],
    downtimeHours: 12.0,
    technician: 'Mec. Principal Javier Duarte',
    status: 'esperando_repuestos',
    notes: 'Esperando llegada de juego de sellos importados de proveedor local.',
    createdAt: '2026-10-07T10:00:00Z',
  },
  {
    id: 'rec-003',
    equipmentId: 'eq-20-2412',
    equipmentCode: '20-2412',
    equipmentType: 'grillo',
    date: '2026-10-05',
    time: '11:00',
    failureCategory: 'motor',
    failureCategories: ['motor'],
    horometer: 3120,
    failureDescription: 'Sobrecalentamiento del motor en ralentí y rotura de la correa de bomba de agua.',
    correctiveAction: 'Sustitución de correa trapezoidal, purgado de refrigerante, prueba de presión de tapa de radiador y reacondicionamiento de polea tensora.',
    items: [
      {
        id: 'item-301',
        name: 'Correa de alternador y bomba de agua',
        action: 'cambiado',
        quantity: 1,
        partNumber: 'BELT-AVX13-1050',
      },
      {
        id: 'item-302',
        name: 'Polea tensora y rodamiento',
        action: 'reacondicionado',
        quantity: 1,
        partNumber: 'PL-GRI-TEN',
      },
      {
        id: 'item-303',
        name: 'Líquido refrigerante 50/50 Heavy Duty',
        action: 'cambiado',
        quantity: 4,
        partNumber: 'COOL-HD-5050',
      },
    ],
    downtimeHours: 3.5,
    technician: 'Téc. Alberto Silva',
    status: 'completado',
    notes: 'Equipo verificado a temperatura operativa nominal (82°C)',
    createdAt: '2026-10-05T12:00:00Z',
  },
  {
    id: 'rec-004',
    equipmentId: 'eq-45-2351',
    equipmentCode: '45-2351',
    equipmentType: 'hyster',
    date: '2026-10-03',
    time: '08:45',
    failureCategory: 'frenos',
    failureCategories: ['frenos', 'hidraulico'],
    horometer: 4120,
    failureDescription: 'Baja presión de frenado en eje delantero y fuga de líquido en bombín de freno derecho.',
    correctiveAction: 'Se desarmó el cubo de rueda, rectificación ligera de tambor y sustitución de bombín y zapatas de freno.',
    items: [
      {
        id: 'item-401',
        name: 'Cilindro de rueda / bombín de freno derecho',
        action: 'cambiado',
        quantity: 1,
        partNumber: 'HYS-CYL-BRK',
      },
      {
        id: 'item-402',
        name: 'Tambor de freno delantero',
        action: 'reacondicionado',
        quantity: 1,
        partNumber: 'HYS-DRUM-F',
      },
      {
        id: 'item-403',
        name: 'Juego de zapatas / balatas de freno',
        action: 'cambiado',
        quantity: 2,
        partNumber: 'HYS-PADS-HD',
      },
    ],
    downtimeHours: 6.0,
    technician: 'Mec. Marcos Quintana',
    status: 'completado',
    notes: 'Frenado probado en rampa con 5T de carga',
    createdAt: '2026-10-03T10:00:00Z',
  },
  {
    id: 'rec-005',
    equipmentId: 'eq-20-2209',
    equipmentCode: '20-2209',
    equipmentType: 'grillo',
    date: '2026-10-01',
    time: '15:10',
    failureCategory: 'electrico',
    failureCategories: ['electrico', 'motor'],
    horometer: 2890,
    failureDescription: 'Testigo de alarma de presión de aceite activado en cabina y lectura errática en manómetro.',
    correctiveAction: 'Sustitución del bulbo sensor de presión de aceite motor, limpieza de conector arnés y prueba con manómetro mecánico patrón.',
    items: [
      {
        id: 'item-701',
        name: 'Sensor / bulbo de presión de aceite motor',
        action: 'cambiado',
        quantity: 1,
        partNumber: 'SNS-OIL-GRI',
      },
      {
        id: 'item-702',
        name: 'Mazo conector sellado IP67',
        action: 'cambiado',
        quantity: 1,
        partNumber: 'CONN-DEUT-2P',
      },
    ],
    downtimeHours: 2.0,
    technician: 'Electromecánico David Rojas',
    status: 'completado',
    notes: 'Presión verificada en 45 PSI a régimen nominal.',
    createdAt: '2026-10-01T16:00:00Z',
  },
  {
    id: 'rec-006',
    equipmentId: 'eq-50-2046',
    equipmentCode: '50-2046',
    equipmentType: 'terberg',
    date: '2026-09-28',
    time: '16:00',
    failureCategory: 'electrico',
    failureCategories: ['electrico', 'motor'],
    horometer: 6240,
    failureDescription: 'Falla intermitente en encendido, motor de arranque no activa y sulfatación en terminales de batería.',
    correctiveAction: 'Limpieza y torneado de colector de motor de arranque, sustitución de escobillas (carbones) y reemplazo de bornes de batería.',
    items: [
      {
        id: 'item-501',
        name: 'Motor de arranque 24V',
        action: 'reacondicionado',
        quantity: 1,
        partNumber: 'TER-STR-24V',
      },
      {
        id: 'item-502',
        name: 'Juego de carbones / escobillas de arranque',
        action: 'cambiado',
        quantity: 1,
        partNumber: 'CARB-STR-24',
      },
      {
        id: 'item-503',
        name: 'Bornes de batería de latón reforzados',
        action: 'cambiado',
        quantity: 2,
        partNumber: 'TERM-BRASS-POS',
      },
    ],
    downtimeHours: 2.5,
    technician: 'Electromecánico David Rojas',
    status: 'completado',
    notes: 'Voltaje de carga verificado en 28.2V con motor encendido',
    createdAt: '2026-09-28T16:30:00Z',
  },
  {
    id: 'rec-007',
    equipmentId: 'eq-40-1847',
    equipmentCode: '40-1847',
    equipmentType: 'pettibone',
    date: '2026-09-22',
    time: '10:20',
    failureCategory: 'transmision',
    failureCategories: ['transmision'],
    horometer: 4580,
    failureDescription: 'Golpeteo en cruceta de cardán intermedio al aplicar marcha hacia adelante.',
    correctiveAction: 'Desmonte de flecha cardán, cambio de crucetas con rodamientos de agujas y engrase general de copas.',
    items: [
      {
        id: 'item-601',
        name: 'Cruceta de cardán serie 1550',
        action: 'cambiado',
        quantity: 2,
        partNumber: 'SPICER-5-155X',
      },
      {
        id: 'item-602',
        name: 'Horquilla deslizante de cardán',
        action: 'reacondicionado',
        quantity: 1,
        partNumber: 'YOKE-1550-SLIP',
      },
    ],
    downtimeHours: 5.0,
    technician: 'Mec. Marcos Quintana',
    status: 'completado',
    notes: 'Balanceo dinámico aprobado',
    createdAt: '2026-09-22T11:00:00Z',
  },
  {
    id: 'rec-008',
    equipmentId: 'eq-50-2045',
    equipmentCode: '50-2045',
    equipmentType: 'terberg',
    date: '2026-09-18',
    time: '08:30',
    failureCategory: 'frenos',
    failureCategories: ['frenos'],
    horometer: 5610,
    failureDescription: 'Fuga de aire constante por la válvula de descarga rápida del freno de estacionamiento.',
    correctiveAction: 'Sustitución de diafragma de válvula de descarga rápida, reapriete de niples de manguera neumática y prueba de estanqueidad con agua jabonosa.',
    items: [
      {
        id: 'item-801',
        name: 'Válvula de escape rápido neumática Wabco',
        action: 'cambiado',
        quantity: 1,
        partNumber: 'WABCO-973-500',
      },
      {
        id: 'item-802',
        name: 'Tubería de nylon neumática 12mm (metros)',
        action: 'cambiado',
        quantity: 3,
        partNumber: 'NYL-12MM-AIR',
      },
    ],
    downtimeHours: 3.0,
    technician: 'Mec. Principal Javier Duarte',
    status: 'completado',
    notes: 'Presión del circuito neumático se sostiene en 8.5 bar.',
    createdAt: '2026-09-18T09:00:00Z',
  },
  {
    id: 'rec-009',
    equipmentId: 'eq-45-2350',
    equipmentCode: '45-2350',
    equipmentType: 'hyster',
    date: '2026-09-12',
    time: '13:00',
    failureCategory: 'sistema_elevacion',
    failureCategories: ['sistema_elevacion', 'hidraulico'],
    horometer: 3980,
    failureDescription: 'Desalineación en vástago de cilindro de inclinación de mástil y goteo leve por empaquetadura.',
    correctiveAction: 'Desmontaje de pasador de anclaje, reemplazo de empaque rascador y alineación con lainas de ajuste.',
    items: [
      {
        id: 'item-901',
        name: 'Rascador y sellos cilindro inclinación',
        action: 'cambiado',
        quantity: 1,
        partNumber: 'HYS-TILT-SK',
      },
      {
        id: 'item-902',
        name: 'Bocina de bronce para pasador de mástil',
        action: 'reacondicionado',
        quantity: 2,
        partNumber: 'BUSH-BRZ-50MM',
      },
    ],
    downtimeHours: 4.0,
    technician: 'Téc. Alberto Silva',
    status: 'completado',
    notes: 'Prueba de cabeceo de mástil sin holgura.',
    createdAt: '2026-09-12T14:00:00Z',
  },
  {
    id: 'rec-010',
    equipmentId: 'eq-40-2049',
    equipmentCode: '40-2049',
    equipmentType: 'pettibone',
    date: '2026-09-05',
    time: '11:45',
    failureCategory: 'frenos',
    failureCategories: ['frenos'],
    horometer: 5020,
    failureDescription: 'Pérdida de grasa en retén de masa delantera derecha y contaminación de disco de freno.',
    correctiveAction: 'Desmonte de conjunto de masa, limpieza desengrasante de disco, sustitución de retén de doble labio y reengrase con grasa EP2.',
    items: [
      {
        id: 'item-1001',
        name: 'Retén de aceite de masa delantera',
        action: 'cambiado',
        quantity: 1,
        partNumber: 'PET-HUB-SEAL',
      },
      {
        id: 'item-1002',
        name: 'Líquido limpiador desengrasante para frenos',
        action: 'cambiado',
        quantity: 2,
        partNumber: 'BRK-CLNR-500',
      },
    ],
    downtimeHours: 3.5,
    technician: 'Mec. Marcos Quintana',
    status: 'completado',
    notes: 'Par de apriete de tuerca castillo verificado según manual.',
    createdAt: '2026-09-05T12:00:00Z',
  },
  {
    id: 'rec-011',
    equipmentId: 'eq-20-1607',
    equipmentCode: '20-1607',
    equipmentType: 'grillo',
    date: '2026-09-02',
    time: '09:00',
    failureCategory: 'direccion',
    failureCategories: ['direccion', 'estructura'],
    horometer: 1840,
    failureDescription: 'Juego excesivo en terminal de barra de dirección lado izquierdo provocando desgaste irregular de neumático.',
    correctiveAction: 'Cambio de terminal de dirección roscado, regulación de convergencia y engrase de rótula.',
    items: [
      {
        id: 'item-1101',
        name: 'Terminal de dirección reforzado M24',
        action: 'cambiado',
        quantity: 1,
        partNumber: 'TRM-STR-20GRI',
      },
      {
        id: 'item-1102',
        name: 'Barra de acoplamiento de dirección',
        action: 'reacondicionado',
        quantity: 1,
        partNumber: 'BAR-TIE-20GRI',
      },
    ],
    downtimeHours: 3.0,
    technician: 'Téc. Alberto Silva',
    status: 'completado',
    notes: 'Alineación de dirección verificada.',
    createdAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'rec-012',
    equipmentId: 'eq-50-2046',
    equipmentCode: '50-2046',
    equipmentType: 'terberg',
    date: '2026-08-25',
    time: '14:00',
    failureCategory: 'hidraulico',
    failureCategories: ['hidraulico'],
    horometer: 6100,
    failureDescription: 'Obstrucción en filtro de succión hidráulico provocando cavitación en bomba principal.',
    correctiveAction: 'Drenaje de estanque hidráulico, cambio de cartucho de filtro de succión y limpieza magnética de depósito.',
    items: [
      {
        id: 'item-1201',
        name: 'Elemento filtrante de succión 10 micras',
        action: 'cambiado',
        quantity: 1,
        partNumber: 'HYD-FLT-10M',
      },
    ],
    downtimeHours: 4.0,
    technician: 'Ing. Carlos Mendoza',
    status: 'completado',
    notes: 'Nivel de ruido de bomba volvió a rango normal.',
    createdAt: '2026-08-25T15:00:00Z',
  },
];

export function loadEquipments(): Equipment[] {
  try {
    const raw = localStorage.getItem(EQUIPMENTS_KEY);
    let currentEquipments: Equipment[] = [];
    if (!raw) {
      currentEquipments = INITIAL_EQUIPMENTS;
      localStorage.setItem(EQUIPMENTS_KEY, JSON.stringify(INITIAL_EQUIPMENTS));
      return INITIAL_EQUIPMENTS;
    }
    const parsed = JSON.parse(raw);
    currentEquipments = Array.isArray(parsed) ? parsed : INITIAL_EQUIPMENTS;

    // Ensure all 72 official equipment from user list are present
    const existingCodeSet = new Set(currentEquipments.map((e) => e.code.toUpperCase()));
    let updated = false;
    for (const officialEq of INITIAL_EQUIPMENTS) {
      if (!existingCodeSet.has(officialEq.code.toUpperCase())) {
        currentEquipments.push(officialEq);
        existingCodeSet.add(officialEq.code.toUpperCase());
        updated = true;
      }
    }
    if (updated) {
      localStorage.setItem(EQUIPMENTS_KEY, JSON.stringify(currentEquipments));
    }
    return currentEquipments;
  } catch (e) {
    console.error('Error loading equipments from localStorage', e);
    return INITIAL_EQUIPMENTS;
  }
}

export function saveEquipments(equipments: Equipment[]): void {
  try {
    localStorage.setItem(EQUIPMENTS_KEY, JSON.stringify(equipments));
  } catch (e) {
    console.error('Error saving equipments to localStorage', e);
  }
}

export function loadMaintenanceRecords(): CorrectiveMaintenanceRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) {
      const oldRaw = localStorage.getItem('mainttrack_records_v1') || localStorage.getItem('mainttrack_records_v2');
      if (oldRaw) {
        try {
          const oldList = JSON.parse(oldRaw);
          if (Array.isArray(oldList)) {
            const initialIds = new Set(INITIAL_RECORDS.map((r) => r.id));
            const userCustom = oldList.filter((r) => !initialIds.has(r.id));
            const merged = [...INITIAL_RECORDS, ...userCustom];
            localStorage.setItem(RECORDS_KEY, JSON.stringify(merged));
            return merged;
          }
        } catch (_) {
          // ignore
        }
      }
      localStorage.setItem(RECORDS_KEY, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_RECORDS;
    return parsed.map((r: any) => ({
      ...r,
      failureCategories:
        Array.isArray(r.failureCategories) && r.failureCategories.length > 0
          ? r.failureCategories
          : r.failureCategory
          ? [r.failureCategory]
          : ['otro'],
    }));
  } catch (e) {
    console.error('Error loading maintenance records from localStorage', e);
    return INITIAL_RECORDS;
  }
}

export function saveMaintenanceRecords(records: CorrectiveMaintenanceRecord[]): void {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving records to localStorage', e);
  }
}

export function resetToDemoData(): {
  equipments: Equipment[];
  records: CorrectiveMaintenanceRecord[];
} {
  localStorage.setItem(EQUIPMENTS_KEY, JSON.stringify(INITIAL_EQUIPMENTS));
  localStorage.setItem(RECORDS_KEY, JSON.stringify(INITIAL_RECORDS));
  return {
    equipments: INITIAL_EQUIPMENTS,
    records: INITIAL_RECORDS,
  };
}

/**
 * Bulk generate equipment codes
 */
export function generateEquipmentBatch(params: {
  prefix: string;
  startNumber: number;
  count: number;
  padLength: number;
  brandModel?: string;
  location?: string;
}): Equipment[] {
  const { prefix, startNumber, count, padLength, brandModel, location } = params;
  const newEquipments: Equipment[] = [];
  const detected = detectEquipmentType(prefix);

  for (let i = 0; i < count; i++) {
    const currentNum = startNumber + i;
    const padded = String(currentNum).padStart(padLength, '0');
    const code = `${prefix}-${padded}`;
    const id = `eq-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}-${i}`;

    newEquipments.push({
      id,
      code,
      prefix,
      type: detected.type,
      brandModel: brandModel?.trim() || `${detected.type.toUpperCase()} Estándar`,
      location: location?.trim() || 'Patio Principal',
      operationalStatus: 'operativo',
      hoursOperating: 0,
      createdAt: new Date().toISOString(),
    });
  }

  return newEquipments;
}
