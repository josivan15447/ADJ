import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import type { Transaction, TransactionType, TransactionStatus } from '../types/finance';
import { exportToCSV, exportToExcel, exportToPDF } from '../lib/exports';
import { formatDateBR } from '../lib/formatters';
import { toast } from './Toast';

interface ExportDialogProps {
  isOpen: boolean;
  initialFormat?: 'pdf' | 'excel' | 'csv';
  onClose: () => void;
  transactions: Transaction[];
}

export function ExportDialog({
  isOpen,
  initialFormat = 'pdf',
  onClose,
  transactions,
}: ExportDialogProps) {
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>(initialFormat);
  const [type, setType] = useState<'all' | TransactionType>('all');
  const [status, setStatus] = useState<'all' | TransactionStatus>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (initialFormat && isOpen) setFormat(initialFormat);
  }, [initialFormat, isOpen]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (type !== 'all' && t.type !== type) return false;
      if (status !== 'all' && t.status !== status) return false;
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    });
  }, [transactions, type, status, startDate, endDate]);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (startDate && endDate && startDate > endDate) {
      toast.error('A data inicial não pode ser maior que a data final.');
      return;
    }
    if (filteredTransactions.length === 0) {
      toast.error('Nenhum lançamento encontrado para os filtros selecionados.');
      return;
    }

    try {
      setIsExporting(true);
      let periodLabel = 'Todos os registros';
      if (startDate && endDate) {
        periodLabel = `${formatDateBR(startDate)} até ${formatDateBR(endDate)}`;
      } else if (startDate) {
        periodLabel = `A partir de ${formatDateBR(startDate)}`;
      } else if (endDate) {
        periodLabel = `Até ${formatDateBR(endDate)}`;
      }

      const options = { periodLabel, startDate, endDate };

      if (format === 'pdf') {
        exportToPDF(filteredTransactions, options);
        toast.success('Relatório PDF exportado com sucesso');
      } else if (format === 'excel') {
        exportToExcel(filteredTransactions, options);
        toast.success('Planilha Excel exportada com sucesso');
      } else {
        exportToCSV(filteredTransactions, options);
        toast.success('Arquivo CSV exportado com sucesso');
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Ocorreu um erro ao gerar a exportação.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 max-w-lg w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Exportação de Relatórios
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Selecione o formato e período para emissão oficial
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Formato */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Formato de Saída
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  format === 'pdf'
                    ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/20 text-zinc-900 dark:text-zinc-50 font-semibold'
                    : 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <FileText className="w-5 h-5 text-rose-500" />
                <span className="text-xs font-semibold">PDF</span>
                <span className="text-[10px] text-zinc-400">Relatório A4</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  format === 'excel'
                    ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/20 text-zinc-900 dark:text-zinc-50 font-semibold'
                    : 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-semibold">Excel</span>
                <span className="text-[10px] text-zinc-400">Planilha XLSX</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  format === 'csv'
                    ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/20 text-zinc-900 dark:text-zinc-50 font-semibold'
                    : 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Download className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-semibold">CSV</span>
                <span className="text-[10px] text-zinc-400">Dados brutos</span>
              </button>
            </div>
          </div>

          {/* Filtros no modal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="all">Entradas e Saídas</option>
                <option value="income">Apenas Entradas</option>
                <option value="expense">Apenas Saídas</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="all">Todos os status</option>
                <option value="confirmed">Confirmados</option>
                <option value="pending">Pendentes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Data inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Data final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Resumo do que será exportado */}
          <div className="bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-3 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Lançamentos no relatório:</span>
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {filteredTransactions.length} registros
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-medium transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || filteredTransactions.length === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-semibold tracking-wide shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isExporting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Exportar {format.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
