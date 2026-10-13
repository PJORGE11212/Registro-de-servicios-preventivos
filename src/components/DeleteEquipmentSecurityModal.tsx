import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, X, Trash2, AlertTriangle, KeyRound } from 'lucide-react';
import { Equipment } from '../types';
import { EQUIPMENT_TYPES } from '../utils/equipmentPrefix';

interface DeleteEquipmentSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  onConfirmDelete: (equipmentId: string) => void;
  recordCount: number;
}

const REQUIRED_PIN = '1234';

export const DeleteEquipmentSecurityModal: React.FC<DeleteEquipmentSecurityModalProps> = ({
  isOpen,
  onClose,
  equipment,
  onConfirmDelete,
  recordCount,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen || !equipment) return null;

  const typeDef = EQUIPMENT_TYPES[equipment.type];

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === REQUIRED_PIN) {
      onConfirmDelete(equipment.id);
      onClose();
    } else {
      setError(true);
      setErrorMessage('Contraseña incorrecta. Ingrese la clave de autorización (1234).');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-rose-900/50 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-6">
        {/* Header with warning accent */}
        <div className="px-6 py-5 border-b border-slate-800 bg-rose-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-500/10">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Autorización Requerida</h3>
              <p className="text-xs text-rose-300/80 font-medium">
                Eliminación de equipo de flota
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
        <form onSubmit={handleConfirm} className="p-6 space-y-5">
          {/* Machine summary card */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <img
              src={typeDef.image}
              alt={equipment.code}
              className="h-14 w-14 rounded-xl object-cover border border-slate-700 flex-shrink-0"
            />
            <div className="text-xs space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono font-black px-2 py-0.5 rounded-md border text-xs ${typeDef.color.badge}`}
                >
                  {equipment.code}
                </span>
                <span className="font-extrabold text-white truncate">{typeDef.name}</span>
              </div>
              <p className="text-slate-400 text-[11px] truncate">{equipment.brandModel}</p>
              <p className="text-slate-500 text-[10px]">
                Ubicación: {equipment.location || 'Patio General'}
              </p>
            </div>
          </div>

          {/* Critical Warning */}
          <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-rose-200">
              <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />
              <span>Esta acción es irreversible</span>
            </div>
            <p className="text-[11px] text-rose-300/80 pl-6 leading-relaxed">
              Al eliminar la máquina <strong className="text-rose-200">{equipment.code}</strong>, también se removerán{' '}
              {recordCount > 0 ? (
                <span className="font-bold underline text-white">
                  sus {recordCount} {recordCount === 1 ? 'registro' : 'registros'} de mantenimiento correctivo
                </span>
              ) : (
                'todos sus datos asociados'
              )}
              .
            </p>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                Contraseña de Seguridad
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Clave de 4 dígitos</span>
            </label>

            <div className="relative">
              <input
                type="password"
                maxLength={8}
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                  setErrorMessage('');
                }}
                placeholder="Ingresa la contraseña..."
                className={`w-full bg-slate-950 border rounded-xl pl-4 pr-10 py-3 text-sm text-center text-white tracking-widest font-mono font-black focus:outline-none transition ${
                  error
                    ? 'border-rose-500 focus:border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-slate-700 focus:border-amber-500'
                }`}
              />
              <div className="absolute right-3.5 top-3.5 text-slate-500 pointer-events-none">
                <KeyRound className="h-4 w-4" />
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-rose-400 animate-pulse text-center">
                {errorMessage}
              </p>
            )}

            {/* Quick digit helpers for ease of use */}
            <div className="flex justify-center gap-1.5 pt-1">
              {['1', '2', '3', '4'].map((digit) => (
                <button
                  type="button"
                  key={digit}
                  onClick={() => setPassword((prev) => (prev.length < 4 ? prev + digit : prev))}
                  className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition border border-slate-700"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPassword('')}
                className="px-2.5 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 text-[10px] font-medium transition border border-slate-800"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Modal Footer */}
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
              disabled={password.length === 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition active:scale-95 shadow-lg ${
                password.length > 0
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              <span>Confirmar Eliminación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
