import React, { useState, useEffect } from 'react';
import { X, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Equipment } from '../types';
import { detectEquipmentType, EQUIPMENT_TYPES } from '../utils/equipmentPrefix';

interface EquipmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (equipment: Equipment) => void;
  initialData?: Equipment | null;
  existingCodes: string[];
}

export const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingCodes,
}) => {
  const [code, setCode] = useState('');

  // Live auto-detection strictly based on prefix rules:
  // Starts with 20 -> Grillo
  // Starts with 40 -> Pettibone
  // Starts with 45 -> Hyster
  // Starts with 50 -> TT / Terberg
  const detection = detectEquipmentType(code);
  const currentTypeDef = EQUIPMENT_TYPES[detection.type];

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
    } else {
      setCode('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      alert('Por favor ingrese el número de equipo (ej: 20-2413).');
      return;
    }

    if (
      (!initialData || initialData.code !== cleanCode) &&
      existingCodes.includes(cleanCode)
    ) {
      alert(`Ya existe un equipo registrado con el número "${cleanCode}".`);
      return;
    }

    const prefix = cleanCode.replace(/[^0-9]/g, '').slice(0, 2) || '00';

    const equipment: Equipment = {
      id:
        initialData?.id ||
        `eq-${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      code: cleanCode,
      prefix,
      type: detection.type,
      brandModel: initialData?.brandModel || currentTypeDef.defaultModel,
      serialNumber: initialData?.serialNumber,
      location: initialData?.location || 'Patio Principal',
      operationalStatus: initialData?.operationalStatus || 'operativo',
      hoursOperating: initialData?.hoursOperating ?? 0,
      notes: initialData?.notes,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(equipment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-6">
        {/* Dynamic Photo Header */}
        <div className="relative h-36 w-full bg-slate-950 overflow-hidden">
          <img
            src={currentTypeDef.image}
            alt={currentTypeDef.name}
            className="w-full h-full object-cover object-center opacity-50 transition-all duration-500 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-slate-950/40" />

          {/* Header Bar */}
          <div className="absolute top-4 left-6 right-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center backdrop-blur-md">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">
                  {initialData ? 'Modificar Equipo' : 'Registrar Nuevo Equipo'}
                </h2>
                <p className="text-[11px] text-slate-300">
                  Detección automática de familia por número de equipo
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/80 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Detected Family Badge on photo bottom */}
          <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-lg border backdrop-blur-md ${currentTypeDef.color.badge}`}
              >
                {detection.matchedRule ? `Familia ${currentTypeDef.name}` : 'Escriba número...'}
              </span>
              <span className="text-xs font-bold text-white drop-shadow">
                {detection.matchedRule ? currentTypeDef.defaultModel : 'Detección automática por prefijo'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Machine Photo Preview Card with live indicator */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <img
              src={currentTypeDef.image}
              alt={currentTypeDef.name}
              className="h-16 w-16 rounded-xl object-cover border border-slate-700 flex-shrink-0"
            />
            <div className="text-xs space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">
                  {currentTypeDef.fullName}
                </span>
                {detection.matchedRule && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="h-3 w-3" />
                    Detectado
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {detection.matchedRule
                  ? `Identificado por el prefijo ${detection.prefix} (${currentTypeDef.name})`
                  : 'Prefijos: 20 (Grillo), 40 (Pettibone), 45 (Hyster), 50 (TT/Terberg)'}
              </p>
            </div>
          </div>

          {/* Input 1: Número de equipo (ej: 20-2413) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Número de Equipo <span className="text-red-500">*</span></span>
              <span className="text-[11px] text-slate-400 font-mono font-normal">
                ej: 20-2413, 40-0012, 50-0045
              </span>
            </label>
            <input
              type="text"
              autoFocus
              placeholder="Ej: 20-2413"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-base text-red-400 font-mono font-black tracking-wide placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
            />

            {/* Quick prefix helpers */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500 mr-1">Prefijos:</span>
              <button
                type="button"
                onClick={() => setCode('20-')}
                className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition"
              >
                20- (Grillo)
              </button>
              <button
                type="button"
                onClick={() => setCode('40-')}
                className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 transition"
              >
                40- (Pettibone)
              </button>
              <button
                type="button"
                onClick={() => setCode('45-')}
                className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
              >
                45- (Hyster)
              </button>
              <button
                type="button"
                onClick={() => setCode('50-')}
                className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/30 hover:bg-orange-500/20 transition"
              >
                50- (TT/Terberg)
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/40 transition active:scale-95 flex items-center gap-2 ring-1 ring-red-400/30"
            >
              <span>Registrar Equipo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
