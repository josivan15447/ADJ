import { AlertTriangle, Loader2 } from 'lucide-react';
import type { Transaction } from '../types/finance';
import { formatBRL } from '../lib/formatters';

interface ConfirmDeleteDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteDialog({
  transaction,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 max-w-md w-full p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Excluir lançamento?
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Esta ação será registrada no histórico de auditoria da tesouraria.
            </p>
          </div>
        </div>

        {/* Transaction details card */}
        <div className="bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-3.5 mb-5 text-xs space-y-1">
          <div className="font-semibold text-sm truncate text-zinc-900 dark:text-zinc-100">
            {transaction.description}
          </div>
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span>
              {transaction.category} • {transaction.type === 'income' ? 'Entrada' : 'Saída'}
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tabular-nums">
              {formatBRL(transaction.amount)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-medium transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold tracking-wide shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Confirmar Exclusão</span>
          </button>
        </div>
      </div>
    </div>
  );
}
