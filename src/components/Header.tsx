import { Menu, Plus, UserCheck, Sun, Moon, Calculator } from 'lucide-react';
import { ChurchLogo } from './ChurchLogo';
import { getActorName } from '../lib/actor';
import { useTheme } from '../lib/theme';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onNewTransaction: () => void;
  onOpenActorPrompt?: () => void;
  onOpenCultoModal?: () => void;
}

export function Header({
  onOpenMobileMenu,
  onNewTransaction,
  onOpenActorPrompt,
  onOpenCultoModal,
}: HeaderProps) {
  const actorName = getActorName();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 py-2.5 flex items-center justify-between shadow-xs min-h-[56px] transition-colors duration-150">
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenMobileMenu}
          className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors active:scale-95"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>
        <ChurchLogo size="sm" showText={true} />
      </div>

      <div className="flex items-center gap-1.5">
        {/* Quick Fechamento Culto button */}
        {onOpenCultoModal && (
          <button
            onClick={onOpenCultoModal}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title="Fechamento de Culto"
            aria-label="Fechamento de Culto"
          >
            <Calculator className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          title="Alternar tema"
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-600" />
          )}
        </button>

        {/* Operator Badge */}
        {onOpenActorPrompt && (
          <button
            onClick={onOpenActorPrompt}
            className="hidden xs:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs transition-colors border border-zinc-200/60 dark:border-zinc-800"
            title="Alterar operador responsável"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-[11px] font-medium max-w-[85px] truncate">
              {actorName || 'Operador'}
            </span>
          </button>
        )}

        {/* Quick New Button */}
        <button
          onClick={onNewTransaction}
          className="min-h-[36px] flex items-center gap-1 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white px-3 py-1 rounded-lg text-xs font-semibold tracking-wide shadow-xs transition-all active:scale-95 cursor-pointer"
          title="Novo lançamento"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo</span>
        </button>
      </div>
    </header>
  );
}
