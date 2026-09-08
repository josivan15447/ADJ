import { Church } from 'lucide-react';

interface ChurchLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  subtitle?: string;
}

export function ChurchLogo({
  size = 'md',
  showText = true,
  className = '',
  subtitle = 'Tesouraria Eclesiástica',
}: ChurchLogoProps) {
  const sizeDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official ADJ Church Emblem Badge */}
      <div
        className={`${sizeDimensions[size]} rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white shadow-md ring-1 ring-amber-400/30 flex items-center justify-center shrink-0 p-1 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-radial from-white/20 to-transparent pointer-events-none" />
        <Church className={`${iconSizes[size]} text-amber-100 drop-shadow-sm`} />
      </div>

      {showText && (
        <div className="leading-tight min-w-0">
          <div className="font-bold text-zinc-900 dark:text-zinc-50 tracking-tight text-sm truncate flex items-center gap-1.5">
            <span>ADJ Jeruel</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/15 border border-amber-500/20 px-1.5 py-0.2 rounded">
              Acre
            </span>
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal truncate">
            {subtitle}
          </div>
        </div>
      )}
    </div>
  );
}
