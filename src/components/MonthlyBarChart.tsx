import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { Transaction } from '../types/finance';
import { formatBRL } from '../lib/formatters';
import { useTheme } from '../lib/theme';

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

interface MonthlyBarChartProps {
  transactions: Transaction[];
}

export function MonthlyBarChart({ transactions }: MonthlyBarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = useMemo(() => {
    const monthlyMap = new Map<string, { monthKey: string; monthLabel: string; entradas: number; saidas: number }>();
    const now = new Date();
    const currentYear = now.getFullYear();

    for (let m = 0; m < 12; m++) {
      const key = `${currentYear}-${String(m + 1).padStart(2, '0')}`;
      monthlyMap.set(key, {
        monthKey: key,
        monthLabel: MONTH_NAMES[m],
        entradas: 0,
        saidas: 0,
      });
    }

    transactions.forEach((t) => {
      if (t.status !== 'confirmed') return;
      const key = (t.date || '').slice(0, 7);
      if (!key || key.length < 7) return;

      if (!monthlyMap.has(key)) {
        const [yearStr, monthStr] = key.split('-');
        const monthIdx = parseInt(monthStr, 10) - 1;
        const shortYear = yearStr && parseInt(yearStr, 10) !== currentYear ? `/${yearStr.slice(-2)}` : '';
        monthlyMap.set(key, {
          monthKey: key,
          monthLabel: `${MONTH_NAMES[monthIdx] || monthStr}${shortYear}`,
          entradas: 0,
          saidas: 0,
        });
      }

      const item = monthlyMap.get(key)!;
      if (t.type === 'income') {
        item.entradas = Math.round((item.entradas + Number(t.amount || 0)) * 100) / 100;
      } else {
        item.saidas = Math.round((item.saidas + Number(t.amount || 0)) * 100) / 100;
      }
    });

    const sorted = Array.from(monthlyMap.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    return sorted;
  }, [transactions]);

  const hasData = chartData.some((d) => d.entradas > 0 || d.saidas > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 text-sm">
        <p className="italic">Sem movimentações confirmadas para o período</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 sm:h-72 lg:h-80 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#27272a' : '#f4f4f5'}
            vertical={false}
          />
          <XAxis
            dataKey="monthLabel"
            stroke={isDark ? '#71717a' : '#a1a1aa'}
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: isDark ? '#27272a' : '#e4e4e7' }}
            interval={0}
          />
          <YAxis
            stroke={isDark ? '#71717a' : '#a1a1aa'}
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: isDark ? '#27272a' : '#e4e4e7' }}
            tickFormatter={(value) =>
              value >= 1000 ? `R$ ${(value / 1000).toFixed(0)}k` : `R$ ${value}`
            }
          />
          <Tooltip
            cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const income = (payload.find((p) => p.dataKey === 'entradas')?.value as number) || 0;
                const expense = (payload.find((p) => p.dataKey === 'saidas')?.value as number) || 0;
                const diff = income - expense;
                return (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[180px]">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                      Mês: {label}
                    </div>
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Entradas:</span>
                      <span className="font-bold tabular-nums">{formatBRL(income)}</span>
                    </div>
                    <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                      <span>Saídas:</span>
                      <span className="font-bold tabular-nums">{formatBRL(expense)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium">
                      <span>Saldo:</span>
                      <span
                        className={`font-bold tabular-nums ${
                          diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatBRL(diff)}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '8px', fontSize: '11px' }}
            formatter={(value) => (
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium capitalize">
                {value}
              </span>
            )}
          />
          <Bar
            dataKey="entradas"
            name="Entradas"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="saidas"
            name="Saídas"
            fill="#f43f5e"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
