import React, { useState } from 'react';
import {
  X,
  Truck,
  Wrench,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  MapPin,
  PlusCircle,
  FileText,
  User,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Equipment, CorrectiveMaintenanceRecord, EquipmentStatus } from '../types';
import { EQUIPMENT_TYPES, STATUS_CONFIG } from '../utils/equipmentPrefix';
import { DateRangeFilter, isRecordInDateRange, formatDisplayDate } from './DateRangeFilter';

interface EquipmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  records: CorrectiveMaintenanceRecord[];
  onOpenNewMaintenanceForEquipment: (equipmentId: string) => void;
  onUpdateStatus: (equipmentId: string, newStatus: EquipmentStatus) => void;
  onViewRecord: (record: CorrectiveMaintenanceRecord) => void;
  onRequestDelete?: (equipment: Equipment) => void;
  onRequestDeleteRecord?: (record: CorrectiveMaintenanceRecord) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  isOpen,
  onClose,
  equipment,
  records,
  onOpenNewMaintenanceForEquipment,
  onUpdateStatus,
  onViewRecord,
  onRequestDelete,
  onRequestDeleteRecord,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen || !equipment) return null;

  const typeDef = EQUIPMENT_TYPES[equipment.type];
  const allEqRecords = records.filter((r) => r.equipmentId === equipment.id);
  const eqRecords = allEqRecords.filter((r) => isRecordInDateRange(r.date, startDate, endDate));
  const totalDowntime = eqRecords.reduce((acc, r) => acc + (r.downtimeHours || 0), 0);

  // Total parts changed vs reconditioned for this unit in filtered view
  let totalPartsChanged = 0;
  let totalPartsRecond = 0;
  eqRecords.forEach((r) => {
    r.items.forEach((item) => {
      if (item.action === 'cambiado') totalPartsChanged += item.quantity;
      if (item.action === 'reacondicionado') totalPartsRecond += item.quantity;
    });
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-6">
        {/* Hero Photo Header */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-950 overflow-hidden">
          <img
            src={typeDef.image}
            alt={typeDef.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-950/40" />

          {/* Close & Action Buttons at top */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => {
                onClose();
                onOpenNewMaintenanceForEquipment(equipment.id);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold rounded-xl bg-red-600 hover:bg-red-500 text-white transition active:scale-95 shadow-lg shadow-red-950/40 ring-1 ring-red-400/30"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ Nuevo Correctivo</span>
            </button>

            {onRequestDelete && (
              <button
                onClick={() => {
                  onClose();
                  onRequestDelete(equipment);
                }}
                className="p-2 rounded-xl bg-slate-950/60 hover:bg-rose-950/80 text-slate-300 hover:text-rose-400 backdrop-blur-md transition border border-white/10"
                title="Eliminar equipo (Requiere clave 1234)"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950/90 backdrop-blur-md transition border border-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Title and details over image */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-sm font-mono font-black px-3 py-1 rounded-xl border backdrop-blur-md ${typeDef.color.badge}`}
                >
                  {equipment.code}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-950/80 border border-white/20 text-white backdrop-blur-md">
                  {typeDef.fullName}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1 drop-shadow">
                {equipment.brandModel}
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Status & Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Estado Operativo</span>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${STATUS_CONFIG[equipment.operationalStatus].dot}`}
                />
                <select
                  value={equipment.operationalStatus}
                  onChange={(e) => onUpdateStatus(equipment.id, e.target.value as EquipmentStatus)}
                  className="bg-transparent text-xs font-bold text-white border-none focus:ring-0 p-0 cursor-pointer"
                >
                  <option value="operativo" className="bg-slate-900 text-white">Operativo</option>
                  <option value="en_mantenimiento" className="bg-slate-900 text-white">En Mantenimiento</option>
                  <option value="inoperativo" className="bg-slate-900 text-white">Inoperativo</option>
                  <option value="en_espera" className="bg-slate-900 text-white">En Espera Repuesto</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Horas Detenido Acumuladas</span>
              <div className="flex items-center gap-1.5 text-rose-400 font-mono font-bold text-lg">
                <Clock className="h-4 w-4" />
                <span>{totalDowntime} hrs</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Intervenciones Correctivas</span>
              <div className="flex items-center gap-1.5 text-blue-400 font-mono font-bold text-lg">
                <Wrench className="h-4 w-4" />
                <span>{eqRecords.length} eventos</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Repuestos Utilizados</span>
              <div className="text-xs space-y-0.5">
                <span className="text-slate-200 block font-mono">
                  {totalPartsChanged} Cambiados
                </span>
                <span className="text-emerald-400 block font-mono">
                  {totalPartsRecond} Reacondicionados
                </span>
              </div>
            </div>
          </div>

          {/* Technical Info Card */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Ubicación / Patio Asignado:</span>
              <span className="text-white font-medium flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-red-500" />
                {equipment.location || 'Sin ubicación específica'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">N° de Serie / VIN:</span>
              <span className="text-white font-mono">{equipment.serialNumber || 'No registrado'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Horómetro Actual:</span>
              <span className="text-white font-mono font-bold">
                {equipment.hoursOperating ? `${equipment.hoursOperating} hrs` : '0 hrs'}
              </span>
            </div>
            {equipment.notes && (
              <div className="sm:col-span-3 pt-2.5 border-t border-slate-800/80">
                <span className="text-slate-400 block mb-0.5">Observaciones Técnicas:</span>
                <p className="text-slate-300">{equipment.notes}</p>
              </div>
            )}
          </div>

          {/* Corrective Maintenance History */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-1">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-500" />
                  Historial de Actividades Correctivas ({eqRecords.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Todas las intervenciones registradas para {equipment.code}
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenNewMaintenanceForEquipment(equipment.id);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl bg-red-600 hover:bg-red-500 text-white transition active:scale-95 shadow-md shadow-red-950/40 self-start sm:self-auto ring-1 ring-red-400/30"
              >
                <PlusCircle className="h-4 w-4" />
                <span>+ Añadir Otro Correctivo</span>
              </button>
            </div>

            {/* Date filter if equipment has records */}
            {allEqRecords.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  onChangeStartDate={setStartDate}
                  onChangeEndDate={setEndDate}
                  onClear={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  totalFilteredCount={eqRecords.length}
                  totalRecordsCount={allEqRecords.length}
                  label={`Filtrar Servicios de ${equipment.code}`}
                />
              </div>
            )}

            {eqRecords.length === 0 ? (
              <div className="text-center py-10 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-slate-400 text-xs space-y-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                {allEqRecords.length > 0 && (startDate || endDate) ? (
                  <>
                    <p className="text-slate-300 font-bold">
                      Sin actividades en el rango de fechas seleccionado
                    </p>
                    <p className="text-slate-500 max-w-sm mx-auto">
                      No se encontraron servicios para <strong>{equipment.code}</strong> entre{' '}
                      <span className="text-red-400 font-mono">
                        {startDate ? formatDisplayDate(startDate) : 'el inicio'}
                      </span>{' '}
                      y{' '}
                      <span className="text-red-400 font-mono">
                        {endDate ? formatDisplayDate(endDate) : 'hoy'}
                      </span>
                      .
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-red-400" />
                      <span>Ver todo el historial ({allEqRecords.length} servicios)</span>
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-slate-300 font-bold">Sin intervenciones correctivas previas</p>
                    <p className="text-slate-500 max-w-sm mx-auto">
                      Este equipo está al día y no registra fallas correctivas en la bitácora.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenNewMaintenanceForEquipment(equipment.id);
                      }}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-500 transition shadow-md shadow-red-950/40 ring-1 ring-red-400/30"
                    >
                      + Registrar Primer Correctivo para {equipment.code}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {eqRecords.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => onViewRecord(record)}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer hover:bg-slate-950 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {record.date} {record.time ? `(${record.time})` : ''}
                        </span>

                        {record.horometer !== undefined && (
                          <span className="text-[11px] font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                            {record.horometer} hrs
                          </span>
                        )}

                        {(record.failureCategories || (record.failureCategory ? [record.failureCategory] : [])).map((cat) => (
                          <span
                            key={cat}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/40 text-red-300 border border-red-800/40 uppercase font-bold"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-red-300 font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                          {record.downtimeHours}h detenido
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            record.status === 'completado'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : record.status === 'en_proceso'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                          }`}
                        >
                          {record.status === 'completado'
                            ? 'Completado'
                            : record.status === 'en_proceso'
                            ? 'En Proceso'
                            : 'Esperando Repuestos'}
                        </span>
                        {onRequestDeleteRecord && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRequestDeleteRecord(record);
                            }}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition ml-1"
                            title="Eliminar este correctivo (Requiere clave 1234)"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-red-400 font-semibold block mb-0.5">Falla diagnosticada:</span>
                        <p className="text-slate-200">{record.failureDescription}</p>
                      </div>

                      <div>
                        <span className="text-emerald-400 font-semibold block mb-0.5">
                          Actividad Correctiva Realizada:
                        </span>
                        <p className="text-slate-300">{record.correctiveAction}</p>
                      </div>

                      {record.items.length > 0 && (
                        <div className="pt-2 flex flex-wrap items-center gap-1.5">
                          <span className="text-slate-400 font-semibold mr-1">Repuestos:</span>
                          {record.items.map((item) => (
                            <span
                              key={item.id}
                              className={`text-[11px] px-2 py-0.5 rounded-md font-mono border ${
                                item.action === 'cambiado'
                                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {item.action === 'cambiado' ? '🔄 Cambiado:' : '🛠 Reacondicionado:'} {item.quantity}x {item.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {record.technician}
                        </span>
                        <span className="text-red-400/90 group-hover:underline">Ver ficha técnica completa →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
