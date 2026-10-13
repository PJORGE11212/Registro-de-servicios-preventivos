import React from 'react';
import {
  Wrench,
  Truck,
  PlusCircle,
  Layers,
  BarChart3,
  FileSpreadsheet,
} from 'lucide-react';
import { MainverLogo } from './MainverLogo';

interface HeaderProps {
  activeTab: 'analysis' | 'fleet' | 'maintenance' | 'batch' | 'reports';
  setActiveTab: (tab: 'analysis' | 'fleet' | 'maintenance' | 'batch' | 'reports') => void;
  onOpenNewEquipment: () => void;
  onOpenNewMaintenance: () => void;
  onOpenBatchGenerator: () => void;
  totalEquipments: number;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewEquipment,
  onOpenNewMaintenance,
  onOpenBatchGenerator,
  totalEquipments,
  totalRecords,
}) => {
  return (
    <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800/90 text-white sticky top-0 z-30 shadow-xl shadow-black/40">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <MainverLogo variant="horizontal" size="md" showTagline={true} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenBatchGenerator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-all shadow-sm active:scale-95"
              title="Registrar varios equipos por cantidad"
            >
              <Layers className="h-3.5 w-3.5 text-red-500" />
              <span>Generar Lote</span>
            </button>

            <button
              onClick={onOpenNewEquipment}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-all shadow-sm active:scale-95"
            >
              <Truck className="h-3.5 w-3.5 text-slate-300" />
              <span>+ Nuevo Equipo</span>
            </button>

            <button
              onClick={onOpenNewMaintenance}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all shadow-md shadow-red-600/30 active:scale-95 ring-1 ring-red-400/40"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Registrar Correctivo</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 border-t border-slate-900 pt-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'analysis'
                ? 'border-red-600 text-red-500 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Análisis de Confiabilidad</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'fleet'
                ? 'border-red-600 text-red-500 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Flota de Equipos</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'fleet'
                ? 'bg-red-950/70 text-red-300 border border-red-800/40'
                : 'bg-slate-900 text-slate-400'
            }`}>
              {totalEquipments}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'maintenance'
                ? 'border-red-600 text-red-500 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <Wrench className="h-4 w-4" />
            <span>Bitácora Correctiva</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'maintenance'
                ? 'bg-red-950/70 text-red-300 border border-red-800/40'
                : 'bg-slate-900 text-slate-400'
            }`}>
              {totalRecords}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'batch'
                ? 'border-red-600 text-red-500 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Carga por Lotes</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'reports'
                ? 'border-red-600 text-red-500 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Reportes & Exportar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
