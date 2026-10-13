import React from 'react';
import { Calendar, X, Sparkles, Clock, Check } from 'lucide-react';

export interface DateRangeFilterProps {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  onChangeStartDate: (date: string) => void;
  onChangeEndDate: (date: string) => void;
  onClear: () => void;
  onSetRange?: (start: string, end: string) => void;
  totalFilteredCount?: number;
  totalRecordsCount?: number;
  label?: string;
  className?: string;
  showPresets?: boolean;
}

/**
 * Converts YYYY-MM-DD to DD/MM/YYYY for user-friendly display
 */
export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDate;
}

/**
 * Checks if a date falls within [startDate, endDate] inclusive
 */
export function isRecordInDateRange(
  recordDate: string,
  startDate?: string,
  endDate?: string
): boolean {
  if (!recordDate) return false;
  // If recordDate contains timestamp (YYYY-MM-DDTHH:mm:ss), take only the date part
  const cleanDate = recordDate.slice(0, 10);
  if (startDate && cleanDate < startDate) return false;
  if (endDate && cleanDate > endDate) return false;
  return true;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
  onClear,
  onSetRange,
  totalFilteredCount,
  totalRecordsCount,
  label = 'Filtrar por Rango de Fechas',
  className = '',
  showPresets = true,
}) => {
  const isFilterActive = Boolean(startDate || endDate);

  const applyPreset = (start: string, end: string) => {
    if (onSetRange) {
      onSetRange(start, end);
    } else {
      onChangeStartDate(start);
      onChangeEndDate(end);
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Date inputs row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 whitespace-nowrap">
          <Calendar className="h-4 w-4 text-red-500" />
          <span>{label}:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Start Date */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 focus-within:border-red-500 transition">
            <span className="text-[11px] text-slate-400 font-medium">Desde:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onChangeStartDate(e.target.value)}
              className="bg-transparent text-xs text-white font-mono focus:outline-none [color-scheme:dark] cursor-pointer"
              title="Fecha inicial"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 focus-within:border-red-500 transition">
            <span className="text-[11px] text-slate-400 font-medium">Hasta:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onChangeEndDate(e.target.value)}
              className="bg-transparent text-xs text-white font-mono focus:outline-none [color-scheme:dark] cursor-pointer"
              title="Fecha final"
            />
          </div>

          {/* Clear button if active */}
          {isFilterActive && (
            <button
              onClick={onClear}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-red-600/15 hover:bg-red-600/25 text-red-300 border border-red-600/30 transition active:scale-95"
              title="Quitar filtro de fechas"
            >
              <X className="h-3.5 w-3.5" />
              <span>Limpiar fechas</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Presets Bar */}
      {showPresets && (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
          <span className="text-slate-400 font-medium text-[11px] mr-1">Accesos rápidos:</span>

          {/* User Requested Example: 01/09/2026 a 01/10/2026 */}
          <button
            type="button"
            onClick={() => applyPreset('2026-09-01', '2026-10-01')}
            className={`px-2.5 py-1 rounded-lg border font-mono transition flex items-center gap-1 ${
              startDate === '2026-09-01' && endDate === '2026-10-01'
                ? 'bg-red-600 text-white font-bold border-red-500 shadow-md shadow-red-950/40 ring-1 ring-red-400/50'
                : 'bg-red-600/10 text-red-400 hover:bg-red-600/20 border-red-500/30'
            }`}
            title="Ver servicios del 01/09/2026 al 01/10/2026"
          >
            <Sparkles className="h-3 w-3 text-red-400" />
            <span>01/09/2026 a 01/10/2026</span>
          </button>

          {/* Mes Septiembre 2026 */}
          <button
            type="button"
            onClick={() => applyPreset('2026-09-01', '2026-09-30')}
            className={`px-2 py-1 rounded-lg border transition ${
              startDate === '2026-09-01' && endDate === '2026-09-30'
                ? 'bg-red-600 text-white font-bold border-red-500'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            Septiembre 2026
          </button>

          {/* Mes Octubre 2026 */}
          <button
            type="button"
            onClick={() => applyPreset('2026-10-01', '2026-10-31')}
            className={`px-2 py-1 rounded-lg border transition ${
              startDate === '2026-10-01' && endDate === '2026-10-31'
                ? 'bg-red-600 text-white font-bold border-red-500'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            Octubre 2026
          </button>

          {/* Últimos 30 días */}
          <button
            type="button"
            onClick={() => {
              const now = new Date('2026-10-09');
              const past = new Date('2026-09-09');
              applyPreset(past.toISOString().slice(0, 10), now.toISOString().slice(0, 10));
            }}
            className="px-2 py-1 rounded-lg bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800 transition"
          >
            Últimos 30 días
          </button>

          {/* Todo el histórico */}
          {isFilterActive && (
            <button
              type="button"
              onClick={onClear}
              className="px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Mostrar Todo
            </button>
          )}
        </div>
      )}

      {/* Active Filter Confirmation Badge */}
      {isFilterActive && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-red-950/40 border border-red-600/30 text-xs text-red-200">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span>
              Filtrando servicios del{' '}
              <strong className="text-white font-mono underline decoration-red-500">
                {startDate ? formatDisplayDate(startDate) : 'Inicio'}
              </strong>{' '}
              al{' '}
              <strong className="text-white font-mono underline decoration-red-500">
                {endDate ? formatDisplayDate(endDate) : 'Hoy'}
              </strong>
            </span>
          </div>

          {totalFilteredCount !== undefined && totalRecordsCount !== undefined && (
            <span className="font-medium text-red-300 bg-red-950/70 px-2 py-0.5 rounded-lg border border-red-800/40 font-mono">
              {totalFilteredCount} de {totalRecordsCount} servicios coinciden
            </span>
          )}
        </div>
      )}
    </div>
  );
};
