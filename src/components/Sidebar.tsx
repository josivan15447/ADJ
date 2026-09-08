import React, { useRef, type ChangeEvent } from 'react';
import {
  LayoutDashboard,
  Receipt,
  History,
  PlusCircle,
  FileText,
  FileSpreadsheet,
  Download,
  UserCheck,
  X,
  Sun,
  Moon,
  Calculator,
  Database,
  Upload,
} from 'lucide-react';
import { ChurchLogo } from './ChurchLogo';
import { getActorName } from '../lib/actor';
import { useTheme } from '../lib/theme';
import { useFinanceStore } from '../lib/store';
import { toast } from './Toast';

export type ActiveTab = 'dashboard' | 'lancamentos' | 'novo' | 'editar' | 'historico' | 'culto';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenExport: (format?: 'pdf' | 'excel' | 'csv') => void;
  onOpenActorPrompt?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenCultoModal?: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  onOpenExport,
  onOpenActorPrompt,
  isMobileOpen = false,
  onCloseMobile,
  onOpenCultoModal,
}: SidebarProps) {
  const actorName = getActorName();
  const { theme, toggleTheme } = useTheme();
  const { exportBackupJSON, restoreBackupJSON } = useFinanceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNav = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const handleBackupRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = restoreBackupJSON(content);
        if (success) {
          toast.success('Backup restaurado com sucesso!');
        } else {
          toast.error('Arquivo de backup inválido.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Visão Geral',
      icon: LayoutDashboard,
    },
    {
      id: 'lancamentos' as ActiveTab,
      label: 'Lançamentos',
      icon: Receipt,
    },
    {
      id: 'culto' as ActiveTab,
      label: 'Contagem de Culto',
      icon: Calculator,
    },
    {
      id: 'historico' as ActiveTab,
      label: 'Auditoria & Logs',
      icon: History,
    },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-r border-zinc-200/80 dark:border-zinc-800/80 flex flex-col transition-transform duration-200 ease-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl z-50' : '-translate-x-full md:translate-x-0 z-40'
        }`}
      >
        {/* Header Branding */}
        <div className="h-16 px-5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <ChurchLogo size="md" showText={true} />
          {/* Close button on mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="md:hidden text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          <div>
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
              Principal
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeTab === item.id ||
                  (item.id === 'lancamentos' && activeTab === 'editar');
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'culto' && onOpenCultoModal) {
                        onOpenCultoModal();
                        if (onCloseMobile) onCloseMobile();
                      } else {
                        handleNav(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold ring-1 ring-amber-500/20 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-zinc-400 dark:text-zinc-500'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Action: Novo Lançamento */}
          <div>
            <button
              onClick={() => handleNav('novo')}
              className={`w-full py-2.5 px-3.5 flex items-center justify-center gap-2 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer ${
                activeTab === 'novo'
                  ? 'bg-amber-600 text-white ring-2 ring-amber-500/40'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-amber-600 dark:hover:bg-amber-500 active:scale-[0.99]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Lançamento</span>
            </button>
          </div>

          {/* Quick Export Tools */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
              Exportação Rápida
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => {
                  onOpenExport('pdf');
                  if (onCloseMobile) onCloseMobile();
                }}
                className="py-2 px-1.5 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-lg text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-center flex flex-col items-center gap-1 cursor-pointer"
                title="Exportar em formato PDF"
              >
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => {
                  onOpenExport('excel');
                  if (onCloseMobile) onCloseMobile();
                }}
                className="py-2 px-1.5 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-lg text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-center flex flex-col items-center gap-1 cursor-pointer"
                title="Exportar planilha Excel (XLSX)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                <span>XLSX</span>
              </button>
              <button
                onClick={() => {
                  onOpenExport('csv');
                  if (onCloseMobile) onCloseMobile();
                }}
                className="py-2 px-1.5 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-lg text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-center flex flex-col items-center gap-1 cursor-pointer"
                title="Exportar arquivo CSV"
              >
                <Download className="w-3.5 h-3.5 text-amber-500" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Backup & Restauração (New Improvement) */}
          <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
              Backup do Sistema
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  exportBackupJSON();
                  toast.success('Backup exportado em JSON!');
                }}
                className="py-1.5 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Baixar cópia de segurança em JSON"
              >
                <Database className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Salvar</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-1.5 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Restaurar dados de backup"
              >
                <Upload className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Restaurar</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleBackupRestore}
              />
            </div>
          </div>
        </div>

        {/* Footer Info & Dark Mode Toggle */}
        <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/50">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-amber-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-600" />
              )}
              <span>{theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}</span>
            </div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
              Alternar
            </span>
          </button>

          {/* Actor Profile Info */}
          <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-2">
            <div
              onClick={() => (onOpenActorPrompt ? onOpenActorPrompt() : handleNav('historico'))}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
              title="Clique para alterar o operador responsável"
            >
              <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-semibold shrink-0 ring-1 ring-amber-500/20">
                {actorName ? actorName.charAt(0).toUpperCase() : 'O'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-zinc-900 dark:text-zinc-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {actorName || 'Operador'}
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                  Responsável ativo
                </div>
              </div>
            </div>
            <button
              onClick={() => (onOpenActorPrompt ? onOpenActorPrompt() : handleNav('historico'))}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-200/60 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Configurar operador"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          </div>

          {/* Church Motto & Location Footer */}
          <div className="pt-1 px-1 text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
            <span>Campo Rio Branco</span>
            <span className="font-semibold text-amber-600/90 dark:text-amber-400/90">Achados por Deus</span>
          </div>
        </div>
      </aside>
    </>
  );
}
