import { LayoutDashboard, Receipt, Plus, History, Download } from 'lucide-react';
import type { ActiveTab } from './Sidebar';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenExport: () => void;
}

export function MobileBottomNav({
  activeTab,
  onSelectTab,
  onOpenExport,
}: MobileBottomNavProps) {
  const isDashboard = activeTab === 'dashboard';
  const isLancamentos = activeTab === 'lancamentos' || activeTab === 'editar';
  const isHistorico = activeTab === 'historico';
  const isNovo = activeTab === 'novo';

  return (
    <nav
      aria-label="Navegação móvel"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-zinc-800/80 px-2 py-1.5 shadow-lg transition-colors duration-150"
    >
      <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
        {/* 1. Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center min-h-[44px] w-full py-1 rounded-lg transition-all cursor-pointer ${
            isDashboard
              ? 'text-amber-600 dark:text-amber-400 font-medium'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
          aria-label="Ir para Visão Geral"
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Geral</span>
        </button>

        {/* 2. Lançamentos */}
        <button
          onClick={() => onSelectTab('lancamentos')}
          className={`flex flex-col items-center justify-center min-h-[44px] w-full py-1 rounded-lg transition-all cursor-pointer ${
            isLancamentos
              ? 'text-amber-600 dark:text-amber-400 font-medium'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
          aria-label="Ir para Lançamentos"
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Lançamentos</span>
        </button>

        {/* 3. Central "Novo Lançamento" Button */}
        <button
          onClick={() => onSelectTab('novo')}
          className="flex flex-col items-center justify-center -mt-4 group relative cursor-pointer"
          aria-label="Registrar novo lançamento"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 ${
              isNovo
                ? 'bg-amber-600 text-white ring-4 ring-amber-500/30'
                : 'bg-zinc-900 dark:bg-amber-500 text-white hover:bg-zinc-800 dark:hover:bg-amber-400'
            }`}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[9px] font-semibold text-zinc-900 dark:text-amber-400 tracking-wider uppercase mt-1">
            Novo
          </span>
        </button>

        {/* 4. Histórico */}
        <button
          onClick={() => onSelectTab('historico')}
          className={`flex flex-col items-center justify-center min-h-[44px] w-full py-1 rounded-lg transition-all cursor-pointer ${
            isHistorico
              ? 'text-amber-600 dark:text-amber-400 font-medium'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
          aria-label="Ir para Auditoria"
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Auditoria</span>
        </button>

        {/* 5. Exportar */}
        <button
          onClick={onOpenExport}
          className="flex flex-col items-center justify-center min-h-[44px] w-full py-1 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all cursor-pointer"
          aria-label="Exportar relatórios"
        >
          <Download className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Exportar</span>
        </button>
      </div>
    </nav>
  );
}
