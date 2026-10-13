import React, { useRef, useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Printer,
  Clock,
  Wrench,
  Truck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Equipment, CorrectiveMaintenanceRecord } from '../types';
import { EQUIPMENT_TYPES } from '../utils/equipmentPrefix';
import {
  exportEquipmentsToCSV,
  exportMaintenanceRecordsToCSV,
  exportAllDataAsJSON,
} from '../utils/exportUtils';
import { DateRangeFilter, isRecordInDateRange, formatDisplayDate } from './DateRangeFilter';

interface ReportsViewProps {
  equipments: Equipment[];
  records: CorrectiveMaintenanceRecord[];
  onResetData: () => void;
  onImportJSON: (equipments: Equipment[], records: CorrectiveMaintenanceRecord[]) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  equipments,
  records,
  onResetData,
  onImportJSON,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter records by date range
  const filteredRecords = records.filter((r) => isRecordInDateRange(r.date, startDate, endDate));

  const totalDowntime = filteredRecords.reduce((sum, r) => sum + (r.downtimeHours || 0), 0);

  // Downtime by equipment type for filtered records
  const downtimeByType = {
    grillo: filteredRecords
      .filter((r) => r.equipmentType === 'grillo')
      .reduce((s, r) => s + (r.downtimeHours || 0), 0),
    pettibone: filteredRecords
      .filter((r) => r.equipmentType === 'pettibone')
      .reduce((s, r) => s + (r.downtimeHours || 0), 0),
    hyster: filteredRecords
      .filter((r) => r.equipmentType === 'hyster')
      .reduce((s, r) => s + (r.downtimeHours || 0), 0),
    terberg: filteredRecords
      .filter((r) => r.equipmentType === 'terberg')
      .reduce((s, r) => s + (r.downtimeHours || 0), 0),
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && Array.isArray(json.equipments) && Array.isArray(json.records)) {
          onImportJSON(json.equipments, json.records);
          alert('Copia de seguridad importada con éxito.');
        } else {
          alert('El archivo JSON no tiene el formato de respaldo válido de MaintTrack.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
            Reportes & Exportación de Datos
          </h2>
          <p className="text-xs text-slate-400">
            Descarga de bitácora en Excel CSV, respaldos completos y auditoría de horas detenido
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 self-start sm:self-auto transition"
        >
          <Printer className="h-4 w-4" />
          <span>Imprimir Informe</span>
        </button>
      </div>

      {/* Date Filter Bar for Reports */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onChangeStartDate={setStartDate}
          onChangeEndDate={setEndDate}
          onClear={() => {
            setStartDate('');
            setEndDate('');
          }}
          totalFilteredCount={filteredRecords.length}
          totalRecordsCount={records.length}
          label="Filtrar Reporte y Descarga por Rango de Fechas"
        />
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export Maintenance CSV */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center mb-3">
              <Wrench className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Exportar Bitácora Correctiva</h3>
            <p className="text-xs text-slate-400 mt-1">
              Descarga {startDate || endDate ? `${filteredRecords.length} actividades filtradas` : 'todas las fallas e intervenciones'}{' '}
              en formato CSV compatible con Excel.
            </p>
          </div>
          <button
            onClick={() => exportMaintenanceRecordsToCSV(filteredRecords)}
            className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-sm shadow-red-950/30"
          >
            <Download className="h-4 w-4" />
            <span>Descargar Bitácora ({filteredRecords.length} CSV)</span>
          </button>
        </div>

        {/* Export Fleet CSV */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-3">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Exportar Padrón de Flota</h3>
            <p className="text-xs text-slate-400 mt-1">
              Descarga la lista de todos los equipos clasificados por prefijo (20, 40, 45, 50), modelos, estado y horómetro actual.
            </p>
          </div>
          <button
            onClick={() => exportEquipmentsToCSV(equipments)}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>Descargar Flota (CSV)</span>
          </button>
        </div>

        {/* Full Backup JSON */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-3">
              <Download className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Copia de Seguridad (Backup)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Guarda una copia completa en archivo JSON con todos los equipos e historial para respaldar o restaurar en otro dispositivo.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportAllDataAsJSON(equipments, records)}
              className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Guardar JSON</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              title="Restaurar respaldo JSON"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Cargar</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Summary Table: Downtime & Availability by Prefix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-red-500" />
          Resumen Ejecutivo de Disponibilidad y Horas Detenido
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Prefijo & Familia</th>
                <th className="py-3 px-4 text-center">Total Unidades</th>
                <th className="py-3 px-4 text-center">Operativos</th>
                <th className="py-3 px-4 text-center">En Taller</th>
                <th className="py-3 px-4 text-center">Disponibilidad %</th>
                <th className="py-3 px-4 text-right">Horas Detenido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {/* 20 Grillos */}
              <tr>
                <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                  <img
                    src={EQUIPMENT_TYPES.grillo.image}
                    alt="Grillo"
                    className="h-8 w-8 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                  />
                  <span className="font-mono text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                    20
                  </span>
                  <span>Grillos</span>
                </td>
                <td className="py-3 px-4 text-center font-mono">
                  {equipments.filter((e) => e.type === 'grillo').length}
                </td>
                <td className="py-3 px-4 text-center font-mono text-emerald-400">
                  {equipments.filter((e) => e.type === 'grillo' && e.operationalStatus === 'operativo').length}
                </td>
                <td className="py-3 px-4 text-center font-mono text-amber-400">
                  {equipments.filter((e) => e.type === 'grillo' && e.operationalStatus !== 'operativo').length}
                </td>
                <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                  {equipments.filter((e) => e.type === 'grillo').length > 0
                    ? Math.round(
                        (equipments.filter((e) => e.type === 'grillo' && e.operationalStatus === 'operativo').length /
                          equipments.filter((e) => e.type === 'grillo').length) *
                          100
                      )
                    : 0}
                  %
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                  {downtimeByType.grillo} hrs
                </td>
              </tr>

              {/* 40 Pettibone */}
              <tr>
                <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                  <img
                    src={EQUIPMENT_TYPES.pettibone.image}
                    alt="Pettibone"
                    className="h-8 w-8 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                  />
                  <span className="font-mono text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/30">
                    40
                  </span>
                  <span>Pettibone (PTT)</span>
                </td>
                <td className="py-3 px-4 text-center font-mono">
                  {equipments.filter((e) => e.type === 'pettibone').length}
                </td>
                <td className="py-3 px-4 text-center font-mono text-emerald-400">
                  {equipments.filter((e) => e.type === 'pettibone' && e.operationalStatus === 'operativo').length}
                </td>
                <td className="py-3 px-4 text-center font-mono text-amber-400">
                  {equipments.filter((e) => e.type === 'pettibone' && e.operationalStatus !== 'operativo').length}
                </td>
                <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                  {equipments.filter((e) => e.type === 'pettibone').length > 0
                    ? Math.round(
                        (equipments.filter((e) => e.type === 'pettibone' && e.operationalStatus === 'operativo').length /
                          equipments.filter((e) => e.type === 'pettibone').length) *
                          100
                      )
                    : 0}
                  %
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-blue-400">
                  {downtimeByType.pettibone} hrs
                </td>
              </tr>

              {/* 45 Hyster */}
              <tr>
                <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                  <img
                    src={EQUIPMENT_TYPES.hyster.image}
                    alt="Hyster"
                    className="h-8 w-8 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                  />
                  <span className="font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                    45
                  </span>
                  <span>Hyster</span>
                </td>
                <td className="py-3 px-4 text-center font-mono">
                  {equipments.filter((e) => e.type === 'hyster').length}
                </td>
                <td className="py-3 px-4 text-center font-mono text-emerald-400">
                  {equipments.filter((e) => e.type === 'hyster' && e.operationalStatus === 'operativo').length}
                </td>
                <td className="py-3 px-4 text-center font-mono text-amber-400">
                  {equipments.filter((e) => e.type === 'hyster' && e.operationalStatus !== 'operativo').length}
                </td>
                <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                  {equipments.filter((e) => e.type === 'hyster').length > 0
                    ? Math.round(
                        (equipments.filter((e) => e.type === 'hyster' && e.operationalStatus === 'operativo').length /
                          equipments.filter((e) => e.type === 'hyster').length) *
                          100
                      )
                    : 0}
                  %
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                  {downtimeByType.hyster} hrs
                </td>
              </tr>

              {/* 50 TT / Terberg */}
              <tr>
                <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                  <img
                    src={EQUIPMENT_TYPES.terberg.image}
                    alt="TT / Terberg"
                    className="h-8 w-8 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                  />
                  <span className="font-mono text-orange-400 bg-orange-500/15 px-2 py-0.5 rounded border border-orange-500/30">
                    50
                  </span>
                  <span>TT / Terberg</span>
                </td>
                <td className="py-3 px-4 text-center font-mono">
                  {equipments.filter((e) => e.type === 'terberg').length}
                </td>
                <td className="py-3 px-4 text-center font-mono text-emerald-400">
                  {equipments.filter((e) => e.type === 'terberg' && e.operationalStatus === 'operativo').length}
                </td>
                <td className="py-3 px-4 text-center font-mono text-amber-400">
                  {equipments.filter((e) => e.type === 'terberg' && e.operationalStatus !== 'operativo').length}
                </td>
                <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                  {equipments.filter((e) => e.type === 'terberg').length > 0
                    ? Math.round(
                        (equipments.filter((e) => e.type === 'terberg' && e.operationalStatus === 'operativo').length /
                          equipments.filter((e) => e.type === 'terberg').length) *
                          100
                      )
                    : 0}
                  %
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-orange-400">
                  {downtimeByType.terberg} hrs
                </td>
              </tr>

              {/* Totals Row */}
              <tr className="bg-slate-950 font-bold">
                <td className="py-3 px-4 text-white">TOTAL FLOTA</td>
                <td className="py-3 px-4 text-center font-mono text-white">{equipments.length}</td>
                <td className="py-3 px-4 text-center font-mono text-emerald-400">
                  {equipments.filter((e) => e.operationalStatus === 'operativo').length}
                </td>
                <td className="py-3 px-4 text-center font-mono text-amber-400">
                  {equipments.filter((e) => e.operationalStatus !== 'operativo').length}
                </td>
                <td className="py-3 px-4 text-center font-mono text-white">
                  {equipments.length > 0
                    ? Math.round(
                        (equipments.filter((e) => e.operationalStatus === 'operativo').length /
                          equipments.length) *
                          100
                      )
                    : 0}
                  %
                </td>
                <td className="py-3 px-4 text-right font-mono text-rose-400">{totalDowntime} hrs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Restablecer a Datos de Demostración
          </h4>
          <p className="text-xs text-rose-400/80 mt-1">
            Restaura la flota de ejemplo inicial con los equipos de las series 20, 40, 45, 50 y mantenimientos correctivos predefinidos.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('¿Restablecer el sistema a los datos iniciales de demostración?')) {
              onResetData();
            }
          }}
          className="px-4 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 text-xs font-bold transition self-start sm:self-auto"
        >
          Restablecer Demostración
        </button>
      </div>
    </div>
  );
};
