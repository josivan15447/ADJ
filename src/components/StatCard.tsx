import React from 'react';

interface StatCardProps {
  title: string;
  valueFormatted: string;
  icon: React.ReactNode;
  variant: 'balance' | 'income' | 'expense' | 'pending';
  subtitle?: string;
  extraInfo?: string;
}

export function StatCard({
  title,
  valueFormatted,
  icon,
  variant,
  subtitle,
  extraInfo,
}: StatCardProps) {
  const styles = {
    balance: {
      badgeBg: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 ring-1 ring-zinc-200 dark:ring-zinc-700',
      valueColor: 'text-zinc-900 dark:text-zinc-50',
    },
    income: {
      badgeBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 ring-1 ring-emerald-500/20',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
    },
    expense: {
      badgeBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 ring-1 ring-rose-500/20',
      valueColor: 'text-rose-600 dark:text-rose-400',
    },
    pending: {
      badgeBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 ring-1 ring-amber-500/20',
      valueColor: 'text-amber-600 dark:text-amber-400',
    },
  };

  const current = styles[variant];

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-150 flex flex-col justify-between min-h-[124px]">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        <div
          className={`w-8 h-8 rounded-lg ${current.badgeBg} flex items-center justify-center shrink-0 transition-transform`}
        >
          {icon}
        </div>
      </div>
      <div>
        <div
          className={`text-2xl sm:text-3xl font-bold tracking-tight ${current.valueColor} truncate tabular-nums`}
        >
          {valueFormatted}
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          {subtitle && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {subtitle}
            </p>
          )}
          {extraInfo && (
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded shrink-0">
              {extraInfo}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
