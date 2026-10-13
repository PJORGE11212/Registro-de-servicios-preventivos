import React, { useState } from 'react';
import { X, Layers, Plus, CheckCircle, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Equipment } from '../types';
import { detectEquipmentType, EQUIPMENT_TYPES } from '../utils/equipmentPrefix';
import { generateEquipmentBatch } from '../utils/storage';

interface BatchGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateBatch: (newEquipments: Equipment[]) => void;
  existingCodes: string[];
}

export const BatchGeneratorModal: React.FC<BatchGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerateBatch,
  existingCodes,
}) => {
  const [selectedPrefix, setSelectedPrefix] = useState<'20' | '40' | '45' | '50' | 'custom'>('50');
  const [customPrefix, setCustomPrefix] = useState('');
  const [count, setCount] = useState<number>(10);
  const [startNumber, setStartNumber] = useState<number>(1);
  const [padLength, setPadLength] = useState<number>(4);
  const [brandModel, setBrandModel] = useState('');
  const [location, setLocation] = useState('Patio de Maniobras');

  if (!isOpen) return null;

  const actualPrefix = selectedPrefix === 'custom' ? customPrefix.trim() : selectedPrefix;
  const detection = detectEquipmentType(actualPrefix);
  const typeDef = EQUIPMENT_TYPES[detection.type];

  // Preview codes
  const previewCodes: string[] = [];
  const safeCount = Math.min(Math.max(1, count), 150);
  for (let i = 0; i < Math.min(safeCount, 6); i++) {
    const num = startNumber + i;
    const padded = String(num).padStart(padLength, '0');
    previewCodes.push(`${actualPrefix}-${padded}`);
  }

  const lastNum = startNumber + safeCount - 1;
  const lastCode = `${actualPrefix}-${String(lastNum).padStart(padLength, '0')}`;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualPrefix) {
      alert('Por favor ingrese o seleccione un prefijo.');
      return;
    }
    if (safeCount <= 0) {
      alert('La cantidad de equipos debe ser mayor a cero.');
      return;
    }

    const generated = generateEquipmentBatch({
      prefix: actualPrefix,
      startNumber: Math.max(1, startNumber),
      count: safeCount,
      padLength,
      brandModel: brandModel.trim() || typeDef.defaultModel,
      location,
    });

    const duplicates = generated.filter((g) => existingCodes.includes(g.code));
    if (duplicates.length > 0) {
      const proceed = confirm(
        `Atención: ${duplicates.length} de los códigos generados ya existen (ej: ${duplicates[0].code}). ¿Desea omitir los duplicados y agregar el resto?`
      );
      if (!proceed) return;
    }

    const uniqueNew = generated.filter((g) => !existingCodes.includes(g.code));
    if (uniqueNew.length === 0) {
      alert('Todos los equipos generados ya existían en la flota.');
      return;
    }

    onGenerateBatch(uniqueNew);
    onClose();
  };

  const familyOptions = [
    { prefix: '20', type: 'grillo' as const, title: 'Grillos', sample: '20-0001' },
    { prefix: '40', type: 'pettibone' as const, title: 'Pettibone (PTT)', sample: '40-0001' },
    { prefix: '45', type: 'hyster' as const, title: 'Hyster', sample: '45-0001' },
    { prefix: '50', type: 'terberg' as const, title: 'TT / Terberg', sample: '50-0001' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Generador Rápido de Flota por Cantidad
              </h2>
              <p className="text-xs text-slate-400">
                Selecciona la familia con su foto de referencia y especifica la cantidad a crear
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
        <form onSubmit={handleGenerate} className="p-6 space-y-6">
          {/* Step 1: Visual Family Selection with machine photos */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              1. Seleccione la Familia de Equipo (Foto de Referencia)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {familyOptions.map((opt) => {
                const isSelected = selectedPrefix === opt.prefix;
                const def = EQUIPMENT_TYPES[opt.type];
                return (
                  <button
                    key={opt.prefix}
                    type="button"
                    onClick={() => {
                      setSelectedPrefix(opt.prefix as any);
                      setBrandModel(def.defaultModel);
                    }}
                    className={`relative overflow-hidden rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between group ${
                      isSelected
                        ? 'border-red-600 bg-slate-900 ring-2 ring-red-500/40 shadow-lg shadow-red-950/30'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    {/* Machine Photo */}
                    <div className="h-20 w-full overflow-hidden bg-slate-950 relative">
                      <img
                        src={def.image}
                        alt={def.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                      <span className="absolute top-1.5 left-1.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-white border border-white/20">
                        Prefijo {opt.prefix}
                      </span>
                    </div>

                    <div className="p-2.5">
                      <div className="text-xs font-extrabold text-white truncate">{opt.title}</div>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                        ej: {opt.sample}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Quantity & Range parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Cantidad de Equipos <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="150"
                value={count}
                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-red-400 font-black font-mono focus:outline-none focus:border-red-500 text-center"
              />
              <div className="flex gap-1 mt-1.5 justify-center">
                {[5, 10, 20, 30].map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCount(c)}
                    className="text-[10px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Número Inicial
              </label>
              <input
                type="number"
                min="1"
                value={startNumber}
                onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-red-500 text-center"
              />
              <span className="text-[10px] text-slate-500 block text-center mt-1">
                Comienza en #{startNumber}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Formato de Dígitos
              </label>
              <select
                value={padLength}
                onChange={(e) => setPadLength(parseInt(e.target.value) || 4)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              >
                <option value={4}>4 Dígitos (0001 - 9999)</option>
                <option value={3}>3 Dígitos (001 - 999)</option>
                <option value={2}>2 Dígitos (01 - 99)</option>
              </select>
              <span className="text-[10px] text-slate-500 block text-center mt-1">
                Ej: {actualPrefix}-{String(startNumber).padStart(padLength, '0')}
              </span>
            </div>
          </div>

          {/* Model and Location presets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Modelo / Descripción Base
              </label>
              <input
                type="text"
                placeholder={typeDef.defaultModel}
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Ubicación Inicial Asignada
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-red-500" />
                Vista Previa de Códigos Generados ({safeCount} Equipos)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Rango: {previewCodes[0]} → {lastCode}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {previewCodes.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-red-400 shadow-sm"
                >
                  {c}
                </span>
              ))}
              {safeCount > 6 && (
                <span className="px-2 py-1 text-xs text-slate-500 font-mono">
                  ... y {safeCount - 6} más hasta {lastCode}
                </span>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/40 transition active:scale-95 flex items-center gap-2 ring-1 ring-red-400/30"
            >
              <Plus className="h-4 w-4" />
              <span>Generar e Ingresar {safeCount} Equipos</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
