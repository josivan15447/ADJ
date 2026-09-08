import React, { useState } from 'react';
import { UserCheck, X } from 'lucide-react';
import { getActorName, setActorName } from '../lib/actor';
import { toast } from './Toast';

interface ActorPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (name: string) => void;
}

export function ActorPromptDialog({ isOpen, onClose, onSaved }: ActorPromptDialogProps) {
  const [name, setName] = useState(getActorName());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Informe seu nome para continuar.');
      return;
    }
    setActorName(trimmed);
    toast.success(`Identificado como: ${trimmed}`);
    onSaved(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 max-w-md w-full p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Identificação do Operador
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Para garantir a integridade e transparência da tesouraria da igreja, todas as criações, edições e exclusões são assinadas pelo seu nome.
          </p>

          <div>
            <label
              htmlFor="actor-name-input"
              className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5"
            >
              Seu nome completo ou cargo <span className="text-rose-500">*</span>
            </label>
            <input
              id="actor-name-input"
              type="text"
              autoFocus
              placeholder="Ex: Pr. Manoel Silva ou Tesoureira Débora"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-medium transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-semibold tracking-wide shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Salvar e Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
