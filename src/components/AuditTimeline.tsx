import React, { useState } from 'react';
import {
  History,
  PlusCircle,
  Pencil,
  Trash2,
  UserCheck,
  Search,
  CheckCircle,
  Clock,
} from 'lucide-react';
import type { AuditLog } from '../types/finance';
import { formatBRL, formatDateBR, formatDateTimeBR } from '../lib/formatters';
import { getActorName, setActorName } from '../lib/actor';
import { toast } from './Toast';

interface AuditTimelineProps {
  auditLogs: AuditLog[];
}

export function AuditTimeline({ auditLogs }: AuditTimelineProps) {
  const [currentActor, setCurrentActor] = useState<string>(getActorName());
  const [actorInput, setActorInput] = useState<string>(getActorName());
  const [filterAction, setFilterAction] = useState<'all' | 'create' | 'update' | 'delete'>('all');
  const [search, setSearch] = useState<string>('');

  const handleSaveActor = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = actorInput.trim();
    if (!trimmed) {
      toast.error('Informe um nome válido para o responsável.');
      return;
    }
    setActorName(trimmed);
    setCurrentActor(trimmed);
    toast.success('Nome do responsável salvo com sucesso');
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchActor = (log.actor_name || '').toLowerCase().includes(q);
      const matchDesc = (log.description || '').toLowerCase().includes(q);
      if (!matchActor && !matchDesc) return false;
    }
    return true;
  });

  const renderValue = (field: string, val: any) => {
    if (val === null || val === undefined || val === '') {
      return <span className="text-zinc-400 italic">(vazio)</span>;
    }
    if (field === 'amount') {
      return formatBRL(Number(val));
    }
    if (field === 'date') {
      return formatDateBR(String(val));
    }
    if (field === 'type') {
      return val === 'income' ? 'Entrada' : 'Saída';
    }
    if (field === 'status') {
      return val === 'confirmed' || val === 'paid' ? 'Confirmado' : 'Pendente';
    }
    return String(val);
  };

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'create':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20">
            <PlusCircle className="w-3 h-3" />
            <span>Criou</span>
          </span>
        );
      case 'update':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/20">
            <Pencil className="w-3 h-3" />
            <span>Editou</span>
          </span>
        );
      case 'delete':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-1 ring-rose-500/20">
            <Trash2 className="w-3 h-3" />
            <span>Excluiu</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 26. IDENTIFICAÇÃO DO RESPONSÁVEL */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50 font-semibold text-base">
              <UserCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Operador Responsável da Tesouraria</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              O nome informado será gravado como autor de todas as criações, edições e exclusões no livro caixa.
            </p>
          </div>
          <form onSubmit={handleSaveActor} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Ex: Pr. Manoel Silva ou Débora Lima"
              value={actorInput}
              onChange={(e) => setActorInput(e.target.value)}
              className="bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 flex-1 sm:w-60"
            />
            <button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all active:scale-95 shrink-0 cursor-pointer shadow-xs"
            >
              Salvar
            </button>
          </form>
        </div>

        {currentActor ? (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>
              Identificado atualmente como: <strong>{currentActor}</strong>
            </span>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-amber-600 dark:text-amber-400 font-medium">
            Nenhum responsável identificado. Defina seu nome acima para poder registrar ou editar lançamentos.
          </div>
        )}
      </div>

      {/* 24 & 25. TIMELINE DE AUDITORIA */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Histórico de Auditoria</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Registro cronológico de todas as modificações no livro caixa
            </p>
          </div>

          {/* Filtros da Timeline */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filtrar por autor ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 w-full sm:w-52"
              />
            </div>

            {/* Ação filter */}
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value as any)}
              className="bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="all">Todas as ações</option>
              <option value="create">Criações</option>
              <option value="update">Edições</option>
              <option value="delete">Exclusões</option>
            </select>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
            <p className="italic">Nenhum registro encontrado no histórico.</p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
            {filteredLogs.map((entry) => (
              <div key={entry.id} className="relative group">
                {/* Timeline node */}
                <div
                  className={`absolute -left-[27px] sm:-left-[35px] top-2 w-3.5 h-3.5 rounded-full border-2 bg-white dark:bg-zinc-900 ${
                    entry.action === 'create'
                      ? 'border-emerald-500'
                      : entry.action === 'update'
                      ? 'border-amber-500'
                      : 'border-rose-500'
                  }`}
                />
                <div className="bg-zinc-50/60 dark:bg-zinc-800/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                  {/* Event Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {getActionBadge(entry.action)}
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {entry.actor_name || 'Desconhecido'}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 font-medium tabular-nums">
                      <Clock className="w-3 h-3" />
                      <span>{formatDateTimeBR(entry.created_at)}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1.5">
                    {entry.description || 'Lançamento sem descrição'}
                  </div>

                  {/* 25. AUDITORIA DE EDIÇÕES: Diff de valores */}
                  {entry.action === 'update' && entry.changes && entry.changes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                        Alterações registradas:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {entry.changes.map((c, i) => (
                          <div
                            key={i}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5"
                          >
                            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                              {c.label}:
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="line-through text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded text-xs tabular-nums">
                                {renderValue(c.field, c.from)}
                              </span>
                              <span className="text-zinc-400">→</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded text-xs tabular-nums">
                                {renderValue(c.field, c.to)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Snapshot information for creations or deletions */}
                  {entry.action !== 'update' && entry.snapshot && (
                    <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
                      {entry.snapshot.amount !== undefined && (
                        <span>
                          Valor:{' '}
                          <strong className="text-zinc-900 dark:text-zinc-100 tabular-nums">
                            {formatBRL(entry.snapshot.amount)}
                          </strong>
                        </span>
                      )}
                      {entry.snapshot.category && (
                        <span>
                          Categoria:{' '}
                          <strong className="text-zinc-900 dark:text-zinc-100">
                            {entry.snapshot.category}
                          </strong>
                        </span>
                      )}
                      {entry.snapshot.type && (
                        <span>
                          Tipo:{' '}
                          <strong className="text-zinc-900 dark:text-zinc-100">
                            {entry.snapshot.type === 'income' ? 'Entrada' : 'Saída'}
                          </strong>
                        </span>
                      )}
                      {entry.snapshot.receipt_number && (
                        <span>
                          Recibo:{' '}
                          <strong className="text-zinc-900 dark:text-zinc-100 font-mono">
                            {entry.snapshot.receipt_number}
                          </strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
