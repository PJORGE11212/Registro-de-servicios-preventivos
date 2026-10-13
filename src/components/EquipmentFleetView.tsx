import React, { useState } from 'react';
import {
  Truck,
  Search,
  Filter,
  PlusCircle,
  Layers,
  Wrench,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Grid,
  List,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { Equipment, CorrectiveMaintenanceRecord, EquipmentType, EquipmentStatus } from '../types';
import { EQUIPMENT_TYPES, STATUS_CONFIG } from '../utils/equipmentPrefix';

interface EquipmentFleetViewProps {
  equipments: Equipment[];
  records: CorrectiveMaintenanceRecord[];
  onOpenNewEquipment: () => void;
  onOpenBatchGenerator: () => void;
  onSelectEquipment: (equipment: Equipment) => void;
  onEditEquipment: (equipment: Equipment) => void;
  onRequestDeleteEquipment: (equipment: Equipment) => void;
  onOpenNewMaintenanceForEquipment: (equipmentId: string) => void;
  onUpdateStatus: (equipmentId: string, status: EquipmentStatus) => void;
  initialTypeFilter?: EquipmentType | 'all';
}

export const EquipmentFleetView: React.FC<EquipmentFleetViewProps> = ({
  equipments,
  records,
  onOpenNewEquipment,
  onOpenBatchGenerator,
  onSelectEquipment,
  onEditEquipment,
  onRequestDeleteEquipment,
  onOpenNewMaintenanceForEquipment,
  onUpdateStatus,
  initialTypeFilter = 'all',
}) => {
  const [activeFilter, setActiveFilter] = useState<string>(initialTypeFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Compute stats per equipment
  const getEquipmentStats = (eqId: string) => {
    const eqRecords = records.filter((r) => r.equipmentId === eqId);
    const downtime = eqRecords.reduce((sum, r) => sum + (r.downtimeHours || 0), 0);
    return {
      count: eqRecords.length,
      downtime,
    };
  };

  // Filtered equipments
  const filteredEquipments = equipments.filter((eq) => {
    // Type or status filter
    if (activeFilter === '20' && eq.type !== 'grillo') return false;
    if (activeFilter === '40' && eq.type !== 'pettibone') return false;
    if (activeFilter === '45' && eq.type !== 'hyster') return false;
    if (activeFilter === '50' && eq.type !== 'terberg') return false;
    if (activeFilter === 'grillo' && eq.type !== 'grillo') return false;
    if (activeFilter === 'pettibone' && eq.type !== 'pettibone') return false;
    if (activeFilter === 'hyster' && eq.type !== 'hyster') return false;
    if (activeFilter === 'terberg' && eq.type !== 'terberg') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = eq.code.toLowerCase().includes(q);
      const matchModel = eq.brandModel.toLowerCase().includes(q);
      const matchLocation = eq.location?.toLowerCase().includes(q);
      const matchSerial = eq.serialNumber?.toLowerCase().includes(q);
      return matchCode || matchModel || matchLocation || matchSerial;
    }

    return true;
  });

  const families = [
    { id: 'all', label: 'Todos', count: equipments.length },
    {
      id: '20',
      type: 'grillo' as EquipmentType,
      label: '20 - Grillos',
      count: equipments.filter((e) => e.type === 'grillo').length,
    },
    {
      id: '40',
      type: 'pettibone' as EquipmentType,
      label: '40 - Pettibone (PTT)',
      count: equipments.filter((e) => e.type === 'pettibone').length,
    },
    {
      id: '45',
      type: 'hyster' as EquipmentType,
      label: '45 - Hyster',
      count: equipments.filter((e) => e.type === 'hyster').length,
    },
    {
      id: '50',
      type: 'terberg' as EquipmentType,
      label: '50 - TT / Terberg',
      count: equipments.filter((e) => e.type === 'terberg').length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Visual Family Switcher Banner with Real Reference Thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {families.map((f) => {
          const isActive =
            activeFilter === f.id ||
            (f.type && activeFilter === f.type);
          const def = f.type ? EQUIPMENT_TYPES[f.type] : null;

          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`relative overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 flex flex-col justify-between group ${
                isActive
                  ? 'border-red-600 bg-slate-900 ring-2 ring-red-500/30 shadow-lg shadow-red-950/20'
                  : 'border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              {def && (
                <div className="absolute right-0 top-0 bottom-0 w-24 overflow-hidden opacity-30 group-hover:opacity-40 transition-opacity pointer-events-none">
                  <img
                    src={def.image}
                    alt={def.name}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent" />
                </div>
              )}

              <div className="relative z-10">
                <span
                  className={`text-[11px] font-mono font-bold block ${
                    isActive ? 'text-red-400' : 'text-slate-400'
                  }`}
                >
                  {f.id === 'all' ? 'FLOTA COMPLETA' : `PREFIJO ${f.id}`}
                </span>
                <span className="text-sm font-extrabold text-white block mt-0.5 truncate">
                  {f.label}
                </span>
              </div>

              <div className="relative z-10 mt-3 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-300">{f.count} uds.</span>
                {isActive && (
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                    Activo
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Action & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número (ej: 20-0010, 50-0002), modelo o patio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${
                viewMode === 'grid' ? 'bg-slate-800 text-red-500 font-bold' : 'text-slate-400'
              }`}
              title="Vista Cuadrícula con fotos"
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${
                viewMode === 'table' ? 'bg-slate-800 text-red-500 font-bold' : 'text-slate-400'
              }`}
              title="Vista Tabla"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      {filteredEquipments.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-slate-900 border border-dashed border-slate-800 p-8 space-y-3">
          <Truck className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No hay equipos en este filtro</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Puedes cambiar de filtro, generar una serie con el generador de lotes o registrar un nuevo equipo.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={onOpenBatchGenerator}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              Generar Lote
            </button>
            <button
              onClick={onOpenNewEquipment}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-950/40"
            >
              Registrar Equipo
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Dynamic Grid with machine photo headers */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEquipments.map((eq) => {
            const def = EQUIPMENT_TYPES[eq.type];
            const stats = getEquipmentStats(eq.id);
            return (
              <div
                key={eq.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 shadow-md flex flex-col justify-between group hover:shadow-xl"
              >
                <div>
                  {/* Equipment Photo Header */}
                  <div
                    onClick={() => onSelectEquipment(eq)}
                    className="relative h-36 w-full overflow-hidden bg-slate-950 cursor-pointer"
                  >
                    <img
                      src={def.image}
                      alt={def.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

                    {/* Code Tag */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg border shadow-lg backdrop-blur-md ${def.color.badge}`}
                      >
                        {eq.code}
                      </span>
                    </div>

                    {/* Status Select inside photo */}
                    <div
                      className="absolute top-3 right-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={eq.operationalStatus}
                        onChange={(e) => onUpdateStatus(eq.id, e.target.value as EquipmentStatus)}
                        className={`text-[10px] font-bold rounded-full px-2.5 py-0.5 border cursor-pointer backdrop-blur-md shadow-lg ${
                          STATUS_CONFIG[eq.operationalStatus].color
                        }`}
                      >
                        <option value="operativo" className="bg-slate-900 text-emerald-400">
                          🟢 Operativo
                        </option>
                        <option value="en_mantenimiento" className="bg-slate-900 text-amber-400">
                          🟡 En Bahía
                        </option>
                        <option value="inoperativo" className="bg-slate-900 text-rose-400">
                          🔴 Parado
                        </option>
                        <option value="en_espera" className="bg-slate-900 text-purple-400">
                          🟣 Espera Rep.
                        </option>
                      </select>
                    </div>

                    {/* Machine Model Overlay */}
                    <div className="absolute bottom-2 left-3 right-3">
                      <h3 className="text-sm font-extrabold text-white group-hover:text-red-400 transition drop-shadow">
                        {def.name}
                      </h3>
                      <p className="text-[11px] text-slate-300 truncate drop-shadow">
                        {eq.brandModel}
                      </p>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div
                    onClick={() => onSelectEquipment(eq)}
                    className="p-4 space-y-3 cursor-pointer"
                  >
                    <div className="space-y-1.5 text-xs text-slate-400 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          {eq.location || 'Patio General'}
                        </span>
                        {eq.hoursOperating ? (
                          <span className="font-mono text-[11px] text-slate-300">
                            {eq.hoursOperating} hrs
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Wrench className="h-3 w-3 text-blue-400" />
                          {stats.count} {stats.count === 1 ? 'correctivo' : 'correctivos'}
                        </span>
                        <span className="font-mono font-bold text-rose-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {stats.downtime} hrs detenido
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 pt-0 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => onSelectEquipment(eq)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Eye className="h-3 w-3 text-slate-400" />
                    <span>Ver Historial</span>
                  </button>

                  <button
                    onClick={() => onOpenNewMaintenanceForEquipment(eq.id)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-red-600/15 hover:bg-red-600/25 text-red-300 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                    <PlusCircle className="h-3 w-3" />
                    <span>+ Correctivo</span>
                  </button>

                  <button
                    onClick={() => onEditEquipment(eq)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Editar equipo"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => onRequestDeleteEquipment(eq)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Eliminar equipo (Requiere clave)"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Equipo & Foto</th>
                  <th className="py-3 px-4">Modelo / Descripción</th>
                  <th className="py-3 px-4">Ubicación</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-center">Correctivos</th>
                  <th className="py-3 px-4 text-right">Horas Detenido</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredEquipments.map((eq) => {
                  const def = EQUIPMENT_TYPES[eq.type];
                  const stats = getEquipmentStats(eq.id);
                  return (
                    <tr key={eq.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={def.image}
                            alt={def.name}
                            className="h-9 w-9 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                          />
                          <div>
                            <span
                              className={`font-mono font-bold px-2 py-0.5 rounded border ${def.color.badge}`}
                            >
                              {eq.code}
                            </span>
                            <div className="text-[11px] font-bold text-white mt-0.5">{def.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {eq.brandModel}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {eq.location || 'Patio General'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            STATUS_CONFIG[eq.operationalStatus].color
                          }`}
                        >
                          {STATUS_CONFIG[eq.operationalStatus].label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-slate-300">
                        {stats.count}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                        {stats.downtime} hrs
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectEquipment(eq)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Ver historial de correctivos"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenNewMaintenanceForEquipment(eq.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-slate-800"
                            title="Registrar actividad correctiva"
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onEditEquipment(eq)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Editar"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onRequestDeleteEquipment(eq)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            title="Eliminar (Requiere clave)"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
