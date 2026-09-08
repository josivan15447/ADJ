import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import type { Transaction, TransactionType, TransactionStatus, PaymentMethod } from '../types/finance';
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from '../types/finance';
import { getTodayISODate, parseBRLInput, formatBRL } from '../lib/formatters';
import { hasActorName } from '../lib/actor';
import { toast } from './Toast';

interface TransactionFormProps {
  key?: React.Key;
  initialData?: Transaction;
  onSubmit: (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  onRequestActorName: () => void;
}

export function TransactionForm({
  initialData,
  onSubmit,
  onCancel,
  onRequestActorName,
}: TransactionFormProps) {
  const isEditing = !!initialData;
  const [type, setType] = useState<TransactionType>(initialData?.type || 'income');
  const [date, setDate] = useState<string>(initialData?.date || getTodayISODate());
  const [amountStr, setAmountStr] = useState<string>(
    initialData ? initialData.amount.toFixed(2).replace('.', ',') : ''
  );
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [category, setCategory] = useState<string>(
    initialData?.category || (initialData?.type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0])
  );
  const [status, setStatus] = useState<TransactionStatus>(initialData?.status || 'confirmed');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialData?.payment_method || 'dinheiro');
  const [payerOrBeneficiary, setPayerOrBeneficiary] = useState<string>(initialData?.payer_or_beneficiary || '');
  const [envelopeNumber, setEnvelopeNumber] = useState<string>(initialData?.envelope_number || '');
  const [note, setNote] = useState<string>(initialData?.note || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setDate(initialData.date);
      setAmountStr(initialData.amount.toFixed(2).replace('.', ','));
      setDescription(initialData.description);
      setCategory(initialData.category);
      setStatus(initialData.status);
      setPaymentMethod(initialData.payment_method || 'dinheiro');
      setPayerOrBeneficiary(initialData.payer_or_beneficiary || '');
      setEnvelopeNumber(initialData.envelope_number || '');
      setNote(initialData.note || '');
    }
  }, [initialData]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      if (!(INCOME_CATEGORIES as readonly string[]).includes(category)) {
        setCategory(INCOME_CATEGORIES[0]);
      }
    } else {
      if (!(EXPENSE_CATEGORIES as readonly string[]).includes(category)) {
        setCategory(EXPENSE_CATEGORIES[0]);
      }
    }
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/[^0-9,.]/g, '');
    setAmountStr(val);
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!hasActorName()) {
      newErrors.actor = 'Identifique seu nome no histórico antes de registrar ações.';
      onRequestActorName();
      return false;
    }
    if (!date) {
      newErrors.date = 'A data do lançamento é obrigatória.';
    }
    const cleanDesc = description.trim();
    if (!cleanDesc) {
      newErrors.description = 'A descrição do lançamento é obrigatória.';
    } else if (cleanDesc.length > 120) {
      newErrors.description = 'A descrição deve ter no máximo 120 caracteres.';
    }

    const parsedAmount = parseBRLInput(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Informe um valor válido maior que zero.';
    } else if (parsedAmount > 10000000) {
      newErrors.amount = 'O valor não pode ultrapassar R$ 10.000.000,00.';
    }

    if (!category) {
      newErrors.category = 'Selecione uma categoria válida.';
    }
    if (!status) {
      newErrors.status = 'Selecione a situação do lançamento.';
    }
    if (note && note.length > 500) {
      newErrors.note = 'A observação deve ter no máximo 500 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const parsedAmount = Math.round(parseBRLInput(amountStr) * 100) / 100;
    try {
      setIsSubmitting(true);
      await onSubmit({
        date,
        description: description.trim(),
        category,
        type,
        amount: parsedAmount,
        status,
        payment_method: paymentMethod,
        payer_or_beneficiary: payerOrBeneficiary.trim() || undefined,
        envelope_number: envelopeNumber.trim() || undefined,
        note: note.trim() || undefined,
      });
      toast.success(isEditing ? 'Lançamento atualizado' : 'Lançamento registrado');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar o lançamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentParsed = parseBRLInput(amountStr);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs p-5 sm:p-7">
        <div className="mb-6 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isEditing
              ? 'Atualize as informações financeiras deste registro no livro caixa'
              : 'Preencha os dados abaixo para lançar no fluxo financeiro da igreja'}
          </p>
        </div>

        {errors.actor && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{errors.actor}</p>
              <button
                type="button"
                onClick={onRequestActorName}
                className="underline mt-1 font-medium hover:text-rose-900 dark:hover:text-rose-200 cursor-pointer"
              >
                Clique aqui para definir seu nome agora
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 16. TIPO DE MOVIMENTO */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Tipo de Movimento <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opção ENTRADA */}
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 relative cursor-pointer ${
                  type === 'income'
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700/80 hover:border-emerald-400 dark:hover:border-emerald-500/50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    type === 'income'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                  }`}
                >
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <div
                    className={`font-semibold text-sm tracking-wide ${
                      type === 'income' ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    ENTRADA (RECEITA)
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Dízimos, ofertas, campanhas, doações
                  </div>
                </div>
              </button>

              {/* Opção SAÍDA */}
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 relative cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700/80 hover:border-rose-400 dark:hover:border-rose-500/50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    type === 'expense'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                  }`}
                >
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <div>
                  <div
                    className={`font-semibold text-sm tracking-wide ${
                      type === 'expense' ? 'text-rose-700 dark:text-rose-400' : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    SAÍDA (DESPESA)
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Contas, salários, manutenção, obras
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Data e Valor em 2 colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Data */}
            <div>
              <label
                htmlFor="tx-date"
                className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5"
              >
                Data <span className="text-rose-500">*</span>
              </label>
              <input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
                }}
                className={`w-full bg-zinc-50/70 dark:bg-zinc-800/40 border rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
                  errors.date ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-700/80'
                }`}
              />
              {errors.date && (
                <p className="text-xs text-rose-500 mt-1">{errors.date}</p>
              )}
            </div>

            {/* Valor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="tx-amount"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                >
                  Valor <span className="text-rose-500">*</span>
                </label>
                {!isNaN(currentParsed) && currentParsed > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatBRL(currentParsed)}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 pointer-events-none">
                  R$
                </span>
                <input
                  id="tx-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amountStr}
                  onChange={handleAmountChange}
                  className={`w-full bg-zinc-50/70 dark:bg-zinc-800/40 border rounded-lg pl-9 pr-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
                    errors.amount ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-700/80'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="tx-desc"
                className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
              >
                Descrição <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-zinc-400">
                {description.length}/120
              </span>
            </div>
            <input
              id="tx-desc"
              type="text"
              maxLength={120}
              placeholder={
                type === 'income'
                  ? 'Ex: Dízimo do irmão João Silva ou Oferta do Culto'
                  : 'Ex: Conta de energia elétrica (Energisa) - Junho'
              }
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              className={`w-full bg-zinc-50/70 dark:bg-zinc-800/40 border rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
                errors.description ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-700/80'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Categoria e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Categoria */}
            <div>
              <label
                htmlFor="tx-category"
                className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5"
              >
                Categoria <span className="text-rose-500">*</span>
              </label>
              <select
                id="tx-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-rose-500 mt-1">{errors.category}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="tx-status"
                className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5"
              >
                Situação / Status <span className="text-rose-500">*</span>
              </label>
              <select
                id="tx-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                className="w-full bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              >
                <option value="confirmed">Confirmado (Efetivado)</option>
                <option value="pending">Pendente (Aguardando conferência/quitação)</option>
              </select>
              {errors.status && (
                <p className="text-xs text-rose-500 mt-1">{errors.status}</p>
              )}
            </div>
          </div>

          {/* Forma de Pagamento e Contribuinte/Favorecido (New Improvement!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="tx-method"
                className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5"
              >
                Forma de Pagamento
              </label>
              <select
                id="tx-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              >
                <option value="dinheiro">Dinheiro em Espécie</option>
                <option value="pix">PIX</option>
                <option value="cartao">Cartão de Débito/Crédito</option>
                <option value="transferencia">Transferência Bancária</option>
                <option value="boleto">Boleto Bancário</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="tx-payer"
                className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5"
              >
                {type === 'income' ? 'Contribuinte / Dizimista' : 'Favorecido / Fornecedor'}
              </label>
              <input
                id="tx-payer"
                type="text"
                placeholder={type === 'income' ? 'Nome do irmão(ã) ou anônimo' : 'Nome da empresa ou prestador'}
                value={payerOrBeneficiary}
                onChange={(e) => setPayerOrBeneficiary(e.target.value)}
                className="w-full bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Nº do Envelope (Opcional) */}
          {type === 'income' && (
            <div>
              <label
                htmlFor="tx-envelope"
                className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5"
              >
                Nº do Envelope <span className="text-zinc-400 font-normal lowercase">(opcional)</span>
              </label>
              <input
                id="tx-envelope"
                type="text"
                placeholder="Ex: ENV-104"
                value={envelopeNumber}
                onChange={(e) => setEnvelopeNumber(e.target.value)}
                className="w-full bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
          )}

          {/* Observações */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="tx-note"
                className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
              >
                Observações <span className="text-zinc-400 font-normal lowercase">(opcional)</span>
              </label>
              <span className="text-[10px] text-zinc-400">{note.length}/500</span>
            </div>
            <textarea
              id="tx-note"
              rows={3}
              maxLength={500}
              placeholder="Informações adicionais, número de recibo, detalhes do comprovante..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg p-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
            />
            {errors.note && (
              <p className="text-xs text-rose-500 mt-1">{errors.note}</p>
            )}
          </div>

          {/* BOTÕES DO FORMULÁRIO */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-semibold tracking-wide shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Salvar Alterações' : 'Registrar Lançamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
