export type EquipmentType = 'grillo' | 'pettibone' | 'hyster' | 'terberg' | 'otro';

export type EquipmentStatus = 'operativo' | 'en_mantenimiento' | 'inoperativo' | 'en_espera';

export type MaintenanceItemAction = 'cambiado' | 'reacondicionado';

export type FailureCategory =
  | 'hidraulico'
  | 'motor'
  | 'electrico'
  | 'transmision'
  | 'frenos'
  | 'direccion'
  | 'neumaticos'
  | 'estructura'
  | 'sistema_elevacion'
  | 'otro';

export interface MaintenanceItem {
  id: string;
  name: string;
  action: MaintenanceItemAction;
  quantity: number;
  partNumber?: string;
  cost?: number;
}

export interface Equipment {
  id: string;
  code: string; // ej: 20-0012, 40-004, 45-015, 50-008
  prefix: string; // "20", "40", "45", "50", u otro
  type: EquipmentType;
  brandModel: string;
  serialNumber?: string;
  location?: string;
  operationalStatus: EquipmentStatus;
  hoursOperating?: number; // Horómetro actual
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CorrectiveMaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentType: EquipmentType;
  date: string; // YYYY-MM-DD o ISO
  time?: string;
  failureDescription: string;
  failureCategory?: FailureCategory; // compatibilidad previa
  failureCategories: FailureCategory[]; // una o más categorías de falla
  horometer?: number; // Horómetro del equipo al momento del correctivo
  correctiveAction: string;
  items: MaintenanceItem[];
  downtimeHours: number; // Horas detenido
  technician: string;
  status: 'completado' | 'en_proceso' | 'esperando_repuestos';
  notes?: string;
  costTotal?: number;
  createdAt: string;
}

export interface EquipmentTypeDefinition {
  type: EquipmentType;
  prefix: string;
  name: string;
  fullName: string;
  image?: string;
  color: {
    bg: string;
    text: string;
    border: string;
    badge: string;
    accent: string;
  };
  defaultModel: string;
  description: string;
}
