import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Filter,
  PlusCircle,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Package,
  Eye,
  Edit2,
  Trash2,
  Download,
  User,
  RotateCcw,
} from 'lucide-react';
import { CorrectiveMaintenanceRecord, Equipment, FailureCategory } from '../types';
import { EQUIPMENT_TYPES, FAILURE_CATEGORIES } from '../utils/equipmentPrefix';
import { exportMaintenanceRecordsToCSV } from '../utils/exportUtils';
import { DateRangeFilter, isRecordInDateRange, formatDisplayDate } from './DateRangeFilter';

interface MaintenanceLogViewProps {
  records: CorrectiveMaintenanceRecord[];
  equipments: Equipment[];
  onOpenNewMaintenance: () => void;
  onSelectRecord: (record: CorrectiveMaintenanceRecord) => void;
  onEditRecord: (record: CorrectiveMaintenanceRecord) => void;
  onDeleteRecord: (recordId: string) => void;
  onRequestDeleteRecord?: (record: CorrectiveMaintenanceRecord) => void;
}

export const MaintenanceLogView: React.FC<MaintenanceLogViewProps> = ({
  records,
  equipments,
  onOpenNewMaintenance,
  onSelectRecord,
  onEditRecord,
  onDeleteRecord,
  onRequestDeleteRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedEquipmentFilter('');
    setSelectedCategoryFilter('');
    setSelectedStatusFilter('');
    setStartDate('');
    setEndDate('');
  };

  // Filtering records
  const filteredRecords = records.filter((r) => {
    // Date filter
    if (!isRecordInDateRange(r.date, startDate, endDate)) return false;

    if (selectedEquipmentFilter && r.equipmentId !== selectedEquipmentFilter) return false;
    if (
      selectedCategoryFilter &&
      !r.failureCategories?.includes(selectedCategoryFilter as any) &&
      r.failureCategory !== selectedCategoryFilter
    ) {
      return false;
    }
    if (selectedStatusFilter && r.status !== selectedStatusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = r.equipmentCode.toLowerCase().includes(q);
      const matchFailure = r.failureDescription.toLowerCase().includes(q);
      const matchAction = r.correctiveAction.toLowerCase().includes(q);
      const matchTech = r.technician.toLowerCase().includes(q);
      const matchItems = r.items.some((i) => i.name.toLowerCase().includes(q));
      return matchCode || matchFailure || matchAction || matchTech || matchItems;
    }

    return true;
  });

  const totalDowntimeFiltered = filteredRecords.reduce((sum, r) => sum + (r.downtimeHours || 0), 0);
  const hasActiveFilters = Boolean(
    searchQuery || selectedEquipmentFilter || selectedCategoryFilter || selectedStatusFilter || startDate || endDate
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="h-5 w-5 text-red-500" />
            Bitácora de Mantenimientos Correctivos ({records.length})
          </h2>
          <p className="text-xs text-slate-400">
            Registro cronológico de fallas, actividades realizadas, elementos cambiados o reacondicionados y horas detenido
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportMaintenanceRecordsToCSV(filteredRecords)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            title="Descargar en Excel CSV"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onOpenNewMaintenance}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 transition shadow-md shadow-red-950/40 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ Registrar Correctivo</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar falla, repuesto, técnico..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Filter by equipment */}
          <select
            value={selectedEquipmentFilter}
            onChange={(e) => setSelectedEquipmentFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
          >
            <option value="">-- Todos los Equipos --</option>
            {equipments.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.code} ({EQUIPMENT_TYPES[eq.type]?.name})
              </option>
            ))}
          </select>

          {/* Filter by failure category */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
          >
            <option value="">-- Todas las Categorías --</option>
            {FAILURE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Filter by status */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
          >
            <option value="">-- Todos los Estados --</option>
            <option value="completado">Completados</option>
            <option value="en_proceso">En Proceso</option>
            <option value="esperando_repuestos">Esperando Repuestos</option>
          </select>
        </div>

        {/* Date Range Filter with Presets */}
        <div className="pt-3 border-t border-slate-800/80">
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
            label="Filtrar por Fecha de Servicio"
          />
        </div>

        {/* Stats summary of current filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <div>
              <span>Resultados: </span>
              <span className="font-bold text-white">{filteredRecords.length} actividades</span>
              {records.length !== filteredRecords.length && (
                <span className="text-slate-500 text-[11px] ml-1">
                  (de {records.length} totales)
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-red-400 hover:text-red-300 underline flex items-center gap-1 transition"
                title="Restablecer todos los filtros"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Restablecer filtros</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>Horas detenido en filtro: </span>
            <span className="font-mono font-bold text-rose-400">{totalDowntimeFiltered} hrs</span>
          </div>
        </div>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-slate-900 border border-dashed border-slate-800 p-8 space-y-3">
          <Wrench className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No hay actividades coincidentes</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {startDate || endDate ? (
              <span>
                No se encontraron mantenimientos en el rango{' '}
                <strong className="text-red-300">
                  {startDate ? formatDisplayDate(startDate) : 'Inicio'} a{' '}
                  {endDate ? formatDisplayDate(endDate) : 'Hoy'}
                </strong>
                . Prueba ampliando las fechas o restableciendo los filtros.
              </span>
            ) : (
              'No se encontraron mantenimientos con los filtros seleccionados. Intenta restablecer los filtros o registrar un nuevo mantenimiento.'
            )}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="h-3.5 w-3.5 text-red-400" />
                <span>Limpiar filtros</span>
              </button>
            )}
            <button
              onClick={onOpenNewMaintenance}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-500 transition shadow-md shadow-red-950/40"
            >
              + Registrar Mantenimiento
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => {
            const def = EQUIPMENT_TYPES[record.equipmentType] || EQUIPMENT_TYPES.otro;
            return (
              <div
                key={record.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition shadow-sm space-y-3 group"
              >
                {/* Header Row: Equipment, Date, Downtime & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-mono font-bold px-2.5 py-1 rounded-lg border ${def.color.badge}`}
                    >
                      {record.equipmentCode}
                    </span>
                    <span className="text-xs font-bold text-white">{def.name}</span>

                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1 ml-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      {record.date} {record.time ? `(${record.time})` : ''}
                    </span>

                    {record.horometer !== undefined && (
                      <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                        {record.horometer} hrs (Horómetro)
                      </span>
                    )}

                    {(record.failureCategories || (record.failureCategory ? [record.failureCategory] : [])).map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase font-semibold border border-slate-700"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-red-300 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-800/40">
                      <Clock className="h-3.5 w-3.5 text-red-400" />
                      <span>{record.downtimeHours} hrs detenido</span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                        record.status === 'completado'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : record.status === 'en_proceso'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                      }`}
                    >
                      {record.status === 'completado'
                        ? 'Completado'
                        : record.status === 'en_proceso'
                        ? 'En Proceso'
                        : 'Esperando Repuestos'}
                    </span>
                  </div>
                </div>

                {/* Body: Failure & Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-red-400 font-semibold uppercase tracking-wider text-[11px] block mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Falla Diagnosticada:
                    </span>
                    <p className="text-slate-200 leading-relaxed">{record.failureDescription}</p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[11px] block mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Actividad Correctiva Realizada:
                    </span>
                    <p className="text-slate-200 leading-relaxed">{record.correctiveAction}</p>
                  </div>
                </div>

                {/* Items Changed or Reconditioned */}
                {record.items.length > 0 && (
                  <div className="pt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-3.5 w-3.5 text-red-400" />
                      <span className="text-xs font-semibold text-slate-300">
                        Elementos Cambiados o Reacondicionados:
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {record.items.map((item) => (
                        <div
                          key={item.id}
                          className={`text-xs px-2.5 py-1 rounded-lg font-mono border flex items-center gap-1.5 ${
                            item.action === 'cambiado'
                              ? 'bg-blue-500/10 text-blue-300 border-blue-500/25'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                          }`}
                        >
                          <span className="font-bold">
                            {item.action === 'cambiado' ? '🔄 Cambiado:' : '🛠 Reacondicionado:'}
                          </span>
                          <span className="text-white">{item.quantity}x {item.name}</span>
                          {item.partNumber && (
                            <span className="text-[10px] text-slate-400 bg-slate-900 px-1 py-0.2 rounded">
                              [{item.partNumber}]
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer: Tech & Action Buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      <span>{record.technician}</span>
                    </span>
                    {record.notes && (
                      <span className="text-slate-500 text-[11px] truncate max-w-xs">
                        Nota: {record.notes}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button
                      onClick={() => onSelectRecord(record)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Detalle</span>
                    </button>

                    <button
                      onClick={() => onEditRecord(record)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onRequestDeleteRecord) {
                          onRequestDeleteRecord(record);
                        } else {
                          onDeleteRecord(record.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Eliminar registro (Requiere clave 1234)"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
