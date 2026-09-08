import React, { useState, useMemo } from 'react';
import { Calculator, X, PlusCircle, CheckCircle2 } from 'lucide-react';
import { formatBRL, getTodayISODate } from '../lib/formatters';
import { toast } from './Toast';

interface CultoCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTransaction: (data: {
    date: string;
    description: string;
    category: string;
    type: 'income';
    amount: number;
    status: 'confirmed';
    payment_method: 'dinheiro' | 'pix';
    note: string;
  }) => Promise<void>;
}

export function CultoCountModal({
  isOpen,
  onClose,
  onCreateTransaction,
}: CultoCountModalProps) {
  const [cultoName, setCultoName] = useState('Culto de Celebração de Domingo');
  const [date, setDate] = useState(getTodayISODate());

  // Bills count
  const [bills, setBills] = useState<Record<number, number>>({
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    2: 0,
  });

  // Coins count
  const [coins, setCoins] = useState<Record<string, number>>({
    '1.00': 0,
    '0.50': 0,
    '0.25': 0,
    '0.10': 0,
    '0.05': 0,
  });

  // Digital amounts
  const [pixAmount, setPixAmount] = useState<string>('');
  const [cardAmount, setCardAmount] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const totalCedulas = useMemo(() => {
    return Object.entries(bills).reduce((acc, [value, count]) => {
      return acc + Number(value) * Number(count || 0);
    }, 0);
  }, [bills]);

  const totalMoedas = useMemo(() => {
    return Object.entries(coins).reduce((acc, [value, count]) => {
      return acc + parseFloat(value) * Number(count || 0);
    }, 0);
  }, [coins]);

  const totalDinheiro = useMemo(() => {
    return Math.round((totalCedulas + totalMoedas) * 100) / 100;
  }, [totalCedulas, totalMoedas]);

  const numPix = parseFloat(pixAmount.replace(',', '.')) || 0;
  const numCard = parseFloat(cardAmount.replace(',', '.')) || 0;

  const totalGeral = useMemo(() => {
    return Math.round((totalDinheiro + numPix + numCard) * 100) / 100;
  }, [totalDinheiro, numPix, numCard]);

  if (!isOpen) return null;

  const handleBillChange = (val: number, countStr: string) => {
    const count = parseInt(countStr, 10) || 0;
    setBills((prev) => ({ ...prev, [val]: Math.max(0, count) }));
  };

  const handleCoinChange = (val: string, countStr: string) => {
    const count = parseInt(countStr, 10) || 0;
    setCoins((prev) => ({ ...prev, [val]: Math.max(0, count) }));
  };

  const handleSaveAsTransaction = async () => {
    if (totalGeral <= 0) {
      toast.error('O total arrecadado precisa ser maior que zero.');
      return;
    }

    try {
      setIsSaving(true);
      const breakdown = [
        `Contagem de Culto: ${cultoName}`,
        `Espécie / Dinheiro: ${formatBRL(totalDinheiro)} (Cédulas: ${formatBRL(totalCedulas)}, Moedas: ${formatBRL(totalMoedas)})`,
        numPix > 0 ? `Pix recebido no culto: ${formatBRL(numPix)}` : null,
        numCard > 0 ? `Cartão / Máquina: ${formatBRL(numCard)}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      await onCreateTransaction({
        date,
        description: `Arrecadação - ${cultoName}`,
        category: 'Dízimos',
        type: 'income',
        amount: totalGeral,
        status: 'confirmed',
        payment_method: totalDinheiro > 0 ? 'dinheiro' : 'pix',
        note: breakdown,
      });

      toast.success('Lançamento da contagem do culto registrado com sucesso!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao registrar contagem.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 max-w-2xl w-full p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Contagem e Fechamento de Culto
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Calculadora rápida de cédulas, moedas e pix arrecadados no ofertório
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-5">
          {/* Header Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Nome do Culto / Reunião
              </label>
              <input
                type="text"
                value={cultoName}
                onChange={(e) => setCultoName(e.target.value)}
                className="w-full bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Data do Culto
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Cédulas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Cédulas em Espécie
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                Subtotal: {formatBRL(totalCedulas)}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[200, 100, 50, 20, 10, 5, 2].map((noteVal) => (
                <div
                  key={noteVal}
                  className="bg-zinc-50/60 dark:bg-zinc-800/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-2 flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    R$ {noteVal}
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={bills[noteVal] || ''}
                    onChange={(e) => handleBillChange(noteVal, e.target.value)}
                    className="w-16 text-right bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Moedas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Moedas
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                Subtotal: {formatBRL(totalMoedas)}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: 'R$ 1,00', key: '1.00' },
                { label: 'R$ 0,50', key: '0.50' },
                { label: 'R$ 0,25', key: '0.25' },
                { label: 'R$ 0,10', key: '0.10' },
                { label: 'R$ 0,05', key: '0.05' },
              ].map((coin) => (
                <div
                  key={coin.key}
                  className="bg-zinc-50/60 dark:bg-zinc-800/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg p-2 flex items-center justify-between gap-1"
                >
                  <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                    {coin.label}
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={coins[coin.key] || ''}
                    onChange={(e) => handleCoinChange(coin.key, e.target.value)}
                    className="w-12 text-right bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-1 text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pix e Cartão */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Pix do Culto (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={pixAmount}
                onChange={(e) => setPixAmount(e.target.value)}
                className="w-full bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Máquina de Cartão (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={cardAmount}
                onChange={(e) => setCardAmount(e.target.value)}
                className="w-full bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Grand Total Highlight Box */}
          <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300 block">
                  Total Arrecadado no Culto
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Dinheiro ({formatBRL(totalDinheiro)}) + Pix/Cartão ({formatBRL(numPix + numCard)})
                </span>
              </div>
            </div>
            <div className="text-right font-bold text-2xl text-amber-700 dark:text-amber-400 tabular-nums">
              {formatBRL(totalGeral)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-medium transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveAsTransaction}
            disabled={isSaving || totalGeral <= 0}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-semibold tracking-wide shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Salvar no Livro Caixa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
