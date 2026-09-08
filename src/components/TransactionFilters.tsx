import React from 'react';
import { Search, X, ArrowUpRight, ArrowDownRight, Wallet, Calendar } from 'lucide-react';
import { formatBRL } from '../lib/formatters';

export interface FiltersState {
  search: string;
  type: 'all' | 'income' | 'expense';
  status: 'all' | 'confirmed' | 'pending';
  startDate: string;
  endDate: string;
}

interface TransactionFiltersProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  summary: {
    income: number;
    expense: number;
    balance: number;
  };
}

export function TransactionFilters({
  filters,
  setFilters,
  summary,
}: TransactionFiltersProps) {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.type !== 'all' ||
    filters.status !== 'all' ||
    filters.startDate !== '' ||
    filters.endDate !== '';

  const handleClear = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      startDate: '',
      endDate: '',
    });
  };

  const applyPreset = (preset: 'thisMonth' | 'lastMonth' | 'last30' | 'thisYear') => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (preset === 'thisMonth') {
      const firstDay = new Date(currentYear, currentMonth, 1).toISOString().slice(0, 10);
      const lastDay = new Date(currentYear, currentMonth + 1, 0).toISOString().slice(0, 10);
      setFilters((f) => ({ ...f, startDate: firstDay, endDate: lastDay }));
    } else if (preset === 'lastMonth') {
      const firstDay = new Date(currentYear, currentMonth - 1, 1).toISOString().slice(0, 10);
      const lastDay = new Date(currentYear, currentMonth, 0).toISOString().slice(0, 10);
      setFilters((f) => ({ ...f, startDate: firstDay, endDate: lastDay }));
    } else if (preset === 'last30') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);
      setFilters((f) => ({ ...f, startDate: thirtyDaysAgo, endDate: today }));
    } else if (preset === 'thisYear') {
      const firstDay = `${currentYear}-01-01`;
      const lastDay = `${currentYear}-12-31`;
      setFilters((f) => ({ ...f, startDate: firstDay, endDate: lastDay }));
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* 10. RESUMO DA LISTA (Entradas, Saídas, Saldo com filtros aplicados) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Entradas */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-xs flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-0.5">
              Entradas Filtradas
            </span>
            <span className="text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-400 truncate block tabular-nums">
              {formatBRL(summary.income)}
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 ring-1 ring-emerald-500/20 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Saídas */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-xs flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-0.5">
              Saídas Filtradas
            </span>
            <span className="text-xl lg:text-2xl font-bold text-rose-600 dark:text-rose-400 truncate block tabular-nums">
              {formatBRL(summary.expense)}
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 ring-1 ring-rose-500/20 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>

        {/* Saldo */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-xs flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-0.5">
              Saldo Filtrado
            </span>
            <span
              className={`text-xl lg:text-2xl font-bold truncate block tabular-nums ${
                summary.balance >= 0
                  ? 'text-zinc-900 dark:text-zinc-50'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatBRL(summary.balance)}
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 ring-1 ring-zinc-200 dark:ring-zinc-700 flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 11 & 12. CONTROLES DE BUSCA E FILTROS */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 sm:p-5 shadow-xs space-y-4">
        {/* 11. Busca em tempo real */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por descrição, recibo, doador, fornecedor ou categoria..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-full min-h-[42px] bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg pl-10 pr-9 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((f) => ({ ...f, search: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-md"
              aria-label="Limpar campo de busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Period Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Atalhos:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('thisMonth')}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            Este Mês
          </button>
          <button
            type="button"
            onClick={() => applyPreset('lastMonth')}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            Mês Anterior
          </button>
          <button
            type="button"
            onClick={() => applyPreset('last30')}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            Últimos 30 Dias
          </button>
          <button
            type="button"
            onClick={() => applyPreset('thisYear')}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            Este Ano
          </button>
        </div>

        {/* 12. Filtros de Tipo, Status e Período */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tipo */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Tipo
            </label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((f) => ({ ...f, type: e.target.value as any }))
              }
              className="w-full min-h-[40px] bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Entradas</option>
              <option value="expense">Saídas</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: e.target.value as any }))
              }
              className="w-full min-h-[40px] bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="all">Todos os status</option>
              <option value="confirmed">Confirmados</option>
              <option value="pending">Pendentes</option>
            </select>
          </div>

          {/* Data De */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              De
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, startDate: e.target.value }))
              }
              className="w-full min-h-[40px] bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Data Até */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Até
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, endDate: e.target.value }))
              }
              className="w-full min-h-[40px] bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleClear}
              className="min-h-[36px] inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 px-3.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar filtros ativos</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
