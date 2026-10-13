import React, { useState, useEffect } from 'react';
import {
  X,
  Wrench,
  Clock,
  Calendar,
  AlertTriangle,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  Package,
  Layers,
  Gauge,
  Check,
} from 'lucide-react';
import {
  Equipment,
  CorrectiveMaintenanceRecord,
  MaintenanceItem,
  FailureCategory,
} from '../types';
import { FAILURE_CATEGORIES, EQUIPMENT_TYPES } from '../utils/equipmentPrefix';

interface MaintenanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: CorrectiveMaintenanceRecord) => void;
  equipments: Equipment[];
  initialData?: CorrectiveMaintenanceRecord | null;
  selectedEquipmentId?: string;
}

const COMMON_PARTS_SUGGESTIONS = [
  'Manguera hidráulica de alta presión',
  'Juego de sellos / Kit O-rings',
  'Motor de arranque 24V',
  'Alternador / Regulador de voltaje',
  'Bomba hidráulica principal',
  'Cruceta de cardán y copas',
  'Zapatas / Balatas de freno',
  'Cilindro de freno / Bombín',
  'Filtro de combustible primario',
  'Filtro hidráulico de retorno',
  'Correa de accesorios / ventilador',
  'Válvula de control distribuidora',
];

export const MaintenanceFormModal: React.FC<MaintenanceFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  equipments,
  initialData,
  selectedEquipmentId,
}) => {
  const [equipmentId, setEquipmentId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [horometer, setHorometer] = useState<number | string>(0);
  const [failureCategories, setFailureCategories] = useState<FailureCategory[]>(['hidraulico']);
  const [failureDescription, setFailureDescription] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [downtimeHours, setDowntimeHours] = useState<number>(0);
  const [technician, setTechnician] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<MaintenanceItem[]>([]);

  // Item form inside modal
  const [newItemName, setNewItemName] = useState('');
  const [newItemAction, setNewItemAction] = useState<'cambiado' | 'reacondicionado'>('cambiado');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemPartNumber, setNewItemPartNumber] = useState('');

  useEffect(() => {
    if (initialData) {
      setEquipmentId(initialData.equipmentId);
      setDate(initialData.date);
      setTime(initialData.time || '');
      setHorometer(initialData.horometer ?? 0);

      // Support multi-categories
      if (initialData.failureCategories && initialData.failureCategories.length > 0) {
        setFailureCategories(initialData.failureCategories);
      } else if (initialData.failureCategory) {
        setFailureCategories([initialData.failureCategory]);
      } else {
        setFailureCategories(['hidraulico']);
      }

      setFailureDescription(initialData.failureDescription);
      setCorrectiveAction(initialData.correctiveAction);
      setDowntimeHours(initialData.downtimeHours);
      setTechnician(initialData.technician);
      setNotes(initialData.notes || '');
      setItems(initialData.items || []);
    } else {
      // Default new record
      const today = new Date();
      setDate(today.toISOString().slice(0, 10));
      setTime(today.toTimeString().slice(0, 5));
      const targetId = selectedEquipmentId || (equipments[0]?.id ?? '');
      setEquipmentId(targetId);

      const targetEq = equipments.find((e) => e.id === targetId);
      setHorometer(targetEq?.hoursOperating ?? 0);

      setFailureCategories(['hidraulico']);
      setFailureDescription('');
      setCorrectiveAction('');
      setDowntimeHours(2);
      setTechnician('');
      setNotes('');
      setItems([]);
    }
  }, [initialData, selectedEquipmentId, equipments, isOpen]);

  if (!isOpen) return null;

  const selectedEquipment = equipments.find((e) => e.id === equipmentId);

  const handleEquipmentChange = (newId: string) => {
    setEquipmentId(newId);
    const eq = equipments.find((e) => e.id === newId);
    if (eq && eq.hoursOperating !== undefined) {
      setHorometer(eq.hoursOperating);
    }
  };

  const toggleCategory = (catId: FailureCategory) => {
    setFailureCategories((prev) => {
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((c) => c !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const item: MaintenanceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newItemName.trim(),
      action: newItemAction,
      quantity: Math.max(1, Number(newItemQuantity) || 1),
      partNumber: newItemPartNumber.trim() || undefined,
    };
    setItems((prev) => [...prev, item]);
    setNewItemName('');
    setNewItemPartNumber('');
    setNewItemQuantity(1);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentId) {
      alert('Por favor seleccione un equipo.');
      return;
    }
    if (failureCategories.length === 0) {
      alert('Por favor seleccione al menos una categoría de falla.');
      return;
    }
    if (!failureDescription.trim()) {
      alert('Por favor describa la falla presentada.');
      return;
    }
    if (!correctiveAction.trim()) {
      alert('Por favor describa la actividad correctiva realizada.');
      return;
    }

    const eq = equipments.find((e) => e.id === equipmentId);
    if (!eq) return;

    const record: CorrectiveMaintenanceRecord = {
      id: initialData?.id || `rec-${Date.now()}`,
      equipmentId: eq.id,
      equipmentCode: eq.code,
      equipmentType: eq.type,
      date,
      time,
      horometer: Number(horometer) || 0,
      failureCategory: failureCategories[0] || 'otro',
      failureCategories,
      failureDescription: failureDescription.trim(),
      correctiveAction: correctiveAction.trim(),
      items,
      downtimeHours: Number(downtimeHours) || 0,
      technician: technician.trim() || 'No especificado',
      status: 'completado', // Auto-completed as requested (maintenance status removed)
      notes: notes.trim() || undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    onSave(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'Editar Actividad Correctiva' : 'Registrar Mantenimiento Correctivo'}
              </h2>
              <p className="text-xs text-slate-400">
                Falla, subsistemas afectados, horómetro, repuestos y horas detenido
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Section 1: Equipment Selection & Timing */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            {/* Equipment Selector */}
            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Equipo Intervenido <span className="text-red-500">*</span>
              </label>
              <select
                value={equipmentId}
                onChange={(e) => handleEquipmentChange(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
              >
                <option value="">-- Seleccionar Equipo --</option>
                {equipments.map((eq) => {
                  const typeDef = EQUIPMENT_TYPES[eq.type];
                  return (
                    <option key={eq.id} value={eq.id}>
                      {eq.code} | {typeDef.name} ({eq.brandModel})
                    </option>
                  );
                })}
              </select>

              {selectedEquipment && (
                <div className="mt-3 flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <img
                    src={EQUIPMENT_TYPES[selectedEquipment.type]?.image}
                    alt={selectedEquipment.code}
                    className="h-12 w-12 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                  />
                  <div className="flex-1 text-xs space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          EQUIPMENT_TYPES[selectedEquipment.type]?.color.badge || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {selectedEquipment.code}
                      </span>
                      <span className="font-extrabold text-white">
                        {EQUIPMENT_TYPES[selectedEquipment.type]?.name}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-2">
                      <span>{selectedEquipment.brandModel}</span>
                      <span>•</span>
                      <span>Horómetro actual: {selectedEquipment.hoursOperating || 0} hrs</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Horómetro Register Input */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5 text-red-500" />
                  Horómetro <span className="text-red-500">*</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={horometer}
                  onChange={(e) => setHorometer(e.target.value)}
                  required
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3 pr-10 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-red-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 pointer-events-none font-mono">
                  Hrs
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Horas de uso al momento de la falla
              </span>
            </div>

            {/* Downtime Hours */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Horas Detenido <span className="text-red-500">*</span></span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={downtimeHours}
                  onChange={(e) => setDowntimeHours(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3 pr-10 py-2 text-sm text-red-400 font-bold font-mono focus:outline-none focus:border-red-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 pointer-events-none font-mono">
                  Hrs
                </span>
              </div>
              <div className="flex gap-1 mt-1.5">
                {[1, 2, 4, 8].map((h) => (
                  <button
                    type="button"
                    key={h}
                    onClick={() => setDowntimeHours(h)}
                    className="text-[10px] px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Date & Multiple Failure Categories */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Fecha del Mantenimiento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Hora de Intervención (Opcional)
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* MULTI-SELECT FAILURE CATEGORIES */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-red-500" />
                  <span>Categorías de Falla (Elige una o más) <span className="text-red-500">*</span></span>
                </label>
                <span className="text-xs font-bold text-red-400 font-mono">
                  {failureCategories.length} {failureCategories.length === 1 ? 'categoría' : 'categorías'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
                {FAILURE_CATEGORIES.map((cat) => {
                  const isSelected = failureCategories.includes(cat.id);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition flex items-center justify-between border ${
                        isSelected
                          ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/30 ring-1 ring-red-400'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <span className="truncate">{cat.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Failure Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                Falla Presentada (Síntoma / Diagnóstico) <span className="text-red-500">*</span>
              </span>
            </label>
            <textarea
              rows={3}
              value={failureDescription}
              onChange={(e) => setFailureDescription(e.target.value)}
              placeholder="Ej: Fuga severa de aceite hidráulico en manguera de alimentación de la quinta rueda; pérdida total de presión al elevar remolque..."
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500 placeholder-slate-500 leading-relaxed"
            />
          </div>

          {/* Section 4: Corrective Action Performed */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Actividad Correctiva Realizada <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              placeholder="Ej: Se desmontó la manguera dañada, se prensó nueva manguera hidráulica 3/4 R2AT, se reemplazaron sellos de niples y se purgó el circuito..."
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500 placeholder-slate-500 leading-relaxed"
            />
          </div>

          {/* Section 5: Elementos Cambiados o Reacondicionados */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-bold text-white">
                  Elementos Cambiados o Reacondicionados
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {items.length} {items.length === 1 ? 'elemento' : 'elementos'} agregados
              </span>
            </div>

            {/* Add Item Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div className="sm:col-span-5">
                <input
                  type="text"
                  placeholder="Nombre de pieza o componente..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem();
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={newItemAction}
                  onChange={(e) => setNewItemAction(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 font-medium"
                >
                  <option value="cambiado">🔄 Cambiado (Nuevo)</option>
                  <option value="reacondicionado">🛠 Reacondicionado</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <input
                  type="number"
                  min="1"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                  placeholder="Cant."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white text-center focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 transition shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Añadir</span>
                </button>
              </div>

              <div className="sm:col-span-12">
                <input
                  type="text"
                  placeholder="N° de Parte / Código de repuesto (Opcional, ej: HYD-34-R2AT)"
                  value={newItemPartNumber}
                  onChange={(e) => setNewItemPartNumber(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-md px-2.5 py-1 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-600 font-mono"
                />
              </div>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 mr-1">Frecuentes:</span>
              {COMMON_PARTS_SUGGESTIONS.slice(0, 5).map((part) => (
                <button
                  type="button"
                  key={part}
                  onClick={() => {
                    setNewItemName(part);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
                >
                  + {part}
                </button>
              ))}
            </div>

            {/* List of Current Items */}
            {items.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500 italic bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                No se han registrado elementos cambiados o reacondicionados para esta intervención.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 font-semibold w-5 text-center">
                        {idx + 1}.
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.action === 'cambiado'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.action === 'cambiado' ? 'Cambiado' : 'Reacondicionado'}
                      </span>
                      <span className="text-white font-medium">{item.name}</span>
                      <span className="text-red-400 font-mono font-bold">
                        x{item.quantity}
                      </span>
                      {item.partNumber && (
                        <span className="text-slate-400 font-mono text-[11px] bg-slate-800 px-1.5 py-0.5 rounded">
                          PN: {item.partNumber}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition"
                      title="Eliminar repuesto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Technician & Extra Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                Técnico / Mecánico Responsable
              </label>
              <input
                type="text"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                placeholder="Ej: Mec. Carlos Mendoza / Turno A"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Observaciones / Pruebas Posteriores
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Requiere inspección de apriete a las 50 hrs de uso"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/40 transition active:scale-95 ring-1 ring-red-400/30"
            >
              {initialData ? 'Guardar Cambios' : 'Registrar Actividad Correctiva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
