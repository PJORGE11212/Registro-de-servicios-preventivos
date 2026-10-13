import React from 'react';
import {
  X,
  Wrench,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Package,
  User,
  FileText,
  Printer,
  Edit,
  Trash2,
} from 'lucide-react';
import { CorrectiveMaintenanceRecord } from '../types';
import { EQUIPMENT_TYPES } from '../utils/equipmentPrefix';

interface MaintenanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CorrectiveMaintenanceRecord | null;
  onEdit: (record: CorrectiveMaintenanceRecord) => void;
  onRequestDelete?: (record: CorrectiveMaintenanceRecord) => void;
}

export const MaintenanceDetailModal: React.FC<MaintenanceDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  onEdit,
  onRequestDelete,
}) => {
  if (!isOpen || !record) return null;

  const typeDef = EQUIPMENT_TYPES[record.equipmentType] || EQUIPMENT_TYPES.otro;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 print:bg-white print:border-b-2 print:border-black">
          <div className="flex items-center gap-3">
            <img
              src={typeDef.image}
              alt={typeDef.name}
              className="h-12 w-12 rounded-xl object-cover border border-slate-700 print:hidden flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white print:text-black">
                  Reporte de Mantenimiento Correctivo
                </h2>
                <span className="text-xs font-mono text-slate-400 print:text-gray-600">
                  #{record.id.slice(-6)}
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Ficha técnica de intervención correctiva • {typeDef.fullName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Imprimir o guardar PDF"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
              title="Editar registro"
            >
              <Edit className="h-4 w-4" />
            </button>
            {onRequestDelete && (
              <button
                onClick={() => {
                  onClose();
                  onRequestDelete(record);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                title="Eliminar registro (Requiere contraseña 1234)"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm">
          {/* Top highlight bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs print:border print:border-gray-300">
            <div>
              <span className="text-slate-400 block mb-0.5 print:text-gray-600">Equipo:</span>
              <span className="font-mono font-bold text-white text-base print:text-black">
                {record.equipmentCode}
              </span>
              <span className={`block text-[10px] ${typeDef.color.text} print:text-black font-semibold`}>
                {typeDef.fullName}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5 print:text-gray-600">Fecha y Hora:</span>
              <span className="font-mono text-white print:text-black font-bold">
                {record.date}
              </span>
              {record.time && (
                <span className="block text-[11px] text-slate-400 print:text-gray-600 font-mono">
                  {record.time} hrs
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5 print:text-gray-600">Horas Detenido:</span>
              <span className="font-mono font-bold text-red-400 text-base print:text-black">
                {record.downtimeHours} hrs
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5 print:text-gray-600">Horómetro al Fallar:</span>
              <span className="font-mono font-bold text-white text-base print:text-black">
                {record.horometer !== undefined ? `${record.horometer} hrs` : '-'}
              </span>
            </div>
          </div>

          {/* Failure Description */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 print:border print:border-gray-300">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 print:text-black">
                <AlertTriangle className="h-4 w-4 text-red-500 print:text-black" />
                Falla Diagnosticada
              </h4>
              <div className="flex flex-wrap gap-1">
                {(record.failureCategories || (record.failureCategory ? [record.failureCategory] : [])).map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700 print:text-black print:border-gray-400"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-slate-200 whitespace-pre-line leading-relaxed print:text-black">
              {record.failureDescription}
            </p>
          </div>

          {/* Corrective Action Performed */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 print:border print:border-gray-300">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2 print:text-black">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 print:text-black" />
              Actividad Correctiva Realizada
            </h4>
            <p className="text-slate-200 whitespace-pre-line leading-relaxed print:text-black">
              {record.correctiveAction}
            </p>
          </div>

          {/* Parts Changed or Reconditioned */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 print:text-black">
              <Package className="h-4 w-4 text-red-500 print:text-black" />
              Elementos Cambiados o Reacondicionados ({record.items.length})
            </h4>

            {record.items.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-3 rounded-lg bg-slate-950 border border-slate-800 print:text-gray-600">
                No se registraron repuestos o elementos reemplazados para esta actividad.
              </div>
            ) : (
              <div className="border border-slate-800 rounded-xl overflow-hidden print:border-gray-300">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] print:bg-gray-100 print:text-black">
                    <tr>
                      <th className="py-2.5 px-3">Acción</th>
                      <th className="py-2.5 px-3">Elemento / Componente</th>
                      <th className="py-2.5 px-3 text-center">Cant.</th>
                      <th className="py-2.5 px-3 font-mono">N° de Parte</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                    {record.items.map((item) => (
                      <tr key={item.id} className="text-slate-200 print:text-black">
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.action === 'cambiado'
                                ? 'bg-blue-500/20 text-blue-400 print:text-black'
                                : 'bg-emerald-500/20 text-emerald-400 print:text-black'
                            }`}
                          >
                            {item.action === 'cambiado' ? '🔄 Cambiado' : '🛠 Reacondicionado'}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-medium">{item.name}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-red-400 print:text-black">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-400 print:text-black">
                          {item.partNumber || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Technician & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 print:border-gray-200">
              <span className="text-slate-400 block mb-1 print:text-gray-600">Técnico / Responsable:</span>
              <span className="font-semibold text-white print:text-black flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {record.technician}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 print:border-gray-200">
              <span className="text-slate-400 block mb-1 print:text-gray-600">Observaciones Finales:</span>
              <span className="text-slate-300 print:text-black">
                {record.notes || 'Sin observaciones adicionales.'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
