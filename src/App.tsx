import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ReliabilityAnalysisView } from './components/ReliabilityAnalysisView';
import { EquipmentFleetView } from './components/EquipmentFleetView';
import { MaintenanceLogView } from './components/MaintenanceLogView';
import { ReportsView } from './components/ReportsView';
import { EquipmentFormModal } from './components/EquipmentFormModal';
import { MaintenanceFormModal } from './components/MaintenanceFormModal';
import { BatchGeneratorModal } from './components/BatchGeneratorModal';
import { EquipmentDetailModal } from './components/EquipmentDetailModal';
import { MaintenanceDetailModal } from './components/MaintenanceDetailModal';
import { DeleteEquipmentSecurityModal } from './components/DeleteEquipmentSecurityModal';
import { DeleteMaintenanceSecurityModal } from './components/DeleteMaintenanceSecurityModal';
import { MainverLogo } from './components/MainverLogo';

import { Equipment, CorrectiveMaintenanceRecord, EquipmentStatus, EquipmentType } from './types';
import {
  loadEquipments,
  saveEquipments,
  loadMaintenanceRecords,
  saveMaintenanceRecords,
  resetToDemoData,
} from './utils/storage';

export default function App() {
  const [equipments, setEquipments] = useState<Equipment[]>(() => loadEquipments());
  const [records, setRecords] = useState<CorrectiveMaintenanceRecord[]>(() =>
    loadMaintenanceRecords()
  );

  const [activeTab, setActiveTab] = useState<
    'analysis' | 'fleet' | 'maintenance' | 'batch' | 'reports'
  >('analysis');

  // Modals state
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CorrectiveMaintenanceRecord | null>(null);
  const [preselectedEquipmentId, setPreselectedEquipmentId] = useState<string | undefined>(undefined);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const [inspectingEquipment, setInspectingEquipment] = useState<Equipment | null>(null);
  const [inspectingRecord, setInspectingRecord] = useState<CorrectiveMaintenanceRecord | null>(null);

  const [equipmentPendingDelete, setEquipmentPendingDelete] = useState<Equipment | null>(null);
  const [recordPendingDelete, setRecordPendingDelete] = useState<CorrectiveMaintenanceRecord | null>(null);

  const [fleetFilterType, setFleetFilterType] = useState<EquipmentType | 'all'>('all');

  // Toast / notification feedback
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(
    null
  );

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Sync state to storage
  useEffect(() => {
    saveEquipments(equipments);
  }, [equipments]);

  useEffect(() => {
    saveMaintenanceRecords(records);
  }, [records]);

  // Keep inspected equipment up-to-date
  useEffect(() => {
    if (inspectingEquipment) {
      const updated = equipments.find((e) => e.id === inspectingEquipment.id);
      if (updated) setInspectingEquipment(updated);
    }
  }, [equipments, inspectingEquipment]);

  // Handlers for Equipment
  const handleSaveEquipment = (eq: Equipment) => {
    setEquipments((prev) => {
      const exists = prev.some((item) => item.id === eq.id);
      if (exists) {
        return prev.map((item) => (item.id === eq.id ? eq : item));
      }
      return [eq, ...prev];
    });
    showNotification(`Equipo ${eq.code} registrado correctamente.`);
    setEditingEquipment(null);
  };

  const handleDeleteEquipment = (id: string) => {
    const toDelete = equipments.find((e) => e.id === id);
    setEquipments((prev) => prev.filter((item) => item.id !== id));
    // Also remove associated records
    setRecords((prev) => prev.filter((r) => r.equipmentId !== id));
    showNotification(`Equipo ${toDelete?.code || ''} eliminado.`);
    if (inspectingEquipment?.id === id) {
      setInspectingEquipment(null);
    }
  };

  const handleUpdateEquipmentStatus = (id: string, newStatus: EquipmentStatus) => {
    setEquipments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, operationalStatus: newStatus } : item))
    );
    const eq = equipments.find((e) => e.id === id);
    showNotification(`Estado de ${eq?.code || 'equipo'} actualizado.`);
  };

  // Handlers for Batch Generator
  const handleGenerateBatch = (newEquipments: Equipment[]) => {
    setEquipments((prev) => [...newEquipments, ...prev]);
    showNotification(`Se generaron ${newEquipments.length} equipos con éxito.`);
    setActiveTab('fleet');
  };

  // Handlers for Maintenance Records
  const handleSaveRecord = (rec: CorrectiveMaintenanceRecord) => {
    setRecords((prev) => {
      const exists = prev.some((item) => item.id === rec.id);
      if (exists) {
        return prev.map((item) => (item.id === rec.id ? rec : item));
      }
      return [rec, ...prev];
    });

    // Auto update equipment horometer if registered horometer is higher
    if (rec.horometer) {
      setEquipments((prev) =>
        prev.map((eq) =>
          eq.id === rec.equipmentId && (eq.hoursOperating || 0) < (rec.horometer || 0)
            ? { ...eq, hoursOperating: rec.horometer }
            : eq
        )
      );
    }

    showNotification(
      `Actividad correctiva para equipo ${rec.equipmentCode} guardada.`
    );
    setEditingRecord(null);
    setPreselectedEquipmentId(undefined);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((item) => item.id !== id));
    showNotification('Registro de mantenimiento eliminado.');
    if (inspectingRecord?.id === id) {
      setInspectingRecord(null);
    }
  };

  // Reset to Demo Data
  const handleResetDemo = () => {
    const data = resetToDemoData();
    setEquipments(data.equipments);
    setRecords(data.records);
    showNotification('Datos restablecidos a la flota de demostración.');
  };

  // Import JSON Backup
  const handleImportJSON = (
    newEquipments: Equipment[],
    newRecords: CorrectiveMaintenanceRecord[]
  ) => {
    setEquipments(newEquipments);
    setRecords(newRecords);
    showNotification('Copia de seguridad restaurada correctamente.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-red-600 text-white px-4 py-2.5 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce ring-1 ring-red-400/40">
          <span>✓</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main App Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewEquipment={() => {
          setEditingEquipment(null);
          setIsEquipmentModalOpen(true);
        }}
        onOpenNewMaintenance={() => {
          setEditingRecord(null);
          setPreselectedEquipmentId(undefined);
          setIsMaintenanceModalOpen(true);
        }}
        onOpenBatchGenerator={() => setIsBatchModalOpen(true)}
        totalEquipments={equipments.length}
        totalRecords={records.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'analysis' && (
          <ReliabilityAnalysisView
            equipments={equipments}
            records={records}
            onOpenNewMaintenance={() => {
              setEditingRecord(null);
              setPreselectedEquipmentId(undefined);
              setIsMaintenanceModalOpen(true);
            }}
            onOpenNewEquipment={() => {
              setEditingEquipment(null);
              setIsEquipmentModalOpen(true);
            }}
            onOpenBatchGenerator={() => setIsBatchModalOpen(true)}
            onSelectEquipment={(eq) => setInspectingEquipment(eq)}
            onSelectRecord={(rec) => setInspectingRecord(rec)}
            onGoToFleet={(type) => {
              setFleetFilterType(type || 'all');
              setActiveTab('fleet');
            }}
            onGoToMaintenance={() => setActiveTab('maintenance')}
          />
        )}

        {activeTab === 'fleet' && (
          <EquipmentFleetView
            equipments={equipments}
            records={records}
            onOpenNewEquipment={() => {
              setEditingEquipment(null);
              setIsEquipmentModalOpen(true);
            }}
            onOpenBatchGenerator={() => setIsBatchModalOpen(true)}
            onSelectEquipment={(eq) => setInspectingEquipment(eq)}
            onEditEquipment={(eq) => {
              setEditingEquipment(eq);
              setIsEquipmentModalOpen(true);
            }}
            onRequestDeleteEquipment={(eq) => setEquipmentPendingDelete(eq)}
            onOpenNewMaintenanceForEquipment={(eqId) => {
              setEditingRecord(null);
              setPreselectedEquipmentId(eqId);
              setIsMaintenanceModalOpen(true);
            }}
            onUpdateStatus={handleUpdateEquipmentStatus}
            initialTypeFilter={fleetFilterType}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceLogView
            records={records}
            equipments={equipments}
            onOpenNewMaintenance={() => {
              setEditingRecord(null);
              setPreselectedEquipmentId(undefined);
              setIsMaintenanceModalOpen(true);
            }}
            onSelectRecord={(rec) => setInspectingRecord(rec)}
            onEditRecord={(rec) => {
              setEditingRecord(rec);
              setIsMaintenanceModalOpen(true);
            }}
            onDeleteRecord={handleDeleteRecord}
            onRequestDeleteRecord={(rec) => setRecordPendingDelete(rec)}
          />
        )}

        {activeTab === 'batch' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-2">
                Generador de Equipos por Cantidad y Prefijos
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Carga masiva para registrar rápidamente la flota completa indicando el prefijo (20, 40, 45, 50) y el número total de equipos.
              </p>
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-md shadow-red-950/40"
              >
                Abrir Generador de Lote
              </button>
            </div>
            {/* Direct preview in batch tab */}
            <EquipmentFleetView
              equipments={equipments}
              records={records}
              onOpenNewEquipment={() => setIsEquipmentModalOpen(true)}
              onOpenBatchGenerator={() => setIsBatchModalOpen(true)}
              onSelectEquipment={(eq) => setInspectingEquipment(eq)}
              onEditEquipment={(eq) => {
                setEditingEquipment(eq);
                setIsEquipmentModalOpen(true);
              }}
              onRequestDeleteEquipment={(eq) => setEquipmentPendingDelete(eq)}
              onOpenNewMaintenanceForEquipment={(eqId) => {
                setPreselectedEquipmentId(eqId);
                setIsMaintenanceModalOpen(true);
              }}
              onUpdateStatus={handleUpdateEquipmentStatus}
            />
          </div>
        )}

        {activeTab === 'reports' && (
          <ReportsView
            equipments={equipments}
            records={records}
            onResetData={handleResetDemo}
            onImportJSON={handleImportJSON}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <MainverLogo variant="horizontal" size="sm" showTagline={true} />
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-slate-400 font-mono text-[11px]">
              Series 20 (Grillos) • 40 (PTT) • 45 (Hyster) • 50 (TT/Terberg)
            </span>
          </div>
          <div className="text-center sm:text-right text-[11px] text-slate-500">
            <div>Sistema Integral de Mantenimiento Portuario e Industrial</div>
            <div className="text-[10px] text-slate-600 mt-0.5">© {new Date().getFullYear()} MAINVER. Venta | Renta | Mantenimiento.</div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EquipmentFormModal
        isOpen={isEquipmentModalOpen}
        onClose={() => {
          setIsEquipmentModalOpen(false);
          setEditingEquipment(null);
        }}
        onSave={handleSaveEquipment}
        initialData={editingEquipment}
        existingCodes={equipments.map((e) => e.code)}
      />

      <MaintenanceFormModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => {
          setIsMaintenanceModalOpen(false);
          setEditingRecord(null);
          setPreselectedEquipmentId(undefined);
        }}
        onSave={handleSaveRecord}
        equipments={equipments}
        initialData={editingRecord}
        selectedEquipmentId={preselectedEquipmentId}
      />

      <BatchGeneratorModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onGenerateBatch={handleGenerateBatch}
        existingCodes={equipments.map((e) => e.code)}
      />

      <EquipmentDetailModal
        isOpen={!!inspectingEquipment}
        onClose={() => setInspectingEquipment(null)}
        equipment={inspectingEquipment}
        records={records}
        onOpenNewMaintenanceForEquipment={(eqId) => {
          setEditingRecord(null);
          setPreselectedEquipmentId(eqId);
          setIsMaintenanceModalOpen(true);
        }}
        onUpdateStatus={handleUpdateEquipmentStatus}
        onViewRecord={(rec) => setInspectingRecord(rec)}
        onRequestDelete={(eq) => setEquipmentPendingDelete(eq)}
        onRequestDeleteRecord={(rec) => setRecordPendingDelete(rec)}
      />

      <MaintenanceDetailModal
        isOpen={!!inspectingRecord}
        onClose={() => setInspectingRecord(null)}
        record={inspectingRecord}
        onEdit={(rec) => {
          setEditingRecord(rec);
          setIsMaintenanceModalOpen(true);
        }}
        onRequestDelete={(rec) => setRecordPendingDelete(rec)}
      />

      {/* Security Password Protected Delete Modal for Equipments */}
      <DeleteEquipmentSecurityModal
        isOpen={!!equipmentPendingDelete}
        onClose={() => setEquipmentPendingDelete(null)}
        equipment={equipmentPendingDelete}
        onConfirmDelete={(equipmentId) => {
          handleDeleteEquipment(equipmentId);
        }}
        recordCount={
          equipmentPendingDelete
            ? records.filter((r) => r.equipmentId === equipmentPendingDelete.id).length
            : 0
        }
      />

      {/* Security Password Protected Delete Modal for Corrective Records */}
      <DeleteMaintenanceSecurityModal
        isOpen={!!recordPendingDelete}
        onClose={() => setRecordPendingDelete(null)}
        record={recordPendingDelete}
        onConfirmDelete={(recordId) => {
          handleDeleteRecord(recordId);
        }}
      />
    </div>
  );
}
