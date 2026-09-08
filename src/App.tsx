import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  PlusCircle,
  Receipt,
  Download,
  TrendingUp,
  PieChart as PieIcon,
  Calculator,
  ShieldCheck,
} from 'lucide-react';
import { useFinanceStore } from './lib/store';
import { formatBRL } from './lib/formatters';
import type { Transaction } from './types/finance';

// Components
import { Sidebar, type ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { StatCard } from './components/StatCard';
import { MonthlyBarChart } from './components/MonthlyBarChart';
import { CategoryPieChart } from './components/CategoryPieChart';
import { RecentTransactions } from './components/RecentTransactions';
import { TransactionFilters } from './components/TransactionFilters';
import { TransactionTable } from './components/TransactionTable';
import { TransactionForm } from './components/TransactionForm';
import { AuditTimeline } from './components/AuditTimeline';
import { ExportDialog } from './components/ExportDialog';
import { ActorPromptDialog } from './components/ActorPromptDialog';
import { ReceiptModal } from './components/ReceiptModal';
import { CultoCountModal } from './components/CultoCountModal';
import { ToastContainer, toast } from './components/Toast';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  const {
    transactions,
    auditLogs,
    stats,
    createTransaction,
    updateTransaction,
    confirmTransaction,
    duplicateTransaction,
    deleteTransaction,
    getTransactionById,
  } = useFinanceStore();

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dialogs & Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportInitialFormat, setExportInitialFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [isActorPromptOpen, setIsActorPromptOpen] = useState(false);
  const [isCultoModalOpen, setIsCultoModalOpen] = useState(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  // Filters State for Lançamentos Page
  const [filters, setFilters] = useState<{
    search: string;
    type: 'all' | 'income' | 'expense';
    status: 'all' | 'confirmed' | 'pending';
    startDate: string;
    endDate: string;
  }>({
    search: '',
    type: 'all',
    status: 'all',
    startDate: '',
    endDate: '',
  });

  // URL Hash / Path Sync
  useEffect(() => {
    const handleUrl = () => {
      const path = window.location.pathname.replace(/\/$/, '') || '/';
      if (path.includes('/lancamentos/novo')) {
        setActiveTab('novo');
        setEditingTransactionId(null);
      } else if (path.includes('/lancamentos/') && path.includes('/editar')) {
        const parts = path.split('/');
        const idIdx = parts.indexOf('lancamentos') + 1;
        const id = parts[idIdx];
        if (id) {
          setEditingTransactionId(id);
          setActiveTab('editar');
        }
      } else if (path.startsWith('/lancamentos')) {
        setActiveTab('lancamentos');
        setEditingTransactionId(null);
      } else if (path.startsWith('/historico')) {
        setActiveTab('historico');
        setEditingTransactionId(null);
      } else {
        setActiveTab('dashboard');
        setEditingTransactionId(null);
      }
    };
    handleUrl();
    window.addEventListener('popstate', handleUrl);
    return () => window.removeEventListener('popstate', handleUrl);
  }, []);

  const navigateTo = useCallback((tab: ActiveTab, editingId: string | null = null) => {
    setActiveTab(tab);
    setEditingTransactionId(editingId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    let newPath = '/';
    if (tab === 'lancamentos') newPath = '/lancamentos';
    else if (tab === 'novo') newPath = '/lancamentos/novo';
    else if (tab === 'editar' && editingId) newPath = `/lancamentos/${editingId}/editar`;
    else if (tab === 'historico') newPath = '/historico';
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  }, []);

  const handleOpenExport = (format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
    setExportInitialFormat(format);
    setIsExportOpen(true);
  };

  const handleEditClick = (tx: Transaction) => {
    navigateTo('editar', tx.id);
  };

  const handleOpenReceipt = (tx: Transaction) => {
    setReceiptTx(tx);
  };

  const editingTx = useMemo(() => {
    if (!editingTransactionId) return undefined;
    return getTransactionById(editingTransactionId);
  }, [editingTransactionId, getTransactionById, transactions]);

  // Filtered transactions for the "Lançamentos" list view
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Type
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      // Status
      if (filters.status !== 'all' && t.status !== filters.status) return false;
      // Date range
      if (filters.startDate && t.date < filters.startDate) return false;
      if (filters.endDate && t.date > filters.endDate) return false;
      // Search
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const inDesc = (t.description || '').toLowerCase().includes(q);
        const inCat = (t.category || '').toLowerCase().includes(q);
        const inPayer = (t.payer_or_beneficiary || '').toLowerCase().includes(q);
        const inRec = (t.receipt_number || '').toLowerCase().includes(q);
        const inNote = (t.note || '').toLowerCase().includes(q);
        if (!inDesc && !inCat && !inPayer && !inRec && !inNote) return false;
      }
      return true;
    });
  }, [transactions, filters]);

  // Filtered summary
  const filteredSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      if (t.status === 'confirmed') {
        if (t.type === 'income') income += Number(t.amount || 0);
        else expense += Number(t.amount || 0);
      }
    });
    const round2 = (val: number) => Math.round(val * 100) / 100;
    const rIncome = round2(income);
    const rExpense = round2(expense);
    return {
      income: rIncome,
      expense: rExpense,
      balance: round2(rIncome - rExpense),
    };
  }, [filteredTransactions]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-150 selection:bg-amber-500/20">
      {/* Toast notifications */}
      <ToastContainer />

      {/* Top Header for Mobile */}
      <Header
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onNewTransaction={() => navigateTo('novo')}
        onOpenActorPrompt={() => setIsActorPromptOpen(true)}
        onOpenCultoModal={() => setIsCultoModalOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex min-w-0">
        {/* Sidebar (Desktop fixed w-64 & Mobile Drawer) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => navigateTo(tab)}
          onOpenExport={handleOpenExport}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenActorPrompt={() => setIsActorPromptOpen(true)}
          onOpenCultoModal={() => setIsCultoModalOpen(true)}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 md:pl-64">
          <main className="flex-1 min-w-0 pb-28 md:pb-16 pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            {/* ==================== 1. DASHBOARD VIEW ==================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                      Visão Geral da Tesouraria
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Assembleia de Deus Jeruel • Gestão financeira e controle eclesiástico
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Culto Quick Count Button */}
                    <button
                      onClick={() => setIsCultoModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300 transition-all cursor-pointer shadow-2xs"
                      title="Contagem de envelopes e ofertório do culto"
                    >
                      <Calculator className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Contagem de Culto</span>
                    </button>

                    <button
                      onClick={() => handleOpenExport('pdf')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Exportar Relatório</span>
                    </button>

                    <button
                      onClick={() => navigateTo('novo')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-semibold tracking-wide transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Novo Lançamento</span>
                    </button>
                  </div>
                </div>

                {/* 5. CARDS FINANCEIROS (Saldo, Entradas, Saídas, Pendentes) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Saldo Atual"
                    valueFormatted={formatBRL(stats.balance)}
                    icon={<Wallet className="w-4 h-4" />}
                    variant="balance"
                    subtitle="Entradas vs Saídas confirmadas"
                    extraInfo={`${stats.confirmedCount} confirmados`}
                  />
                  <StatCard
                    title="Entradas"
                    valueFormatted={formatBRL(stats.totalIncome)}
                    icon={<ArrowUpRight className="w-4 h-4" />}
                    variant="income"
                    subtitle="Dízimos, ofertas e campanhas"
                  />
                  <StatCard
                    title="Saídas"
                    valueFormatted={formatBRL(stats.totalExpense)}
                    icon={<ArrowDownRight className="w-4 h-4" />}
                    variant="expense"
                    subtitle="Despesas e custos pagos"
                  />
                  <StatCard
                    title="Pendentes"
                    valueFormatted={formatBRL(stats.totalPending)}
                    icon={<Clock className="w-4 h-4" />}
                    variant="pending"
                    subtitle="Aguardando confirmação"
                    extraInfo={`${stats.pendingCount} pendente(s)`}
                  />
                </div>

                {/* 6 & 7. GRÁFICOS (Mensal & Categoria) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* 6. Gráfico Mensal: Entradas x Saídas */}
                  <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="font-semibold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>Entradas x Saídas</span>
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Comparativo mensal do fluxo de caixa eclesiástico
                        </p>
                      </div>
                    </div>
                    <MonthlyBarChart transactions={transactions} />
                  </div>

                  {/* 7. Gráfico Por Categoria */}
                  <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                    <div className="mb-2">
                      <h2 className="font-semibold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <PieIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Categorias</span>
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Distribuição por tipo de movimento eclesiástico
                      </p>
                    </div>
                    <CategoryPieChart transactions={transactions} />
                  </div>
                </div>

                {/* 8. LANÇAMENTOS RECENTES */}
                <RecentTransactions
                  transactions={transactions}
                  onViewAll={() => navigateTo('lancamentos')}
                  onNewTransaction={() => navigateTo('novo')}
                  onEditTransaction={handleEditClick}
                  onOpenReceipt={handleOpenReceipt}
                />
              </div>
            )}

            {/* ==================== 2. LANÇAMENTOS VIEW ==================== */}
            {activeTab === 'lancamentos' && (
              <div className="space-y-6">
                {/* Header Title & Counter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2.5">
                      <Receipt className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      <span>Lançamentos</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                      <strong>{filteredTransactions.length}</strong> de {transactions.length}{' '}
                      {transactions.length === 1 ? 'registro' : 'registros'} no livro caixa
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleOpenExport('pdf')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Exportar</span>
                    </button>
                    <button
                      onClick={() => navigateTo('novo')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-semibold tracking-wide transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Novo Lançamento</span>
                    </button>
                  </div>
                </div>

                {/* 10, 11, 12. Indicadores e Filtros */}
                <TransactionFilters
                  filters={filters}
                  setFilters={setFilters}
                  summary={filteredSummary}
                />

                {/* 13 & 14. Tabela Desktop + Cards Mobile */}
                <TransactionTable
                  transactions={filteredTransactions}
                  totalCount={transactions.length}
                  onEdit={handleEditClick}
                  onOpenReceipt={handleOpenReceipt}
                  onConfirmStatus={async (id) => {
                    try {
                      await confirmTransaction(id);
                      toast.success('Lançamento confirmado com sucesso!');
                    } catch (err: any) {
                      toast.error(err.message || 'Erro ao confirmar.');
                    }
                  }}
                  onDuplicate={async (id) => {
                    try {
                      await duplicateTransaction(id);
                      toast.success('Cópia do lançamento criada com sucesso!');
                    } catch (err: any) {
                      toast.error(err.message || 'Erro ao duplicar.');
                    }
                  }}
                  onDelete={async (id) => {
                    try {
                      await deleteTransaction(id);
                      toast.success('Lançamento removido com sucesso');
                    } catch (err: any) {
                      if (err.message && err.message.includes('Identificação obrigatória')) {
                        setIsActorPromptOpen(true);
                      }
                      toast.error(err.message || 'Erro ao remover lançamento.');
                    }
                  }}
                  onNewTransaction={() => navigateTo('novo')}
                  onClearFilters={() =>
                    setFilters({
                      search: '',
                      type: 'all',
                      status: 'all',
                      startDate: '',
                      endDate: '',
                    })
                  }
                  hasFilters={
                    filters.search.trim() !== '' ||
                    filters.type !== 'all' ||
                    filters.status !== 'all' ||
                    filters.startDate !== '' ||
                    filters.endDate !== ''
                  }
                />
              </div>
            )}

            {/* ==================== 3. NOVO LANÇAMENTO VIEW ==================== */}
            {activeTab === 'novo' && (
              <TransactionForm
                onSubmit={async (data) => {
                  await createTransaction(data);
                  navigateTo('lancamentos');
                }}
                onCancel={() => navigateTo('lancamentos')}
                onRequestActorName={() => setIsActorPromptOpen(true)}
              />
            )}

            {/* ==================== 4. EDITAR LANÇAMENTO VIEW ==================== */}
            {activeTab === 'editar' && (
              <div>
                {editingTx ? (
                  <TransactionForm
                    key={editingTx.id}
                    initialData={editingTx}
                    onSubmit={async (data) => {
                      await updateTransaction(editingTx.id, data);
                      navigateTo('lancamentos');
                    }}
                    onCancel={() => navigateTo('lancamentos')}
                    onRequestActorName={() => setIsActorPromptOpen(true)}
                  />
                ) : (
                  <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 text-center max-w-lg mx-auto">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                      Lançamento não encontrado ou indisponível.
                    </p>
                    <button
                      onClick={() => navigateTo('lancamentos')}
                      className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-600 text-white text-xs font-medium cursor-pointer"
                    >
                      Voltar para Lançamentos
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ==================== 5. HISTÓRICO DE ALTERAÇÕES ==================== */}
            {activeTab === 'historico' && (
              <AuditTimeline auditLogs={auditLogs} />
            )}
          </main>
        </div>
      </div>

      {/* Export Dialog Modal */}
      <ExportDialog
        isOpen={isExportOpen}
        initialFormat={exportInitialFormat}
        onClose={() => setIsExportOpen(false)}
        transactions={transactions}
      />

      {/* Responsible Actor Identification Prompt Modal */}
      <ActorPromptDialog
        isOpen={isActorPromptOpen}
        onClose={() => setIsActorPromptOpen(false)}
        onSaved={() => {
          // Actor saved
        }}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        transaction={receiptTx}
        isOpen={!!receiptTx}
        onClose={() => setReceiptTx(null)}
      />

      {/* Culto Count Calculator Modal */}
      <CultoCountModal
        isOpen={isCultoModalOpen}
        onClose={() => setIsCultoModalOpen(false)}
        onCreateTransaction={async (data) => {
          await createTransaction(data);
          navigateTo('lancamentos');
        }}
      />

      {/* Mobile Bottom Navigation Bar (< md) */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => navigateTo(tab)}
        onOpenExport={() => handleOpenExport('pdf')}
      />
    </div>
  );
}
