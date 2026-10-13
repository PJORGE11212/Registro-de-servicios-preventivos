import { Equipment, CorrectiveMaintenanceRecord } from '../types';

export function exportToCSV(filename: string, rows: string[][]): void {
  const processRow = (row: string[]) => {
    return row
      .map((val) => {
        const stringVal = val === null || val === undefined ? '' : String(val);
        const result = stringVal.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0) {
          return `"${result}"`;
        }
        return `"${result}"`;
      })
      .join(';');
  };

  const csvContent = '\uFEFF' + rows.map(processRow).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportMaintenanceRecordsToCSV(records: CorrectiveMaintenanceRecord[]): void {
  const headers = [
    'ID Registro',
    'Equipo',
    'Tipo Equipo',
    'Fecha',
    'Horómetro (Horas)',
    'Categorías de Falla',
    'Descripción de la Falla',
    'Actividad Correctiva Realizada',
    'Elementos Cambiados',
    'Elementos Reacondicionados',
    'Horas Detenido',
    'Técnico Responsable',
    'Estado',
    'Notas',
  ];

  const rows = records.map((r) => {
    const changedItems = r.items
      .filter((i) => i.action === 'cambiado')
      .map((i) => `${i.quantity}x ${i.name}${i.partNumber ? ` [${i.partNumber}]` : ''}`)
      .join(' | ');

    const recondItems = r.items
      .filter((i) => i.action === 'reacondicionado')
      .map((i) => `${i.quantity}x ${i.name}${i.partNumber ? ` [${i.partNumber}]` : ''}`)
      .join(' | ');

    const cats =
      r.failureCategories && r.failureCategories.length > 0
        ? r.failureCategories.join(', ')
        : r.failureCategory || 'otro';

    return [
      r.id,
      r.equipmentCode,
      r.equipmentType.toUpperCase(),
      r.date + (r.time ? ` ${r.time}` : ''),
      r.horometer !== undefined ? r.horometer.toString() : '0',
      cats,
      r.failureDescription,
      r.correctiveAction,
      changedItems || 'Ninguno',
      recondItems || 'Ninguno',
      r.downtimeHours.toString(),
      r.technician,
      r.status,
      r.notes || '',
    ];
  });

  exportToCSV(`Mantenimiento_Correctivo_${new Date().toISOString().slice(0, 10)}.csv`, [
    headers,
    ...rows,
  ]);
}

export function exportEquipmentsToCSV(equipments: Equipment[]): void {
  const headers = [
    'ID',
    'Número / Código',
    'Prefijo',
    'Tipo de Equipo',
    'Marca / Modelo',
    'N° Serie / VIN',
    'Ubicación',
    'Estado Operativo',
    'Horómetro (Horas)',
    'Notas',
  ];

  const rows = equipments.map((eq) => [
    eq.id,
    eq.code,
    eq.prefix,
    eq.type.toUpperCase(),
    eq.brandModel,
    eq.serialNumber || '',
    eq.location || '',
    eq.operationalStatus,
    eq.hoursOperating ? eq.hoursOperating.toString() : '0',
    eq.notes || '',
  ]);

  exportToCSV(`Flota_Equipos_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
}

export function exportAllDataAsJSON(
  equipments: Equipment[],
  records: CorrectiveMaintenanceRecord[]
): void {
  const data = {
    exportedAt: new Date().toISOString(),
    system: 'MaintTrack Industrial CMMS',
    equipments,
    records,
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const link = document.createElement('a');
  link.setAttribute('href', jsonString);
  link.setAttribute('download', `MaintTrack_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
