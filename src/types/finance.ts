export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'confirmed' | 'pending';
export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao' | 'transferencia' | 'boleto' | 'outro';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  note?: string;
  payment_method?: PaymentMethod;
  payer_or_beneficiary?: string; // Nome do dizimista, ofertante ou fornecedor
  receipt_number?: string; // Número sequencial do recibo (ex: REC-2026-0042)
  envelope_number?: string; // Número do envelope de dízimo/oferta
  created_at?: string;
  updated_at?: string;
}

export type AuditAction = 'create' | 'update' | 'delete';

export interface AuditChange {
  field: string;
  label: string;
  from: any;
  to: any;
}

export interface AuditLog {
  id: string;
  transaction_id: string | null;
  action: AuditAction;
  actor_name: string;
  description: string | null;
  snapshot: Partial<Transaction> | null;
  changes: AuditChange[] | null;
  created_at: string;
}

export const INCOME_CATEGORIES = [
  'Dízimos',
  'Ofertas',
  'Ofertas especiais',
  'Campanha',
  'Missões',
  'Doações',
  'Cantina / Livraria',
  'Outros',
] as const;

export const EXPENSE_CATEGORIES = [
  'Salários pastorais',
  'Salários funcionários',
  'Aluguel',
  'Água/Luz/Internet',
  'Manutenção do templo',
  'Obra/Reforma',
  'Missões',
  'Ação social',
  'Material de culto',
  'Eventos',
  'Impostos e taxas',
  'Outros',
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface FinancialStats {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  totalPending: number;
  confirmedCount: number;
  pendingCount: number;
}
