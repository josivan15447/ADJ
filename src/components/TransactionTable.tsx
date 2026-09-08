import { useState } from 'react';
import {
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Inbox,
  PlusCircle,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import type { Transaction } from '../types/finance';
import { formatBRL, formatDateBR } from '../lib/formatters';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

interface TransactionTableProps {
  transactions: Transaction[];
  totalCount: number;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  onConfirmStatus?: (id: string) => Promise<void>;
  onDuplicate?: (id: string) => Promise<void>;
  onOpenReceipt?: (transaction: Transaction) => void;
  onNewTransaction: () => void;
  onClearFilters?: () => void;
  hasFilters?: boolean;
}

export function TransactionTable({
  transactions,
  totalCount,
  onEdit,
  onDelete,
  onConfirmStatus,
  onDuplicate,
  onOpenReceipt,
  onNewTransaction,
  onClearFilters,
  hasFilters,
}: TransactionTableProps) {
  const [selectedForDelete, setSelectedForDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!selectedForDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(selectedForDelete.id);
      setSelectedForDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-10 text-center flex flex-col items-center justify-center shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {hasFilters ? 'Nenhum lançamento encontrado' : 'Nenhum lançamento registrado'}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1 mb-5">
          {hasFilters
            ? 'Tente ajustar os critérios de busca, alterar o período ou limpar os filtros aplicados.'
            : 'Comece registrando o primeiro dízimo, oferta ou despesa no sistema.'}
        </p>
        <div className="flex items-center gap-3">
          {hasFilters && onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-medium transition-all cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
          <button
            onClick={onNewTransaction}
            className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-amber-600 hover:bg-zinc-800 dark:hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 13. TABELA DESKTOP / TABLET */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/75 dark:bg-zinc-950/40 border-b border-zinc-200/80 dark:border-zinc-800/80 text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                <th className="py-3 px-4 lg:px-5">Data</th>
                <th className="py-3 px-3 lg:px-4">Nº Recibo</th>
                <th className="py-3 px-4 lg:px-5">Descrição</th>
                <th className="py-3 px-4 lg:px-5">Categoria</th>
                <th className="py-3 px-4 lg:px-5">Status</th>
                <th className="py-3 px-4 lg:px-5 text-right">Valor</th>
                <th className="py-3 px-4 lg:px-5 text-center w-36">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 text-xs text-zinc-900 dark:text-zinc-100">
              {transactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const isPending = tx.status === 'pending';
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                  >
                    {/* Data */}
                    <td className="py-3 px-4 lg:px-5 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap tabular-nums">
                      {formatDateBR(tx.date)}
                    </td>

                    {/* Nº Recibo */}
                    <td className="py-3 px-3 lg:px-4 text-[11px] font-mono text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                      {tx.receipt_number || '-'}
                    </td>

                    {/* Descrição */}
                    <td className="py-3 px-4 lg:px-5 font-medium text-xs">
                      <span className="truncate block max-w-[180px] md:max-w-[200px] lg:max-w-xs xl:max-w-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {tx.description}
                      </span>
                      {tx.payer_or_beneficiary && (
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block truncate">
                          {tx.payer_or_beneficiary}
                        </span>
                      )}
                    </td>

                    {/* Categoria */}
                    <td className="py-3 px-4 lg:px-5 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {tx.category}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 lg:px-5 whitespace-nowrap">
                      {isPending ? (
                        <button
                          type="button"
                          onClick={() => onConfirmStatus && onConfirmStatus(tx.id)}
                          className="inline-flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide transition-colors cursor-pointer"
                          title="Clique para confirmar este lançamento"
                        >
                          <span>Pendente</span>
                          <Check className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      ) : (
                        <span className="inline-block bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide">
                          Confirmado
                        </span>
                      )}
                    </td>

                    {/* Valor */}
                    <td className="py-3 px-4 lg:px-5 text-right font-semibold text-xs whitespace-nowrap tabular-nums">
                      <span className={isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {isIncome ? '+ ' : '- '}
                        {formatBRL(tx.amount)}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 lg:px-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 opacity-75 group-hover:opacity-100 transition-opacity">
                        {/* Emitir Recibo */}
                        {onOpenReceipt && (
                          <button
                            onClick={() => onOpenReceipt(tx)}
                            className="min-w-[30px] min-h-[30px] flex items-center justify-center text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                            title="Emitir Recibo"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Duplicar Lançamento */}
                        {onDuplicate && (
                          <button
                            onClick={() => onDuplicate(tx.id)}
                            className="min-w-[30px] min-h-[30px] flex items-center justify-center text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                            title="Duplicar lançamento"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Editar */}
                        <button
                          onClick={() => onEdit(tx)}
                          className="min-w-[30px] min-h-[30px] flex items-center justify-center text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                          title="Editar lançamento"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Excluir */}
                        <button
                          onClick={() => setSelectedForDelete(tx)}
                          className="min-w-[30px] min-h-[30px] flex items-center justify-center text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                          title="Excluir lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 14. MOBILE: CARDS VIEW */}
      <div className="md:hidden space-y-2.5">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'income';
          const isPending = tx.status === 'pending';
          return (
            <div
              key={tx.id}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-xs space-y-3"
            >
              {/* Header: Description & Category */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isIncome
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 ring-1 ring-emerald-500/20'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 ring-1 ring-rose-500/20'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                      {tx.description}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{tx.category}</span>
                      {tx.receipt_number && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-zinc-400">{tx.receipt_number}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  {isPending ? (
                    <button
                      type="button"
                      onClick={() => onConfirmStatus && onConfirmStatus(tx.id)}
                      className="inline-block bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/20 px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wide cursor-pointer"
                      title="Clique para confirmar"
                    >
                      Pendente
                    </button>
                  ) : (
                    <span className="inline-block bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wide">
                      Confirmado
                    </span>
                  )}
                </div>
              </div>

              {/* Data & Valor row */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="text-zinc-400 dark:text-zinc-500 tabular-nums">
                  {formatDateBR(tx.date)}
                </div>
                <div
                  className={`font-semibold tabular-nums ${
                    isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isIncome ? '+ ' : '- '}
                  {formatBRL(tx.amount)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {onOpenReceipt && (
                  <button
                    type="button"
                    onClick={() => onOpenReceipt(tx)}
                    className="min-h-[38px] flex items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 text-xs text-zinc-700 dark:text-zinc-200"
                    title="Emitir Recibo"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </button>
                )}

                {onDuplicate && (
                  <button
                    type="button"
                    onClick={() => onDuplicate(tx.id)}
                    className="min-h-[38px] flex items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 text-xs text-zinc-700 dark:text-zinc-200"
                    title="Duplicar"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onEdit(tx)}
                  className="min-h-[38px] flex items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 text-xs text-zinc-700 dark:text-zinc-200"
                  title="Editar"
                >
                  <Pencil className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedForDelete(tx)}
                  className="min-h-[38px] flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 23. Confirmação de Exclusão */}
      <ConfirmDeleteDialog
        transaction={selectedForDelete}
        isOpen={!!selectedForDelete}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setSelectedForDelete(null)}
      />
    </>
  );
}
