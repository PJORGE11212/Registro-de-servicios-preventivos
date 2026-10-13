import React, { useState, useMemo } from 'react';
import {
  Truck,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
  Calendar,
  Sparkles,
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Gauge,
  Cpu,
  FileSpreadsheet,
  HelpCircle,
  PlusCircle,
  ArrowRight,
  Eye,
  Check,
  ChevronRight,
  Award,
  Search,
  Filter,
  Info,
  Sliders,
  Flame,
  Zap,
} from 'lucide-react';
import { Equipment, CorrectiveMaintenanceRecord, EquipmentType, FailureCategory } from '../types';
import { EQUIPMENT_TYPES, FAILURE_CATEGORIES, STATUS_CONFIG } from '../utils/equipmentPrefix';
import { DateRangeFilter, isRecordInDateRange, formatDisplayDate } from './DateRangeFilter';

interface ReliabilityAnalysisViewProps {
  equipments: Equipment[];
  records: CorrectiveMaintenanceRecord[];
  onOpenNewMaintenance: () => void;
  onOpenNewEquipment: () => void;
  onOpenBatchGenerator: () => void;
  onSelectEquipment: (equipment: Equipment) => void;
  onSelectRecord: (record: CorrectiveMaintenanceRecord) => void;
  onGoToFleet: (filterType?: EquipmentType) => void;
  onGoToMaintenance: () => void;
}

export type SubAnalysisType =
  | 'mtbf'
  | 'mttf'
  | 'mttr'
  | 'availability'
  | 'criticality'
  | 'amfe'
  | 'weibull';

export const ReliabilityAnalysisView: React.FC<ReliabilityAnalysisViewProps> = ({
  equipments,
  records,
  onOpenNewMaintenance,
  onOpenNewEquipment,
  onOpenBatchGenerator,
  onSelectEquipment,
  onSelectRecord,
  onGoToFleet,
  onGoToMaintenance,
}) => {
  // Equipment selection: 'all' or specific equipment id
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(
    equipments[0]?.id || 'all'
  );

  // Filter for the equipment selection list
  const [equipmentFamilyFilter, setEquipmentFamilyFilter] = useState<string>('all');
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState<string>('');

  // Active sub-analysis
  const [activeAnalysis, setActiveAnalysis] = useState<SubAnalysisType>('mtbf');

  // Date range filter
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Find active selected equipment
  const selectedEquipment = equipments.find((e) => e.id === selectedEquipmentId);
  const baseRecords = selectedEquipment
    ? records.filter((r) => r.equipmentId === selectedEquipment.id)
    : records;
  const targetRecords = baseRecords.filter((r) => isRecordInDateRange(r.date, startDate, endDate));

  // Reliability calculations:
  // Operating hours of target asset
  const targetOperatingHours = selectedEquipment
    ? Math.max(selectedEquipment.hoursOperating || 0, 100)
    : equipments.reduce((sum, e) => sum + (e.hoursOperating || 0), 0) || 1200;

  const totalDowntime = targetRecords.reduce((sum, r) => sum + (r.downtimeHours || 0), 0);
  const failureCount = targetRecords.length;

  // 1. MTBF: Mean Time Between Failures = (Operating Time - Downtime) / Number of Failures
  const uptimeHours = Math.max(targetOperatingHours - totalDowntime, 0);
  const mtbfValue = failureCount > 0 ? Math.round(uptimeHours / failureCount) : Math.round(uptimeHours);

  // 2. MTTF: Mean Time To Failure (for non-repairable components replaced)
  const replacedItemsCount = targetRecords.reduce(
    (acc, r) => acc + r.items.filter((i) => i.action === 'cambiado').reduce((s, i) => s + i.quantity, 0),
    0
  );
  const mttfValue =
    replacedItemsCount > 0
      ? Math.round(targetOperatingHours / replacedItemsCount)
      : Math.round(targetOperatingHours * 1.15);

  // 3. MTTR: Mean Time To Repair = Total Downtime / Number of Repairs
  const mttrValue = failureCount > 0 ? (totalDowntime / failureCount).toFixed(1) : '0.0';

  // 4. Availability = (MTBF / (MTBF + MTTR)) * 100%
  const numMttr = parseFloat(mttrValue) || 1;
  const operationalAvailability =
    mtbfValue > 0 ? Math.min(100, Math.max(0, Math.round((mtbfValue / (mtbfValue + numMttr)) * 1000) / 10)) : 100;

  // 5. Criticality Scoring
  const frequencyScore = Math.min(5, Math.max(1, Math.ceil(failureCount / 1.5) || 1));
  const consequenceScore = Math.min(5, Math.max(1, Math.ceil(totalDowntime / 3) || 1));
  const riskIndex = frequencyScore * consequenceScore;
  const criticalityLevel: 'ALTA' | 'MEDIA' | 'BAJA' =
    riskIndex >= 12 ? 'ALTA' : riskIndex >= 6 ? 'MEDIA' : 'BAJA';

  // 6. Weibull Parameters Approximation
  const currentHours = selectedEquipment?.hoursOperating || 3200;
  const weibullBeta = currentHours > 4200 ? 2.45 : currentHours > 1600 ? 1.05 : 0.78;
  const weibullEta = Math.round(Math.max(currentHours * 1.35, 3800)); // Characteristic life
  const weibullPhase =
    weibullBeta < 0.95
      ? 'Fase I: Fallas Infantiles / Ajuste Temprano'
      : weibullBeta <= 1.3
      ? 'Fase II: Tasa de Falla Constante / Operación Aleatoria'
      : 'Fase III: Desgaste Acelerado / Envejecimiento de Componentes';

  // Category statistics breakdown
  const categoryStats: Record<string, number> = {};
  targetRecords.forEach((r) => {
    const cats =
      r.failureCategories && r.failureCategories.length > 0
        ? r.failureCategories
        : r.failureCategory
        ? [r.failureCategory]
        : ['otro'];
    cats.forEach((cat) => {
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });
  });

  // Filtered equipment list for the picker
  const filteredEquipmentsForPicker = equipments.filter((eq) => {
    if (equipmentFamilyFilter === '20' && eq.type !== 'grillo') return false;
    if (equipmentFamilyFilter === '40' && eq.type !== 'pettibone') return false;
    if (equipmentFamilyFilter === '45' && eq.type !== 'hyster') return false;
    if (equipmentFamilyFilter === '50' && eq.type !== 'terberg') return false;

    if (equipmentSearchQuery.trim()) {
      const q = equipmentSearchQuery.toLowerCase();
      return eq.code.toLowerCase().includes(q) || eq.brandModel.toLowerCase().includes(q);
    }
    return true;
  });

  // Calculate fleet ranking for criticality matrix
  const fleetCriticalityList = useMemo(() => {
    return equipments.map((eq) => {
      const eqRecs = records.filter((r) => r.equipmentId === eq.id);
      const eqDt = eqRecs.reduce((sum, r) => sum + (r.downtimeHours || 0), 0);
      const fScore = Math.min(5, Math.max(1, Math.ceil(eqRecs.length / 1.5) || 1));
      const cScore = Math.min(5, Math.max(1, Math.ceil(eqDt / 3) || 1));
      const rIdx = fScore * cScore;
      const level: 'ALTA' | 'MEDIA' | 'BAJA' = rIdx >= 12 ? 'ALTA' : rIdx >= 6 ? 'MEDIA' : 'BAJA';
      return {
        equipment: eq,
        failures: eqRecs.length,
        downtime: eqDt,
        frequencyScore: fScore,
        consequenceScore: cScore,
        riskIndex: rIdx,
        level,
      };
    });
  }, [equipments, records]);

  // Non-repairable components list extracted from records or standard database
  const nonRepairableComponents = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; category: string; expectedMttf: number }>();

    // Seed defaults typical of industrial fleet
    map.set('mangueras', {
      name: 'Mangueras Hidráulicas de Alta Presión',
      qty: 0,
      category: 'hidraulico',
      expectedMttf: 2500,
    });
    map.set('sellos', {
      name: 'Sellos de Vástago y O-Rings',
      qty: 0,
      category: 'hidraulico',
      expectedMttf: 3200,
    });
    map.set('rodamientos', {
      name: 'Rodamientos de Eje y Maza',
      qty: 0,
      category: 'transmision',
      expectedMttf: 4500,
    });
    map.set('sensores', {
      name: 'Sensores Electrónicos y Presostatos',
      qty: 0,
      category: 'electrico',
      expectedMttf: 3800,
    });
    map.set('correas', {
      name: 'Correas de Alternador y Bomba',
      qty: 0,
      category: 'motor',
      expectedMttf: 1800,
    });
    map.set('filtros', {
      name: 'Filtros Primarios y Trampas de Combustible',
      qty: 0,
      category: 'motor',
      expectedMttf: 1000,
    });

    targetRecords.forEach((r) => {
      r.items.forEach((item) => {
        if (item.action === 'cambiado') {
          const lower = item.name.toLowerCase();
          let key = 'mangueras';
          if (lower.includes('sello') || lower.includes('o-ring')) key = 'sellos';
          else if (lower.includes('rodamiento') || lower.includes('cojinete')) key = 'rodamientos';
          else if (lower.includes('sensor') || lower.includes('rele') || lower.includes('faro')) key = 'sensores';
          else if (lower.includes('correa') || lower.includes('faja')) key = 'correas';
          else if (lower.includes('filtro')) key = 'filtros';

          const current = map.get(key);
          if (current) {
            current.qty += item.quantity || 1;
          }
        }
      });
    });

    return Array.from(map.values());
  }, [targetRecords]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner / Engineering Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ingeniería de Confiabilidad y Mantenimiento</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Centro de Análisis & Métricas de Confiabilidad</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              Seleccione el equipo deseado y examine en profundidad sus curvas analíticas de confiabilidad:{' '}
              <strong className="text-amber-400">Tiempos y Frecuencia</strong> (MTBF, MTTF, MTTR),{' '}
              <strong className="text-blue-400">Disponibilidad y Criticidad</strong> (Ao, Matriz de Riesgo), o{' '}
              <strong className="text-emerald-400">Confiabilidad Avanzada</strong> (AMFE y Distribución Weibull).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onOpenNewMaintenance}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/20 active:scale-95 flex items-center gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ Nuevo Correctivo</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            PASO 1: SELECCIONAR EQUIPO
           ========================================================================= */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Truck className="h-4 w-4 text-amber-400" />
              <span>1. Elija el Equipo a Analizar:</span>
            </label>

            {/* Quick Filter Family Tabs for Equipment Selection */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
              <button
                onClick={() => setEquipmentFamilyFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  equipmentFamilyFilter === 'all'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Todos ({equipments.length})
              </button>
              <button
                onClick={() => setEquipmentFamilyFilter('20')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  equipmentFamilyFilter === '20'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-950 text-emerald-400 hover:text-white border border-slate-800'
                }`}
              >
                20 (Grillos)
              </button>
              <button
                onClick={() => setEquipmentFamilyFilter('40')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  equipmentFamilyFilter === '40'
                    ? 'bg-blue-500 text-slate-950'
                    : 'bg-slate-950 text-blue-400 hover:text-white border border-slate-800'
                }`}
              >
                40 (Pettibone)
              </button>
              <button
                onClick={() => setEquipmentFamilyFilter('45')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  equipmentFamilyFilter === '45'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-950 text-amber-400 hover:text-white border border-slate-800'
                }`}
              >
                45 (Hyster)
              </button>
              <button
                onClick={() => setEquipmentFamilyFilter('50')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  equipmentFamilyFilter === '50'
                    ? 'bg-purple-500 text-slate-950'
                    : 'bg-slate-950 text-purple-400 hover:text-white border border-slate-800'
                }`}
              >
                50 (TT/Terberg)
              </button>
            </div>
          </div>

          {/* Equipment Search Input if fleet is large */}
          {equipments.length > 6 && (
            <div className="relative max-w-sm">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por código de equipo..."
                value={equipmentSearchQuery}
                onChange={(e) => setEquipmentSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Equipment Carousel / Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {/* Global option: Toda la flota */}
            <button
              onClick={() => setSelectedEquipmentId('all')}
              className={`p-2.5 rounded-2xl border text-left transition-all duration-200 flex items-center gap-2.5 group relative overflow-hidden ${
                selectedEquipmentId === 'all'
                  ? 'bg-slate-950 border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-amber-400" />
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <span
                  className={`font-mono font-black text-xs block truncate ${
                    selectedEquipmentId === 'all' ? 'text-amber-400' : 'text-white'
                  }`}
                >
                  Toda la Flota
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  Promedio global
                </span>
              </div>
            </button>

            {filteredEquipmentsForPicker.map((eq) => {
              const isSelected = selectedEquipmentId === eq.id;
              const def = EQUIPMENT_TYPES[eq.type];
              const eqFailures = records.filter((r) => r.equipmentId === eq.id).length;
              return (
                <button
                  key={eq.id}
                  onClick={() => setSelectedEquipmentId(eq.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all duration-200 flex items-center gap-2.5 group relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-950 border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <img
                    src={def.image}
                    alt={eq.code}
                    className="h-10 w-10 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1 text-xs">
                    <span
                      className={`font-mono font-black text-xs block truncate ${
                        isSelected ? 'text-amber-400' : 'text-white'
                      }`}
                    >
                      {eq.code}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {def.name} • {eq.hoursOperating || 0}h
                    </span>
                  </div>
                  {eqFailures > 0 && (
                    <span className="absolute top-1 right-1.5 text-[9px] font-mono px-1 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                      {eqFailures}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Equipment Hero Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-3.5">
            {selectedEquipment ? (
              <img
                src={EQUIPMENT_TYPES[selectedEquipment.type]?.image}
                alt={selectedEquipment.code}
                className="h-14 w-14 rounded-2xl object-cover border border-slate-700 shadow-md flex-shrink-0"
              />
            ) : (
              <div className="h-14 w-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 shadow-md">
                <BarChart3 className="h-7 w-7 text-amber-400" />
              </div>
            )}

            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono font-black px-2.5 py-0.5 rounded-lg border text-xs ${
                    selectedEquipment
                      ? EQUIPMENT_TYPES[selectedEquipment.type]?.color.badge
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {selectedEquipment ? selectedEquipment.code : 'FLOTA COMPLETA'}
                </span>
                <span className="font-bold text-white text-sm">
                  {selectedEquipment
                    ? EQUIPMENT_TYPES[selectedEquipment.type]?.fullName
                    : 'Análisis Consolidado de Todos los Equipos'}
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                {selectedEquipment ? (
                  <>
                    {selectedEquipment.brandModel} • Horómetro:{' '}
                    <strong className="text-amber-400 font-mono">{selectedEquipment.hoursOperating || 0} hrs</strong>
                    {selectedEquipment.location && ` • Ubicación: ${selectedEquipment.location}`}
                  </>
                ) : (
                  <>
                    Total de {equipments.length} máquinas registradas • Horómetro consolidado:{' '}
                    <strong className="text-amber-400 font-mono">{targetOperatingHours} hrs</strong>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto text-xs font-mono">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block font-sans">Correctivos registrados:</span>
              <span className="text-amber-400 font-bold">{failureCount} eventos</span>
            </div>
            <div className="text-right pl-3 border-l border-slate-800">
              <span className="text-[10px] text-slate-500 block font-sans">Tiempo detenido:</span>
              <span className="text-rose-400 font-bold">{totalDowntime} hrs</span>
            </div>
            {selectedEquipment && (
              <button
                onClick={() => onSelectEquipment(selectedEquipment)}
                className="ml-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-sans font-bold transition"
              >
                Ver Ficha
              </button>
            )}
          </div>
        </div>

        {/* Date Filter Bar for Reliability Analysis */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onChangeStartDate={setStartDate}
            onChangeEndDate={setEndDate}
            onClear={() => {
              setStartDate('');
              setEndDate('');
            }}
            totalFilteredCount={targetRecords.length}
            totalRecordsCount={baseRecords.length}
            label={
              selectedEquipment
                ? `Rango de Fechas para Análisis de ${selectedEquipment.code}`
                : 'Rango de Fechas de Análisis (MTBF, MTTR, Disponibilidad)'
            }
          />
        </div>
      </div>

      {/* =========================================================================
          PASO 2: ELEGIR TIPO DE ANÁLISIS O GRÁFICA (3 CATEGORÍAS)
         ========================================================================= */}
      <div className="space-y-3">
        <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="h-4 w-4 text-red-500" />
          <span>2. Elija el Tipo de Análisis o Gráfica a Visualizar:</span>
        </label>

        {/* 3 Main Groups as Interactive Structural Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Grupo 1: Análisis de Tiempos y Frecuencia de Fallas */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-black uppercase text-red-400 flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>1. Tiempos y Frecuencia de Fallas</span>
              </h3>
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveAnalysis('mtbf')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between border ${
                  activeAnalysis === 'mtbf'
                    ? 'bg-red-600 text-white border-red-500 shadow-md ring-2 ring-red-500/20'
                    : 'bg-slate-950 hover:bg-slate-800/80 text-slate-300 border-slate-800'
                }`}
              >
                <div>
                  <div className="font-extrabold flex items-center gap-1.5">
                    <span>MTBF</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900/30">
                      {mtbfValue} hrs
                    </span>
                  </div>
                  <div className={`text-[10px] font-normal mt-0.5 ${activeAnalysis === 'mtbf' ? 'text-white/90' : 'text-slate-400'}`}>
                    Tiempo Medio Entre Fallas (Confiabilidad)
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </button>

              <button
                onClick={() => setActiveAnalysis('mttf')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between border ${
                  activeAnalysis === 'mttf'
                    ? 'bg-red-600 text-white border-red-500 shadow-md ring-2 ring-red-500/20'
                    : 'bg-slate-950 hover:bg-slate-800/80 text-slate-300 border-slate-800'
                }`}
              >
                <div>
                  <div className="font-extrabold flex items-center gap-1.5">
                    <span>MTTF</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900/30">
                      {mttfValue} hrs
                    </span>
                  </div>
                  <div className={`text-[10px] font-normal mt-0.5 ${activeAnalysis === 'mttf' ? 'text-white/90' : 'text-slate-400'}`}>
                    Tiempo Medio Hasta la Falla (No reparables)
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </button>

              <button
                onClick={() => setActiveAnalysis('mttr')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between border ${
                  activeAnalysis === 'mttr'
                    ? 'bg-red-600 text-white border-red-500 shadow-md ring-2 ring-red-500/20'
                    : 'bg-slate-950 hover:bg-slate-800/80 text-slate-300 border-slate-800'
                }`}
              >
                <div>
                  <div className="font-extrabold flex items-center gap-1.5">
                    <span>MTTR</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900/30">
                      {mttrValue} hrs
                    </span>
                  </div>
                  <div className={`text-[10px] font-normal mt-0.5 ${activeAnalysis === 'mttr' ? 'text-white/90' : 'text-slate-400'}`}>
                    Tiempo Medio de Reparación (Eficiencia de Taller)
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </button>
            </div>
          </div>

          {/* Grupo 2: Análisis de Disponibilidad y Criticidad */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-black uppercase text-blue-400 flex items-center gap-1.5">
                <Gauge className="h-4 w-4" />
                <span>2. Disponibilidad y Criticidad</span>
              </h3>
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveAnalysis('availability')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between border ${
                  activeAnalysis === 'availability'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-slate-950 hover:bg-slate-800/80 text-slate-300 border-slate-800'
                }`}
              >
                <div>
                  <div className="font-extrabold flex items-center gap-1.5">
                    <span>Disponibilidad Operativa</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900/40">
                      {operationalAvailability}%
                    </span>
                  </div>
                  <div className={`text-[10px] font-normal mt-0.5 ${activeAnalysis === 'availability' ? 'text-blue-100' : 'text-slate-400'}`}>
                    Cálculo cruzado MTBF &times; MTTR
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </button>

              <button
                onClick={() => setActiveAnalysis('criticality')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between border ${
                  activeAnalysis === 'criticality'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-slate-950 hover:bg-slate-800/80 text-slate-300 border-slate-800'
                }`}
              >
                <div>
                  <div className="font-extrabold flex items-center gap-1.5">
                    <span>Criticidad de Activos</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        criticalityLevel === 'ALTA'
                          ? 'bg-rose-500/30 text-rose-300'
                          : criticalityLevel === 'MEDIA'
                          ? 'bg-amber-500/30 text-amber-300'
                          : 'bg-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      {criticalityLevel}
                    </span>
                  </div>
                  <div className={`text-[10px] font-normal mt-0.5 ${activeAnalysis === 'criticality' ? 'text-blue-100' : 'text-slate-400'}`}>
                    Matriz de Riesgo: Alta, Media, Baja
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </button>
            </div>
          </div>

          {/* Grupo 3: Análisis Avanzados de Confiabilidad */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                <Cpu className="h-4 w-4" />
                <span>3. Confiabilidad Avanzada</span>
              </h3>
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveAnalysis('amfe')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between border ${
                  activeAnalysis === 'amfe'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-slate-950 hover:bg-slate-800/80 text-slate-300 border-slate-800'
                }`}
              >
                <div>
                  <div className="font-extrabold flex items-center gap-1.5">
                    <span>AMFE / AMEF</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900/40">
                      NPR Preventivo
                    </span>
                  </div>
                  <div className={`text-[10px] font-normal mt-0.5 ${activeAnalysis === 'amfe' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    Análisis de Modo y Efecto de Fallas
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </button>

              <button
                onClick={() => setActiveAnalysis('weibull')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between border ${
                  activeAnalysis === 'weibull'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-slate-950 hover:bg-slate-800/80 text-slate-300 border-slate-800'
                }`}
              >
                <div>
                  <div className="font-extrabold flex items-center gap-1.5">
                    <span>Análisis de Weibull</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900/40">
                      &beta; = {weibullBeta}
                    </span>
                  </div>
                  <div className={`text-[10px] font-normal mt-0.5 ${activeAnalysis === 'weibull' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    Curva de Bañera & Predicción Estadística
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PANEL PRINCIPAL DEL ANÁLISIS SELECCIONADO
         ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
        {/* -----------------------------------------------------------------------
            1.1 MTBF (Tiempo Medio Entre Fallas)
           ----------------------------------------------------------------------- */}
        {activeAnalysis === 'mtbf' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  1. Análisis de Tiempos y Frecuencia de Fallas
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  MTBF (Tiempo Medio Entre Fallas / Mean Time Between Failures)
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  Mide el tiempo promedio que un equipo funciona correctamente antes de sufrir una avería.
                  Es el indicador clave para medir la confiabilidad de tus máquinas.{' '}
                  <strong className="text-amber-400">A mayor MTBF, más confiable es el proceso.</strong>
                </p>
              </div>

              <div className="text-right p-4 rounded-2xl bg-slate-950 border border-slate-800 self-start md:self-auto min-w-[210px] shadow-lg">
                <span className="text-[11px] text-slate-400 block font-semibold">MTBF Calculado:</span>
                <span className="text-3xl font-black text-amber-400 font-mono">{mtbfValue} hrs</span>
                <span className="text-[10px] text-slate-500 block">Horas operativas entre averías</span>
              </div>
            </div>

            {/* Formula & Calculation Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Fórmula Aplicada</span>
                <div className="p-2.5 rounded-xl bg-slate-900 font-mono text-amber-300 font-bold text-center border border-slate-800">
                  MTBF = (Horas Operativas - Horas Detenido) / Total Fallas
                </div>
                <p className="text-slate-400 text-[11px]">
                  Mide la duración de los ciclos de operación ininterrumpida descontando los periodos fuera de servicio.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Variables de Operación</span>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Horómetro Operativo:</span>
                    <strong className="text-white">{targetOperatingHours} hrs</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Horas Detenido Total:</span>
                    <strong className="text-rose-400">{totalDowntime} hrs</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Fallas Registradas:</span>
                    <strong className="text-amber-400">{failureCount} eventos</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Evaluación de Confiabilidad</span>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      mtbfValue > 700
                        ? 'bg-emerald-500 shadow-md shadow-emerald-500/50'
                        : mtbfValue > 300
                        ? 'bg-amber-500 shadow-md shadow-amber-500/50'
                        : 'bg-rose-500 shadow-md shadow-rose-500/50'
                    }`}
                  />
                  <span className="font-bold text-white text-sm">
                    {mtbfValue > 700 ? 'Excelente Confiabilidad' : mtbfValue > 300 ? 'Confiabilidad Regular' : 'Atención Crítica Requerida'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Benchmark industrial portuario recomendado: MTBF &gt; 450 hrs continuas sin falla imprevista.
                </p>
              </div>
            </div>

            {/* Interactive SVG Chart: MTBF Timeline Simulation */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-400" />
                  <span>Gráfica de Intervalo Promedio de Operación Segura (MTBF = {mtbfValue} Horas)</span>
                </h4>
                <span className="text-[11px] font-mono text-emerald-400">
                  Uptime estimado: {Math.max(0, targetOperatingHours - totalDowntime)} hrs
                </span>
              </div>

              {/* Visual timeline bar */}
              <div className="w-full bg-slate-900 h-10 rounded-xl overflow-hidden border border-slate-800 flex items-center p-1 relative shadow-inner">
                <div className="bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold h-full rounded-lg flex items-center px-4 flex-1 justify-center border border-emerald-500/30">
                  Operación Continua Segura (MTBF &asymp; {mtbfValue} hrs)
                </div>
                <div className="bg-rose-500 text-slate-950 text-[10px] font-mono font-black h-full px-3 rounded-lg flex items-center justify-center shadow">
                  Falla ({mttrValue}h)
                </div>
              </div>

              {/* Event history table for the selected equipment */}
              {targetRecords.length > 0 ? (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cronología de Eventos Correctivos del Activo
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Fecha</th>
                          <th className="p-2.5">Horómetro</th>
                          <th className="p-2.5">Falla Reportada</th>
                          <th className="p-2.5">Acción Realizada</th>
                          <th className="p-2.5 text-right">Tiempo Detenido</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-950 font-mono text-slate-300">
                        {targetRecords.slice(0, 5).map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-900/50">
                            <td className="p-2.5 font-sans text-white">{rec.date}</td>
                            <td className="p-2.5 text-amber-400">{rec.horometer ? `${rec.horometer}h` : '-'}</td>
                            <td className="p-2.5 font-sans max-w-xs truncate text-slate-200">{rec.failureDescription}</td>
                            <td className="p-2.5 font-sans max-w-xs truncate text-slate-400">{rec.correctiveAction}</td>
                            <td className="p-2.5 text-right text-rose-400 font-bold">{rec.downtimeHours}h</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-center text-slate-400">
                  Este equipo no registra paradas correctivas. Su MTBF coincide con la totalidad de su horómetro operativo ({targetOperatingHours} hrs).
                </div>
              )}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            1.2 MTTF (Tiempo Medio Hasta la Falla)
           ----------------------------------------------------------------------- */}
        {activeAnalysis === 'mttf' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider block">
                  1. Análisis de Tiempos y Frecuencia de Fallas
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  MTTF (Tiempo Medio Hasta la Falla / Mean Time To Failure)
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  Es idéntico al MTBF, pero se utiliza <strong className="text-white">exclusivamente para activos y repuestos que no se pueden reparar</strong>{' '}
                  (como una bombilla, un rodamiento, un retén o un sensor). Mide la vida útil promedio antes de tener que reemplazarlo por completo.
                </p>
              </div>

              <div className="text-right p-4 rounded-2xl bg-slate-950 border border-slate-800 self-start md:self-auto min-w-[210px] shadow-lg">
                <span className="text-[11px] text-slate-400 block font-semibold">MTTF Promedio de Piezas:</span>
                <span className="text-3xl font-black text-red-400 font-mono">{mttfValue} hrs</span>
                <span className="text-[10px] text-slate-500 block">Vida útil antes de sustitución</span>
              </div>
            </div>

            {/* Educational concept box */}
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-3">
              <Info className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block text-white text-sm">
                  Diferencia Clave: MTBF (Activo Reparable) vs MTTF (Elemento No Reparable)
                </strong>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Un equipo pesado (Grillo, Pettibone, Hyster, Terberg) es un sistema <em>reparable</em> al que se le aplica <strong>MTBF</strong>.
                  Sin embargo, sus mangueras hidráulicas de alta presión, sensores de transmisión, correas de goma y rodamientos sellados son elementos que al fallar se <strong>descartan y reemplazan</strong>, por lo que su confiabilidad individual se modela matemáticamente con <strong>MTTF</strong>.
                </p>
              </div>
            </div>

            {/* Non-Repairable Components Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-red-400" />
                <span>Ciclo de Vida de Componentes No Reparables Reemplazados</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-2xl overflow-hidden">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Componente / Repuesto No Reparable</th>
                      <th className="p-3">Subsistema</th>
                      <th className="p-3 text-center">Unidades Sustituidas</th>
                      <th className="p-3 text-right">MTTF Estimado Fabricante</th>
                      <th className="p-3 text-right">Estado de Vida Útil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-950/60 font-mono">
                    {nonRepairableComponents.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="p-3 text-white font-sans font-medium">{item.name}</td>
                        <td className="p-3 text-slate-400 font-sans capitalize">{item.category}</td>
                        <td className="p-3 text-center text-amber-400 font-bold">
                          {item.qty > 0 ? `${item.qty} u.` : '1 cambio programado'}
                        </td>
                        <td className="p-3 text-right text-emerald-400 font-bold">~{item.expectedMttf} hrs</td>
                        <td className="p-3 text-right font-sans">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            Vida Normal
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            1.3 MTTR (Tiempo Medio de Reparación)
           ----------------------------------------------------------------------- */}
        {activeAnalysis === 'mttr' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  1. Análisis de Tiempos y Frecuencia de Fallas
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  MTTR (Tiempo Medio de Reparación / Mean Time To Repair)
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  Mide el tiempo promedio que tarda el equipo técnico en solucionar una avería y poner la máquina en marcha otra vez desde que se detecta el fallo.{' '}
                  <strong className="text-rose-400">Mide la eficiencia, velocidad y preparación del equipo de mantenimiento.</strong>
                </p>
              </div>

              <div className="text-right p-4 rounded-2xl bg-slate-950 border border-slate-800 self-start md:self-auto min-w-[210px] shadow-lg">
                <span className="text-[11px] text-slate-400 block font-semibold">MTTR Promedio:</span>
                <span className="text-3xl font-black text-rose-400 font-mono">{mttrValue} hrs</span>
                <span className="text-[10px] text-slate-500 block">Horas promedio por correctivo</span>
              </div>
            </div>

            {/* MTTR Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Benchmark Industrial</span>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  <span className="text-sm font-bold text-white">Meta Portuaria: &le; 3.0 hrs</span>
                </div>
                <p className="text-xs text-slate-400">
                  {parseFloat(mttrValue) <= 3.5
                    ? '✓ El taller mantiene tiempos de respuesta rápidos y estandarizados.'
                    : '⚠ El MTTR excede el límite ideal. Se sugiere preparar kits de recambio rápido.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Horas Detenido</span>
                <div className="text-2xl font-black font-mono text-rose-400">{totalDowntime} hrs</div>
                <p className="text-xs text-slate-400">
                  Tiempo total acumulado en taller por paradas correctivas.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Intervenciones Realizadas</span>
                <div className="text-2xl font-black font-mono text-white">{failureCount} eventos</div>
                <p className="text-xs text-slate-400">
                  Actividades correctivas registradas en la bitácora técnica.
                </p>
              </div>
            </div>

            {/* MTTR by Subsystem */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Frecuencia y Tiempos de Parada por Subsistema
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {FAILURE_CATEGORIES.map((c) => {
                  const subCount = categoryStats[c.id] || 0;
                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex justify-between items-center"
                    >
                      <span className="text-slate-300 font-medium">{c.label}</span>
                      <span className="font-mono font-bold text-amber-400">
                        {subCount} {subCount === 1 ? 'falla' : 'fallas'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            2.1 Cálculo de Disponibilidad Operativa
           ----------------------------------------------------------------------- */}
        {activeAnalysis === 'availability' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider block">
                  2. Análisis de Disponibilidad y Criticidad
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  Cálculo de Disponibilidad Operativa (Ao)
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  Cruza el <strong className="text-amber-400">MTBF</strong> y el <strong className="text-rose-400">MTTR</strong> para obtener el porcentaje de tiempo real que una máquina está lista para producir y operar sin interrupciones.
                </p>
              </div>

              <div className="text-right p-4 rounded-2xl bg-slate-950 border border-slate-800 self-start md:self-auto min-w-[210px] shadow-lg">
                <span className="text-[11px] text-slate-400 block font-semibold">Disponibilidad Operativa:</span>
                <span className="text-3xl font-black text-emerald-400 font-mono">{operationalAvailability}%</span>
                <span className="text-[10px] text-slate-500 block">Tiempo neto productivo</span>
              </div>
            </div>

            {/* Gauge / Progress representation */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-white">Eficiencia de Disponibilidad Operativa</span>
                <span className="font-mono text-emerald-400 text-lg">{operationalAvailability}%</span>
              </div>

              <div className="w-full bg-slate-900 h-6 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${operationalAvailability}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Fórmula Cruzada:</span>
                  <span className="font-mono font-bold text-blue-400 text-sm">Ao = MTBF / (MTBF + MTTR) * 100</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">MTBF Integrado:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{mtbfValue} hrs operativas</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">MTTR Integrado:</span>
                  <span className="font-mono font-bold text-rose-400 text-sm">{mttrValue} hrs de reparación</span>
                </div>
              </div>
            </div>

            {/* Availability Standards Table */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Niveles de Referencia de Disponibilidad Operacional
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <strong className="block text-white">Clase Mundial (&ge; 95%)</strong>
                  <span>Operación portuaria de alto rendimiento con paradas correctivas mínimas.</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <strong className="block text-white">Aceptable (90% - 94%)</strong>
                  <span>Operación estable con margen para reducir tiempos de atención en taller.</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  <strong className="block text-white">En Riesgo (&lt; 90%)</strong>
                  <span>Pérdidas operativas significativas que requieren auditoría de confiabilidad.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            2.2 Análisis de Criticidad de Activos
           ----------------------------------------------------------------------- */}
        {activeAnalysis === 'criticality' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider block">
                  2. Análisis de Disponibilidad y Criticidad
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  Análisis de Criticidad de Activos
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  Clasifica los equipos en categorías (<strong className="text-rose-400">Alta</strong>,{' '}
                  <strong className="text-amber-400">Media</strong>,{' '}
                  <strong className="text-emerald-400">Baja</strong> criticidad) según el impacto económico, de seguridad y operativo que provocaría su fallo. Te ayuda a saber a qué máquinas aplicarles un mantenimiento más estricto.
                </p>
              </div>

              <div className="text-right p-4 rounded-2xl bg-slate-950 border border-slate-800 self-start md:self-auto min-w-[210px] shadow-lg">
                <span className="text-[11px] text-slate-400 block font-semibold">Nivel de Criticidad:</span>
                <span
                  className={`text-2xl font-black font-mono ${
                    criticalityLevel === 'ALTA'
                      ? 'text-rose-400'
                      : criticalityLevel === 'MEDIA'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  Criticidad {criticalityLevel}
                </span>
                <span className="text-[10px] text-slate-500 block">Índice de Riesgo: {riskIndex} / 25</span>
              </div>
            </div>

            {/* Risk Quadrants */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Clasificación Estratégica por Niveles de Riesgo
                </h4>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold font-mono">
                  <div
                    className={`p-3 rounded-xl border transition ${
                      criticalityLevel === 'BAJA'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    <div>BAJA (1 - 5)</div>
                    <span className="text-[10px] font-normal block mt-1">Mantenimiento estándar</span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border transition ${
                      criticalityLevel === 'MEDIA'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    <div>MEDIA (6 - 11)</div>
                    <span className="text-[10px] font-normal block mt-1">Preventivo frecuente</span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border transition ${
                      criticalityLevel === 'ALTA'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    <div>ALTA (&ge; 12)</div>
                    <span className="text-[10px] font-normal block mt-1">Predictivo intensivo</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-white block">Evaluación de Este Activo:</span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Frecuencia de fallos indexada en nivel <strong className="text-amber-400">{frequencyScore}/5</strong> y consecuencia de parada en nivel <strong className="text-rose-400">{consequenceScore}/5</strong>.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Estrategia de Mantenimiento Recomendada
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Prioridad de Repuestos en Almacén</strong>
                      <span className="text-slate-400 text-[11px]">
                        Mantener stock de seguridad de mangueras hidráulicas y sellos de respuesta inmediata para evitar cuellos de botella en operaciones.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Rutas de Inspección Predictiva</strong>
                      <span className="text-slate-400 text-[11px]">
                        Monitoreo de termografía en bornes eléctricos y análisis de aceite hidráulico cada 200 horas de horómetro.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ranking of fleet criticality */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Matriz Comparativa de Criticidad de la Flota
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-2xl overflow-hidden">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Equipo</th>
                      <th className="p-3">Familia</th>
                      <th className="p-3 text-center">Fallas</th>
                      <th className="p-3 text-center">Horas Parado</th>
                      <th className="p-3 text-center">Riesgo (FxC)</th>
                      <th className="p-3 text-right">Criticidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-950/60 font-mono">
                    {fleetCriticalityList.slice(0, 6).map((item) => (
                      <tr
                        key={item.equipment.id}
                        onClick={() => setSelectedEquipmentId(item.equipment.id)}
                        className={`cursor-pointer transition hover:bg-slate-900/60 ${
                          selectedEquipmentId === item.equipment.id ? 'bg-slate-900/80' : ''
                        }`}
                      >
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <span>{item.equipment.code}</span>
                          {selectedEquipmentId === item.equipment.id && (
                            <span className="text-[10px] text-amber-400 font-sans">✓ seleccionado</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400 font-sans capitalize">
                          {EQUIPMENT_TYPES[item.equipment.type]?.name}
                        </td>
                        <td className="p-3 text-center text-amber-400">{item.failures}</td>
                        <td className="p-3 text-center text-rose-400">{item.downtime}h</td>
                        <td className="p-3 text-center text-white">{item.riskIndex}/25</td>
                        <td className="p-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                              item.level === 'ALTA'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : item.level === 'MEDIA'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {item.level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            3.1 AMFE / AMEF (Análisis de Modo y Efecto de Fallas)
           ----------------------------------------------------------------------- */}
        {activeAnalysis === 'amfe' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  3. Análisis Avanzados de Confiabilidad
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  AMFE / AMEF (Análisis de Modo y Efecto de Fallas)
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  Una metodología preventiva que identifica de forma sistemática cómo puede fallar un proceso o máquina, cuáles serían las consecuencias y qué acciones tomar para evitarlo antes de que ocurra.{' '}
                  <strong className="text-emerald-400">Calcula el NPR (Número de Prioridad de Riesgo = S &times; O &times; D)</strong>.
                </p>
              </div>

              <div className="text-right p-4 rounded-2xl bg-slate-950 border border-slate-800 self-start md:self-auto min-w-[210px] shadow-lg">
                <span className="text-[11px] text-slate-400 block font-semibold">Metodología Técnica:</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">FMEA / AMFE</span>
                <span className="text-[10px] text-slate-500 block">NPR = Severidad &times; Ocurrencia &times; Detección</span>
              </div>
            </div>

            {/* Interactive AMFE Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-2xl overflow-hidden">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Subsistema / Modo de Falla</th>
                    <th className="p-3">Causa Potencial Raíz</th>
                    <th className="p-3">Efecto en la Operación</th>
                    <th className="p-3 text-center" title="Severidad (1 a 10)">
                      Sev (S)
                    </th>
                    <th className="p-3 text-center" title="Ocurrencia (1 a 10)">
                      Ocur (O)
                    </th>
                    <th className="p-3 text-center" title="Detección (1 a 10)">
                      Det (D)
                    </th>
                    <th className="p-3 text-center font-bold text-amber-400" title="NPR = S x O x D">
                      NPR
                    </th>
                    <th className="p-3">Acción Preventiva Recomendada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 text-slate-200">
                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-white">Rotura de Manguera Hidráulica Principal</td>
                    <td className="p-3 text-slate-400">Fatiga de material / fricción continua con chasis</td>
                    <td className="p-3 text-slate-300">Pérdida súbita de presión de elevación y fuga de aceite</td>
                    <td className="p-3 text-center font-mono">8</td>
                    <td className="p-3 text-center font-mono">4</td>
                    <td className="p-3 text-center font-mono">3</td>
                    <td className="p-3 text-center font-mono font-bold text-rose-400 bg-rose-500/10">96</td>
                    <td className="p-3 text-emerald-300 font-sans">
                      Instalar camisa espiral antiroce y reemplazo preventivo por horómetro a 2500h
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-white">Falla de Alternador / Motor de Arranque 24V</td>
                    <td className="p-3 text-slate-400">Desgaste de escobillas de carbón y sulfatación</td>
                    <td className="p-3 text-slate-300">Equipo inoperativo en muelle de maniobras</td>
                    <td className="p-3 text-center font-mono">7</td>
                    <td className="p-3 text-center font-mono">3</td>
                    <td className="p-3 text-center font-mono">4</td>
                    <td className="p-3 text-center font-mono font-bold text-amber-400 bg-amber-500/10">84</td>
                    <td className="p-3 text-emerald-300 font-sans">
                      Chequeo de tensión de carga y ajuste de bornes cada 500h en inspección de rutina
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-white">Fuga en Sellos de Cilindro Telescópico</td>
                    <td className="p-3 text-slate-400">Contaminación por partículas abrasivas del entorno</td>
                    <td className="p-3 text-slate-300">Goteo de fluido hidráulico y descenso involuntario de mástil</td>
                    <td className="p-3 text-center font-mono">6</td>
                    <td className="p-3 text-center font-mono">4</td>
                    <td className="p-3 text-center font-mono">2</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-400 bg-emerald-500/10">48</td>
                    <td className="p-3 text-emerald-300 font-sans">
                      Limpieza e inspección de rascadores de polvo y sustitución de sellos de vitón
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-white">Pérdida de Presión en Línea de Frenos de Aire</td>
                    <td className="p-3 text-slate-400">Filtro secador saturado y válvula reguladora trabada</td>
                    <td className="p-3 text-slate-300">Bloqueo automático de ruedas de tracción / parada no programada</td>
                    <td className="p-3 text-center font-mono">9</td>
                    <td className="p-3 text-center font-mono">2</td>
                    <td className="p-3 text-center font-mono">3</td>
                    <td className="p-3 text-center font-mono font-bold text-amber-400 bg-amber-500/10">54</td>
                    <td className="p-3 text-emerald-300 font-sans">
                      Drenaje semanal de tanques de aire y cambio de cartucho secador cada 1200h
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-white block">Criterio de Priorización por NPR:</span>
              <div className="flex flex-wrap gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-300">NPR &ge; 100: Intervención Inmediata</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-300">NPR 50 - 99: Plan Preventivo Recomendado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">NPR &lt; 50: Riesgo Aceptable / Monitoreo Normal</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            3.2 Análisis de Weibull
           ----------------------------------------------------------------------- */}
        {activeAnalysis === 'weibull' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  3. Análisis Avanzados de Confiabilidad
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  Análisis Estadístico de Weibull & Curva de la Bañera
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  Una herramienta estadística avanzada que utiliza datos históricos de fallas para predecir cuándo es más probable que falle un equipo (por desgaste inicial, fallas aleatorias o envejecimiento).
                </p>
              </div>

              <div className="text-right p-4 rounded-2xl bg-slate-950 border border-slate-800 self-start md:self-auto min-w-[210px] shadow-lg">
                <span className="text-[11px] text-slate-400 block font-semibold">Parámetro de Forma &beta;:</span>
                <span className="text-3xl font-black text-emerald-400 font-mono">&beta; = {weibullBeta}</span>
                <span className="text-[10px] text-slate-500 block">&eta; = ~{weibullEta} hrs (Vida Característica)</span>
              </div>
            </div>

            {/* Weibull Bathtub Visual */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-bold text-white uppercase tracking-wider">
                  Etapa Actual en la Curva de la Bañera
                </span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                  {weibullPhase}
                </span>
              </div>

              {/* Graphic Representation of Bathtub Curve */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-xs pt-2">
                <div
                  className={`p-4 rounded-2xl border transition ${
                    weibullBeta < 1
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-extrabold text-sm text-white">Fase I: Fallas Infantiles</div>
                  <div className="font-mono text-[11px] mt-1 text-amber-400">&beta; &lt; 1 (Tasa decreciente)</div>
                  <p className="text-[11px] text-slate-300 mt-2">
                    Averías por ajuste inicial, defectos de montaje o componentes con fallas prematuras.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border transition ${
                    weibullBeta >= 1 && weibullBeta <= 1.3
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-extrabold text-sm text-white">Fase II: Vida Útil Normal</div>
                  <div className="font-mono text-[11px] mt-1 text-emerald-400">&beta; &asymp; 1 (Tasa constante)</div>
                  <p className="text-[11px] text-slate-300 mt-2">
                    Fallas aleatorias e independientes de la edad, causadas por sobrecargas operacionales imprevistas.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border transition ${
                    weibullBeta > 1.3
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-extrabold text-sm text-white">Fase III: Desgaste / Fatiga</div>
                  <div className="font-mono text-[11px] mt-1 text-rose-400">&beta; &gt; 1 (Tasa creciente)</div>
                  <p className="text-[11px] text-slate-300 mt-2">
                    Envejecimiento cíclico, fatiga de metales, erosión y pérdida de holgura por horómetro acumulado.
                  </p>
                </div>
              </div>

              {/* Technical Interpretation */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                <span className="font-bold text-white block">Diagnóstico Predictivo de Confiabilidad:</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Con un horómetro acumulado de <strong className="text-amber-400 font-mono">{currentHours} horas</strong> y un parámetro &beta; de {weibullBeta}, la probabilidad de falla responde a su ciclo de vida característico. Se recomienda programar un reacondicionamiento preventivo integral antes de alcanzar la vida característica &eta; (~{weibullEta} hrs) para evitar fallas catastróficas.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
