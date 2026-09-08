import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import type { Transaction, TransactionType } from '../types/finance';
import { formatBRL } from '../lib/formatters';
import { useTheme } from '../lib/theme';

interface CategoryPieChartProps {
  transactions: Transaction[];
}

const INCOME_PALETTE = [
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#06b6d4', // cyan-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#14b8a6', // teal-500
  '#eab308', // yellow-500
  '#3b82f6', // blue-500
];

const EXPENSE_PALETTE = [
  '#f43f5e', // rose-500
  '#f97316', // orange-500
  '#e11d48', // rose-600
  '#d97706', // amber-600
  '#a855f7', // purple-500
  '#ec4899', // pink-500
  '#ef4444', // red-500
  '#64748b', // slate-500
];

export function CategoryPieChart({ transactions }: CategoryPieChartProps) {
  const [selectedType, setSelectedType] = useState<TransactionType>('income');
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const palette = selectedType === 'income' ? INCOME_PALETTE : EXPENSE_PALETTE;

  const data = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter((t) => t.type === selectedType && t.status === 'confirmed')
      .forEach((t) => {
        const cat = t.category || 'Outros';
        categoryTotals[cat] = Math.round(((categoryTotals[cat] || 0) + Number(t.amount || 0)) * 100) / 100;
      });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, selectedType]);

  const total = useMemo(() => {
    return Math.round(data.reduce((acc, curr) => acc + curr.value, 0) * 100) / 100;
  }, [data]);

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Type Toggle */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Total: {formatBRL(total)}
        </span>
        <div className="inline-flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setSelectedType('income')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              selectedType === 'income'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Entradas
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('expense')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              selectedType === 'expense'
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Saídas
          </button>
        </div>
      </div>

      {data.length === 0 || total === 0 ? (
        <div className="h-60 sm:h-64 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs sm:text-sm text-center px-4">
          <p className="italic">
            Nenhuma {selectedType === 'income' ? 'entrada confirmada' : 'saída confirmada'} registrada ainda
          </p>
        </div>
      ) : (
        <div className="w-full h-60 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="46%"
                innerRadius={50}
                outerRadius={78}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={palette[index % palette.length]}
                    stroke={isDark ? '#18181b' : '#ffffff'}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0];
                    const value = Number(item.value || 0);
                    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                    return (
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-lg text-xs space-y-1 min-w-[150px]">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                          {item.name}
                        </div>
                        <div
                          className={`flex items-center justify-between font-bold tabular-nums ${
                            selectedType === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          <span>{formatBRL(value)}</span>
                          <span className="text-zinc-400 font-normal">({percent}%)</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                layout="horizontal"
                iconSize={8}
                iconType="circle"
                wrapperStyle={{
                  paddingTop: '6px',
                  fontSize: '11px',
                  maxHeight: '65px',
                  overflowY: 'auto',
                }}
                formatter={(value) => (
                  <span className="text-zinc-600 dark:text-zinc-400 text-[11px] font-medium">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
