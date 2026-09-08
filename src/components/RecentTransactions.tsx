import { ArrowRight, PlusCircle, Inbox, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import type { Transaction } from '../types/finance';
import { formatBRL, formatDateBR } from '../lib/formatters';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewAll: () => void;
  onNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onOpenReceipt?: (tx: Transaction) => void;
}

export function RecentTransactions({
  transactions,
  onViewAll,
  onNewTransaction,
  onEditTransaction,
  onOpenReceipt,
}: RecentTransactionsProps) {
  const recent = transactions.slice(0, 6);

  if (recent.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-8 shadow-xs text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Nenhum lançamento registrado
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1 mb-4">
          Registre o primeiro dízimo, oferta ou despesa para acompanhar a tesouraria.
        </p>
        <button
          onClick={onNewTransaction}
          className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-amber-600 hover:bg-zinc-800 dark:hover:bg-amber-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Novo Lançamento</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
      {/* Table Header / Title */}
      <div className="px-5 py-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Lançamentos Recentes
          </h3>
          <span className="text-[10px] bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded font-medium">
            {recent.length}
          </span>
        </div>
        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer group"
        >
          <span>Ver todos</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 1. Mobile Cards View (< md) */}
      <div className="md:hidden divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
        {recent.map((tx) => {
          const isIncome = tx.type === 'income';
          const isPending = tx.status === 'pending';
          return (
            <div
              key={tx.id}
              onClick={() => onEditTransaction(tx)}
              className="p-3.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
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
                  <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100 truncate">
                    {tx.description}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    <span className="truncate">{tx.category}</span>
                    <span>•</span>
                    <span className="shrink-0">{formatDateBR(tx.date)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 flex items-center gap-2">
                <div>
                  <div
                    className={`text-xs sm:text-sm font-semibold tabular-nums ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? '+ ' : '- '}
                    {formatBRL(tx.amount)}
                  </div>
                  <div className="mt-0.5">
                    {isPending ? (
                      <span className="inline-block bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/20 px-2 py-0.2 rounded-full text-[9px] font-medium tracking-wide">
                        Pendente
                      </span>
                    ) : (
                      <span className="inline-block bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20 px-2 py-0.2 rounded-full text-[9px] font-medium tracking-wide">
                        Confirmado
                      </span>
                    )}
                  </div>
                </div>

                {onOpenReceipt && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenReceipt(tx);
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="Emitir Recibo"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop/Tablet Table View (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/30">
              <th className="px-5 py-2.5 font-semibold">Data</th>
              <th className="px-5 py-2.5 font-semibold">Recibo</th>
              <th className="px-5 py-2.5 font-semibold">Descrição</th>
              <th className="px-5 py-2.5 font-semibold">Categoria</th>
              <th className="px-5 py-2.5 font-semibold text-right">Valor</th>
              <th className="px-5 py-2.5 font-semibold text-center">Status</th>
              <th className="px-5 py-2.5 font-semibold text-center">Recibo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
            {recent.map((tx) => {
              const isIncome = tx.type === 'income';
              const isPending = tx.status === 'pending';
              return (
                <tr
                  key={tx.id}
                  onClick={() => onEditTransaction(tx)}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3 text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap tabular-nums">
                    {formatDateBR(tx.date)}
                  </td>
                  <td className="px-5 py-3 text-[11px] font-mono text-zinc-400 whitespace-nowrap">
                    {tx.receipt_number || '-'}
                  </td>
                  <td className="px-5 py-3 font-medium text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors max-w-xs truncate">
                    {tx.description}
                  </td>
                  <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400 text-xs whitespace-nowrap">
                    {tx.category}
                  </td>
                  <td
                    className={`px-5 py-3 text-right font-semibold text-xs whitespace-nowrap tabular-nums ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? '+ ' : '- '}
                    {formatBRL(tx.amount)}
                  </td>
                  <td className="text-center px-5 py-3 whitespace-nowrap">
                    {isPending ? (
                      <span className="inline-block bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide">
                        Pendente
                      </span>
                    ) : (
                      <span className="inline-block bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide">
                        Confirmado
                      </span>
                    )}
                  </td>
                  <td className="text-center px-5 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    {onOpenReceipt && (
                      <button
                        type="button"
                        onClick={() => onOpenReceipt(tx)}
                        className="p-1 text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                        title="Emitir Recibo"
                      >
                        <FileText className="w-3.5 h-3.5 inline" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
