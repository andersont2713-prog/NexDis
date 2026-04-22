import React, { useState } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  Search, 
  Filter, 
  ArrowRight,
  TrendingUp,
  Package,
  Users,
  ShoppingCart,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';

type ReportType = 'sales' | 'inventory' | 'customers' | 'returns';

interface ReportCardProps {
  key?: string;
  type: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

export default function ReportsPage() {
  const { formatPrice, formatDate } = useRegional();
  const [activeReport, setActiveReport] = useState<ReportType>('sales');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const reportConfigs = [
    { type: 'sales' as ReportType, title: 'Ventas y Recaudación', description: 'Resumen de pedidos, facturación e impuestos por periodo.', icon: <ShoppingCart size={24} /> },
    { type: 'inventory' as ReportType, title: 'Inventario y Stock', description: 'Movimientos de almacén, valorización y alertas de stock crítico.', icon: <Package size={24} /> },
    { type: 'customers' as ReportType, title: 'Cartera de Clientes', description: 'Análisis de compras, saldos pendientes y actividad por cliente.', icon: <Users size={24} /> },
    { type: 'returns' as ReportType, title: 'Mermas y Devoluciones', description: 'Registro de devoluciones, causas y pérdida financiera estimada.', icon: <TrendingUp size={24} /> },
  ];

  const handleExportCSV = () => {
    setIsExporting(true);
    const toastId = toast.loading('Generando reporte CSV...');

    setTimeout(() => {
      try {
        // Mock data based on type
        let headers = [];
        let rows = [];

        if (activeReport === 'sales') {
          headers = ['ID Pedido', 'Fecha', 'Cliente', 'Total', 'Estado'];
          rows = [
            ['ORD-7521', '21/04/2026', 'Abarrotes El Porvenir', '1250.50', 'Pendiente'],
            ['ORD-7520', '21/04/2026', 'Minimarket Los Olivos', '890.00', 'Procesado'],
          ];
        } else if (activeReport === 'inventory') {
          headers = ['SKU', 'Producto', 'Stock Actual', 'Categoría', 'Valor Unit.'];
          rows = [
            ['AR-001', 'Arroz Extra Costeño 1kg', '150', 'Granos', '4.50'],
            ['AC-002', 'Aceite Girasol Primor 1L', '85', 'Aceites', '9.80'],
          ];
        } else {
          headers = ['ID', 'Nombre', 'Contacto', 'Saldo Actual', 'Zonas'];
          rows = [
            ['C-001', 'Abarrotes El Porvenir', 'Juan Perez', '1500.00', 'Z-001'],
          ];
        }

        const csvContent = "data:text/csv;charset=utf-8," 
          + headers.join(",") + "\n"
          + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reporte_${activeReport}_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Reporte de ${activeReport.toUpperCase()} exportado con éxito`, { id: toastId });
      } catch (error) {
        toast.error('Error al exportar el reporte', { id: toastId });
      } finally {
        setIsExporting(false);
      }
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6 pt-4 space-y-6 relative">
      <div className="flex items-center justify-between relative z-10 text-white italic tracking-tighter uppercase font-display">
        <div className="space-y-1">
          <h2 className="text-3xl font-black italic tracking-tighter uppercase font-display">Inteligencia de Negocios</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest border-l-2 border-indigo-500/30 pl-3 italic">Generación de reportes y exportación de datos operativos.</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Report Selectors */}
        <div className="col-span-4 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic mb-2">Seleccione un Módulo</h3>
          {reportConfigs.map((config) => (
            <ReportCard 
              key={config.type}
              type={config.type}
              title={config.title}
              description={config.description}
              icon={config.icon}
              active={activeReport === config.type}
              onClick={() => setActiveReport(config.type)}
            />
          ))}
        </div>

        {/* Filters & Preview */}
        <div className="col-span-8 flex flex-col space-y-6 overflow-hidden">
          <div className="frosted-card border-white/10 p-8 bg-indigo-600/5">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
                  Filtros de Extracción
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Defina el rango temporal para el reporte de {activeReport}.</p>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/5">
                <Filter size={20} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Fecha de Inicio</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="date" 
                    className="input-glass pl-12 h-14 [color-scheme:dark]"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">Fecha de Término</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="date" 
                    className="input-glass pl-12 h-14 [color-scheme:dark]"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-500">
                <FileSpreadsheet size={20} className="text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest italic">Formato de salida: .CSV (Excel compatible)</span>
              </div>
              <button 
                onClick={handleExportCSV}
                disabled={isExporting}
                className={cn(
                  "h-14 px-8 bg-white hover:bg-slate-200 text-slate-900 rounded-2xl flex items-center gap-3 font-black uppercase italic tracking-widest text-xs transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                  isExporting ? "animate-pulse" : ""
                )}
              >
                <Download size={20} />
                {isExporting ? 'Procesando...' : 'Exportar Datos'}
              </button>
            </div>
          </div>

          {/* Preview Placeholder */}
          <div className="flex-1 frosted-card border-white/5 overflow-hidden flex flex-col p-0">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Previsualización de Estructura</h4>
              <span className="text-[9px] text-slate-500 font-bold uppercase italic">Mostrando 5 registros de ejemplo</span>
            </div>
            <div className="flex-1 overflow-auto p-6">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr>
                     <th className="pb-4 text-[10px] font-black text-slate-500 uppercase italic border-b border-white/5">Campo</th>
                     <th className="pb-4 text-[10px] font-black text-slate-500 uppercase italic border-b border-white/5">Dato</th>
                     <th className="pb-4 text-[10px] font-black text-slate-500 uppercase italic border-b border-white/5">Tipo</th>
                   </tr>
                 </thead>
                 <tbody className="text-xs">
                   <tr className="group">
                     <td className="py-4 border-b border-white/5 font-bold text-white uppercase italic">Id_Interno</td>
                     <td className="py-4 border-b border-white/5 text-slate-500 font-mono">REQ-8472</td>
                     <td className="py-4 border-b border-white/5"><span className="text-[9px] bg-white/5 px-2 py-1 rounded italic uppercase font-bold text-slate-400">UUID</span></td>
                   </tr>
                   <tr className="group">
                     <td className="py-4 border-b border-white/5 font-bold text-white uppercase italic">Monto_Total</td>
                     <td className="py-4 border-b border-white/5 text-slate-500 font-mono">1,250.50</td>
                     <td className="py-4 border-b border-white/5"><span className="text-[9px] bg-emerald-500/10 px-2 py-1 rounded italic uppercase font-bold text-emerald-400">Number</span></td>
                   </tr>
                   <tr className="group">
                     <td className="py-4 border-b border-white/5 font-bold text-white uppercase italic">Nombre_Sujeto</td>
                     <td className="py-4 border-b border-white/5 text-slate-500 font-mono">Juan Alvez</td>
                     <td className="py-4 border-b border-white/5"><span className="text-[9px] bg-indigo-500/10 px-2 py-1 rounded italic uppercase font-bold text-indigo-400">String</span></td>
                   </tr>
                 </tbody>
               </table>
            </div>
            <div className="p-4 bg-indigo-600/10 flex items-center justify-center gap-3">
              <CheckCircle2 size={14} className="text-indigo-400" />
              <p className="text-[10px] font-black text-indigo-400 uppercase italic tracking-widest">Estructura validada para integración con PowerBI / Excel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, description, icon, active, onClick }: ReportCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "p-6 rounded-[32px] border cursor-pointer transition-all flex items-start gap-5 relative overflow-hidden group",
        active 
          ? "bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-600/30" 
          : "bg-white/5 border-white/5 hover:border-white/20"
      )}
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all",
        active ? "bg-white text-indigo-600" : "bg-slate-800 text-slate-500 group-hover:text-white"
      )}>
        {icon}
      </div>
      <div className="space-y-1 pr-6">
        <h4 className={cn(
          "text-lg font-black italic tracking-tighter uppercase transition-colors",
          active ? "text-white" : "text-slate-300 group-hover:text-white"
        )}>
          {title}
        </h4>
        <p className={cn(
          "text-[10px] font-bold leading-relaxed uppercase",
          active ? "text-indigo-100" : "text-slate-500"
        )}>
          {description}
        </p>
      </div>
      <ChevronRight 
        className={cn(
          "absolute right-6 top-1/2 -translate-y-1/2 transition-all",
          active ? "text-white translate-x-0" : "text-slate-700 translate-x-4 opacity-0 group-hover:opacity-100"
        )} 
        size={24} 
      />
    </motion.div>
  );
}
