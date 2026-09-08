import { createClient } from '@supabase/supabase-js';
import type { Transaction, AuditLog, TransactionType, TransactionStatus } from '../types/finance';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const SUPABASE_URL = metaEnv.VITE_SUPABASE_URL || 'https://ngpzbrfjzcjqyulbadsn.supabase.co';
const SUPABASE_KEY = metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ncHpicmZqemNqcXl1bGJhZHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MjgxMzksImV4cCI6MjA5OTEwNDEzOX0.t0lCs1IWtKsBRDjKEIEOyrp1quMxjWgcCqP2DEMhDrg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const LOCAL_TX_KEY = 'adj_jeruel_transactions_v3';
const LOCAL_AUDIT_KEY = 'adj_jeruel_audit_logs_v3';

// Seed sample data for first run
const now = Date.now();
const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const daysAgoISO = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    date: daysAgo(2),
    description: 'Dízimos e Ofertas - Culto de Celebração de Domingo',
    category: 'Dízimos',
    type: 'income',
    amount: 4850.00,
    status: 'confirmed',
    payment_method: 'dinheiro',
    receipt_number: 'REC-2026-0041',
    note: 'Arrecadação total conferida pela comissão de tesouraria geral após o culto noturno.',
    created_at: daysAgoISO(2),
    updated_at: daysAgoISO(2),
  },
  {
    id: 'c9a646d3-9c61-4cb7-897e-128a1c97a552',
    date: daysAgo(3),
    description: 'Oferta Especial de Missões - Campo Rio Branco & Ribeirinhos',
    category: 'Missões',
    type: 'income',
    amount: 1420.50,
    status: 'confirmed',
    payment_method: 'pix',
    receipt_number: 'REC-2026-0040',
    payer_or_beneficiary: 'Membros da Congregação Jeruel',
    note: 'Oferta missionária voluntária destinada ao sustento da obra no interior do Acre.',
    created_at: daysAgoISO(3),
    updated_at: daysAgoISO(3),
  },
  {
    id: 'd1b2c3d4-e5f6-7890-abcd-ef1234567890',
    date: daysAgo(5),
    description: 'Conta de Energia Elétrica (Energisa Acre) - Templo Sede',
    category: 'Água/Luz/Internet',
    type: 'expense',
    amount: 830.40,
    status: 'confirmed',
    payment_method: 'boleto',
    receipt_number: 'DESP-2026-0018',
    payer_or_beneficiary: 'Energisa Acre Distribuidora',
    note: 'Fatura de energia com vencimento pago pontualmente via débito da igreja.',
    created_at: daysAgoISO(5),
    updated_at: daysAgoISO(5),
  },
  {
    id: 'e2a3b4c5-d6e7-8901-bcde-fa2345678901',
    date: daysAgo(7),
    description: 'Campanha de Reforma do Telhado e Forro Acústico do Templo',
    category: 'Campanha',
    type: 'income',
    amount: 3200.00,
    status: 'confirmed',
    payment_method: 'pix',
    receipt_number: 'REC-2026-0039',
    note: 'Contribuição especial de irmãos e amigos da igreja para as obras de conservação.',
    created_at: daysAgoISO(7),
    updated_at: daysAgoISO(7),
  },
  {
    id: 'f3b4c5d6-e7f8-9012-cdef-ab3456789012',
    date: daysAgo(10),
    description: 'Manutenção do Sistema de Som, Microfones e Cabos XLR',
    category: 'Manutenção do templo',
    type: 'expense',
    amount: 450.00,
    status: 'confirmed',
    payment_method: 'pix',
    payer_or_beneficiary: 'Eletrônica e Áudio Central',
    receipt_number: 'DESP-2026-0017',
    note: 'Substituição de conectores estéreo, 2 cabos blindados e revisão de canais da mesa de som.',
    created_at: daysAgoISO(10),
    updated_at: daysAgoISO(10),
  },
  {
    id: 'a4b5c6d7-e8f9-0123-defa-bc4567890123',
    date: daysAgo(1),
    description: 'Compra de Pães, Suco de Uva e Material de Ceia do Senhor',
    category: 'Material de culto',
    type: 'expense',
    amount: 320.00,
    status: 'pending',
    payment_method: 'cartao',
    payer_or_beneficiary: 'Panificadora & Conveniência Vitória',
    note: 'Aguardando nota fiscal detalhada da livraria e padaria para quitação e arquivo.',
    created_at: daysAgoISO(1),
    updated_at: daysAgoISO(1),
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    transaction_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    action: 'create',
    actor_name: 'Pr. Manoel Silva',
    description: 'Dízimos e Ofertas - Culto de Celebração de Domingo',
    snapshot: INITIAL_TRANSACTIONS[0],
    changes: null,
    created_at: daysAgoISO(2),
  },
  {
    id: 'audit-002',
    transaction_id: 'c9a646d3-9c61-4cb7-897e-128a1c97a552',
    action: 'create',
    actor_name: 'Tesoureira Débora Lima',
    description: 'Oferta Especial de Missões - Campo Rio Branco & Ribeirinhos',
    snapshot: INITIAL_TRANSACTIONS[1],
    changes: null,
    created_at: daysAgoISO(3),
  },
];

function dbStatusToAppStatus(status: string): TransactionStatus {
  if (status === 'paid' || status === 'confirmed') return 'confirmed';
  return 'pending';
}

function appStatusToDbStatus(status: TransactionStatus): string {
  return status === 'confirmed' ? 'paid' : 'pending';
}

export function loadLocalTransactions(): Transaction[] {
  if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(LOCAL_TX_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TRANSACTIONS;
  } catch (e) {
    console.error('Error loading local transactions', e);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveLocalTransactions(txs: Transaction[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(txs));
  } catch (e) {
    console.error('Error saving local transactions', e);
  }
}

export function loadLocalAuditLogs(): AuditLog[] {
  if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
  try {
    const raw = localStorage.getItem(LOCAL_AUDIT_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_AUDIT_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_AUDIT_LOGS;
  } catch (e) {
    console.error('Error loading local audit logs', e);
    return INITIAL_AUDIT_LOGS;
  }
}

export function saveLocalAuditLogs(logs: AuditLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_AUDIT_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving local audit logs', e);
  }
}

export async function fetchRemoteTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return loadLocalTransactions();
    }

    const mapped: Transaction[] = data.map((r: any) => ({
      id: r.id,
      date: r.date,
      description: r.description,
      category: r.category,
      type: r.type as TransactionType,
      amount: typeof r.amount === 'string' ? parseFloat(r.amount) || 0 : Number(r.amount) || 0,
      status: dbStatusToAppStatus(r.status),
      note: r.note || '',
      payment_method: r.payment_method || 'dinheiro',
      payer_or_beneficiary: r.payer_or_beneficiary || '',
      receipt_number: r.receipt_number || '',
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
    saveLocalTransactions(mapped);
    return mapped;
  } catch (err) {
    return loadLocalTransactions();
  }
}

export async function fetchRemoteAuditLogs(): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('transaction_audit_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return loadLocalAuditLogs();
    }

    const mapped: AuditLog[] = data.map((r: any) => ({
      id: r.id,
      transaction_id: r.transaction_id,
      action: r.action,
      actor_name: r.actor_name,
      description: r.description,
      snapshot: r.snapshot,
      changes: r.changes,
      created_at: r.created_at,
    }));
    saveLocalAuditLogs(mapped);
    return mapped;
  } catch (err) {
    return loadLocalAuditLogs();
  }
}
