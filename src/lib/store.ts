import { useState, useEffect, useCallback } from 'react';
import type { Transaction, AuditLog, AuditChange, FinancialStats } from '../types/finance';
import {
  supabase,
  loadLocalTransactions,
  saveLocalTransactions,
  loadLocalAuditLogs,
  saveLocalAuditLogs,
  fetchRemoteTransactions,
  fetchRemoteAuditLogs,
} from './supabase';
import { getActorName } from './actor';

const FIELD_LABELS: Record<string, string> = {
  date: 'Data',
  description: 'Descrição',
  category: 'Categoria',
  type: 'Tipo',
  amount: 'Valor',
  status: 'Situação / Status',
  note: 'Observações',
  payment_method: 'Forma de Pagamento',
  payer_or_beneficiary: 'Contribuinte / Favorecido',
  envelope_number: 'Nº do Envelope',
  receipt_number: 'Nº do Recibo',
};

export function diffTransactions(before: Transaction, after: Transaction): AuditChange[] {
  const changes: AuditChange[] = [];
  const fieldsToCheck: (keyof Transaction)[] = [
    'date',
    'description',
    'category',
    'type',
    'amount',
    'status',
    'note',
    'payment_method',
    'payer_or_beneficiary',
    'envelope_number',
    'receipt_number',
  ];

  for (const field of fieldsToCheck) {
    if (field === 'amount') {
      const beforeAmt = Math.round(Number(before.amount || 0) * 100) / 100;
      const afterAmt = Math.round(Number(after.amount || 0) * 100) / 100;
      if (Math.abs(beforeAmt - afterAmt) > 0.001) {
        changes.push({
          field,
          label: FIELD_LABELS[field] || field,
          from: beforeAmt,
          to: afterAmt,
        });
      }
      continue;
    }

    const beforeVal = (before[field] ?? '').toString().trim();
    const afterVal = (after[field] ?? '').toString().trim();
    if (beforeVal !== afterVal) {
      changes.push({
        field,
        label: FIELD_LABELS[field] || field,
        from: before[field] ?? null,
        to: after[field] ?? null,
      });
    }
  }

  return changes;
}

export function sortTransactions(txs: Transaction[]): Transaction[] {
  return [...txs].sort((a, b) => {
    const dateComp = (b.date || '').localeCompare(a.date || '');
    if (dateComp !== 0) return dateComp;
    return (b.created_at || '').localeCompare(a.created_at || '');
  });
}

// Global subscribers for multi-component reactive sync
type Listener = () => void;
const listeners = new Set<Listener>();

let currentTransactions: Transaction[] = sortTransactions(loadLocalTransactions());
let currentAuditLogs: AuditLog[] = loadLocalAuditLogs();
let isInitialized = false;

function notifyListeners() {
  listeners.forEach((l) => l());
}

export async function initializeStore() {
  if (isInitialized) return;
  isInitialized = true;
  try {
    const [remoteTxs, remoteLogs] = await Promise.all([
      fetchRemoteTransactions(),
      fetchRemoteAuditLogs(),
    ]);
    if (remoteTxs && remoteTxs.length > 0) {
      currentTransactions = sortTransactions(remoteTxs);
    }
    if (remoteLogs && remoteLogs.length > 0) {
      currentAuditLogs = remoteLogs;
    }
    notifyListeners();
  } catch (err) {
    console.warn('Initial remote fetch failed, continuing with local store:', err);
  }
}

export function useFinanceStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    listeners.add(handleUpdate);
    initializeStore();
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const round2 = (val: number) => Math.round(val * 100) / 100;

  const totalIncome = round2(
    currentTransactions
      .filter((t) => t.type === 'income' && t.status === 'confirmed')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
  );

  const totalExpense = round2(
    currentTransactions
      .filter((t) => t.type === 'expense' && t.status === 'confirmed')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
  );

  const totalPending = round2(
    currentTransactions
      .filter((t) => t.status === 'pending')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
  );

  const confirmedCount = currentTransactions.filter((t) => t.status === 'confirmed').length;
  const pendingCount = currentTransactions.filter((t) => t.status === 'pending').length;

  const stats: FinancialStats = {
    totalIncome,
    totalExpense,
    totalPending,
    balance: round2(totalIncome - totalExpense),
    confirmedCount,
    pendingCount,
  };

  const getNextReceiptNumber = (type: 'income' | 'expense'): string => {
    const prefix = type === 'income' ? 'REC' : 'DESP';
    const year = new Date().getFullYear();
    const count = currentTransactions.filter((t) => t.type === type).length + 1;
    return `${prefix}-${year}-${String(count).padStart(4, '0')}`;
  };

  const createTransaction = useCallback(
    async (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> => {
      const actor = getActorName();
      if (!actor) {
        throw new Error('Identificação obrigatória: informe seu nome no histórico antes de registrar.');
      }

      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const nowStr = new Date().toISOString();

      const receiptNumber = data.receipt_number || getNextReceiptNumber(data.type);

      const newTx: Transaction = {
        ...data,
        receipt_number: receiptNumber,
        id,
        created_at: nowStr,
        updated_at: nowStr,
      };

      currentTransactions = sortTransactions([newTx, ...currentTransactions]);
      saveLocalTransactions(currentTransactions);

      const auditEntry: AuditLog = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `audit-${Date.now()}`,
        transaction_id: id,
        action: 'create',
        actor_name: actor,
        description: newTx.description,
        snapshot: newTx,
        changes: null,
        created_at: nowStr,
      };

      currentAuditLogs = [auditEntry, ...currentAuditLogs];
      saveLocalAuditLogs(currentAuditLogs);
      notifyListeners();

      // Async write to Supabase
      Promise.resolve(
        supabase.from('transactions').insert({
          id: newTx.id,
          date: newTx.date,
          description: newTx.description,
          category: newTx.category,
          type: newTx.type,
          amount: newTx.amount,
          status: newTx.status === 'confirmed' ? 'paid' : 'pending',
          note: newTx.note || null,
        })
      ).catch(() => {});

      return newTx;
    },
    []
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>): Promise<Transaction> => {
      const actor = getActorName();
      if (!actor) {
        throw new Error('Identificação obrigatória: informe seu nome no histórico antes de editar.');
      }

      const existingIndex = currentTransactions.findIndex((t) => t.id === id);
      if (existingIndex === -1) {
        throw new Error('Lançamento não encontrado.');
      }

      const oldTx = currentTransactions[existingIndex];
      const nowStr = new Date().toISOString();
      const updatedTx: Transaction = {
        ...oldTx,
        ...updates,
        updated_at: nowStr,
      };

      const changes = diffTransactions(oldTx, updatedTx);
      currentTransactions[existingIndex] = updatedTx;
      currentTransactions = sortTransactions(currentTransactions);
      saveLocalTransactions(currentTransactions);

      if (changes.length > 0) {
        const auditEntry: AuditLog = {
          id: typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `audit-${Date.now()}`,
          transaction_id: id,
          action: 'update',
          actor_name: actor,
          description: updatedTx.description,
          snapshot: updatedTx,
          changes,
          created_at: nowStr,
        };
        currentAuditLogs = [auditEntry, ...currentAuditLogs];
        saveLocalAuditLogs(currentAuditLogs);
      }

      notifyListeners();

      // Async remote update
      Promise.resolve(
        supabase
          .from('transactions')
          .update({
            date: updatedTx.date,
            description: updatedTx.description,
            category: updatedTx.category,
            type: updatedTx.type,
            amount: updatedTx.amount,
            status: updatedTx.status === 'confirmed' ? 'paid' : 'pending',
            note: updatedTx.note || null,
            updated_at: nowStr,
          })
          .eq('id', id)
      ).catch(() => {});

      return updatedTx;
    },
    []
  );

  const confirmTransaction = useCallback(
    async (id: string): Promise<Transaction> => {
      return updateTransaction(id, { status: 'confirmed' });
    },
    [updateTransaction]
  );

  const duplicateTransaction = useCallback(
    async (id: string): Promise<Transaction> => {
      const original = currentTransactions.find((t) => t.id === id);
      if (!original) throw new Error('Lançamento não encontrado');
      return createTransaction({
        date: new Date().toISOString().slice(0, 10),
        description: `${original.description} (Cópia)`,
        category: original.category,
        type: original.type,
        amount: original.amount,
        status: 'confirmed',
        payment_method: original.payment_method,
        payer_or_beneficiary: original.payer_or_beneficiary,
        note: original.note,
      });
    },
    [createTransaction]
  );

  const deleteTransaction = useCallback(
    async (id: string): Promise<void> => {
      const actor = getActorName();
      if (!actor) {
        throw new Error('Identificação obrigatória: informe seu nome no histórico antes de excluir.');
      }

      const existing = currentTransactions.find((t) => t.id === id);
      if (!existing) {
        throw new Error('Lançamento não encontrado.');
      }

      const nowStr = new Date().toISOString();
      const auditEntry: AuditLog = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `audit-${Date.now()}`,
        transaction_id: id,
        action: 'delete',
        actor_name: actor,
        description: existing.description,
        snapshot: existing,
        changes: null,
        created_at: nowStr,
      };

      currentTransactions = currentTransactions.filter((t) => t.id !== id);
      currentAuditLogs = [auditEntry, ...currentAuditLogs];
      saveLocalTransactions(currentTransactions);
      saveLocalAuditLogs(currentAuditLogs);
      notifyListeners();

      // Remote delete
      Promise.resolve(supabase.from('transactions').delete().eq('id', id)).catch(() => {});
    },
    []
  );

  const getTransactionById = useCallback((id: string): Transaction | undefined => {
    return currentTransactions.find((t) => t.id === id);
  }, []);

  const exportBackupJSON = useCallback((): void => {
    const backup = {
      app: 'ADJ Jeruel - Tesouraria',
      exported_at: new Date().toISOString(),
      transactions: currentTransactions,
      auditLogs: currentAuditLogs,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `backup_adj_jeruel_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, []);

  const restoreBackupJSON = useCallback((jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed.transactions)) {
        currentTransactions = sortTransactions(parsed.transactions);
        saveLocalTransactions(currentTransactions);
        if (Array.isArray(parsed.auditLogs)) {
          currentAuditLogs = parsed.auditLogs;
          saveLocalAuditLogs(currentAuditLogs);
        }
        notifyListeners();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    transactions: currentTransactions,
    auditLogs: currentAuditLogs,
    stats,
    createTransaction,
    updateTransaction,
    confirmTransaction,
    duplicateTransaction,
    deleteTransaction,
    getTransactionById,
    exportBackupJSON,
    restoreBackupJSON,
  };
}
