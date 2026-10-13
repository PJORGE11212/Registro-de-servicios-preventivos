import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Lock,
  X,
  Trash2,
  AlertTriangle,
  KeyRound,
  Wrench,
  Clock,
  Calendar,
  Package,
  User,
} from 'lucide-react';
import { CorrectiveMaintenanceRecord } from '../types';
import { EQUIPMENT_TYPES } from '../utils/equipmentPrefix';
import { formatDisplayDate } from './DateRangeFilter';

interface DeleteMaintenanceSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CorrectiveMaintenanceRecord | null;
  onConfirmDelete: (recordId: string) => void;
}

const REQUIRED_PIN = '1234';

export const DeleteMaintenanceSecurityModal: React.FC<DeleteMaintenanceSecurityModalProps> = ({
  isOpen,
  onClose,
  record,
  onConfirmDelete,
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

  if (!isOpen || !record) return null;

  const typeDef = EQUIPMENT_TYPES[record.equipmentType] || EQUIPMENT_TYPES.otro;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === REQUIRED_PIN) {
      onConfirmDelete(record.id);
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
                Eliminación de Registro Correctivo
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
          {/* Record summary card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono font-black px-2.5 py-0.5 rounded-lg border text-xs ${typeDef.color.badge}`}
                >
                  {record.equipmentCode}
                </span>
                <span className="text-xs font-bold text-white">{typeDef.name}</span>
              </div>
              <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>{formatDisplayDate(record.date)}</span>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <p className="text-slate-200 line-clamp-2">
                <strong className="text-amber-400 font-semibold mr-1">Falla:</strong>
                {record.failureDescription}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span className="flex items-center gap-1 text-amber-400 font-mono font-bold">
                  <Clock className="h-3 w-3" />
                  {record.downtimeHours} hrs detenido
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3 text-slate-500" />
                  {record.technician}
                </span>
              </div>
            </div>
          </div>

          {/* Critical Warning */}
          <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-rose-200">
              <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />
              <span>Esta acción es irreversible</span>
            </div>
            <p className="text-[11px] text-rose-300/80 pl-6 leading-relaxed">
              El registro de mantenimiento correctivo será eliminado permanentemente de la bitácora y se recalcularán los indicadores de confiabilidad (<strong className="text-rose-200">MTBF, MTTR y Disponibilidad</strong>).
            </p>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                Contraseña de Seguridad
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Clave: 1234</span>
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
              <p className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 animate-fadeIn">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}

            <p className="text-[11px] text-slate-500 text-center">
              Para autorizar la eliminación de este correctivo, ingrese la contraseña de administrador.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!password}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-lg ${
                password
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar Correctivo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
