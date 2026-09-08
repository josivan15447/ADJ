import { useRef } from 'react';
import { Printer, X, Download, Church, CheckCircle2 } from 'lucide-react';
import type { Transaction } from '../types/finance';
import { formatBRL, formatDateBR, formatNumberToExtensoBRL } from '../lib/formatters';
import jsPDF from 'jspdf';

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptModal({ transaction, isOpen, onClose }: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === 'income';
  const receiptTitle = isIncome ? 'RECIBO DE CONTRIBUIÇÃO ECLESIÁSTICA' : 'COMPROVANTE DE PAGAMENTO / DESPESA';
  const valorExtenso = formatNumberToExtensoBRL(transaction.amount);
  const receiptNumber = transaction.receipt_number || `REC-${transaction.id.slice(0, 8).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5', // A5 is standard for church receipts
    });

    const primaryColor = [39, 39, 42] as const;
    const goldColor = [217, 119, 6] as const;

    // Header banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 148, 28, 'F');
    doc.setFillColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.rect(0, 28, 148, 1.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('ASSEMBLEIA DE DEUS JERUEL', 10, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(253, 230, 138);
    doc.text('Tesouraria Eclesiástica • Campo Rio Branco • Achados por Deus', 10, 16);

    doc.setTextColor(228, 228, 231);
    doc.setFontSize(6.5);
    doc.text('Rua São Raimundo, 784 - Bairro Vitória, Rio Branco/AC', 10, 21);

    // Document Title & Number
    doc.setTextColor(24, 24, 27);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(receiptTitle, 10, 36);

    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122);
    doc.text(`Nº ${receiptNumber}`, 115, 36);

    // Value Card
    doc.setFillColor(244, 244, 245);
    doc.setDrawColor(228, 228, 231);
    doc.roundedRect(10, 42, 128, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122);
    doc.text('VALOR:', 14, 49);

    doc.setFontSize(12);
    doc.setTextColor(isIncome ? 16 : 244, isIncome ? 185 : 63, isIncome ? 129 : 94);
    doc.text(formatBRL(transaction.amount), 35, 52);

    // Receipt Body Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(24, 24, 27);
    const bodyLines = [
      `Recebemos de: ${transaction.payer_or_beneficiary || 'Irmão(ã) / Ofertante da Congregação'}`,
      `A quantia de: ${valorExtenso}`,
      `Referente a: ${transaction.category} - ${transaction.description}`,
      `Forma de Pagamento: ${(transaction.payment_method || 'Dinheiro').toUpperCase()}`,
      `Data do Lançamento: ${formatDateBR(transaction.date)}`,
    ];

    let yPos = 66;
    bodyLines.forEach((line) => {
      doc.text(line, 10, yPos);
      yPos += 6;
    });

    if (transaction.note) {
      doc.setFontSize(7.5);
      doc.setTextColor(113, 113, 122);
      doc.text(`Observações: ${transaction.note}`, 10, yPos);
      yPos += 8;
    }

    // Signatures
    const sigY = 115;
    doc.setDrawColor(161, 161, 170);
    doc.line(15, sigY, 65, sigY);
    doc.line(83, sigY, 133, sigY);

    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('Pr. Manoel Silva', 40, sigY + 4, { align: 'center' });
    doc.text('Pastor Presidente', 40, sigY + 8, { align: 'center' });

    doc.text('Tesouraria Geral ADJ', 108, sigY + 4, { align: 'center' });
    doc.text('Assinatura do Responsável', 108, sigY + 8, { align: 'center' });

    // Footer
    doc.setFontSize(6);
    doc.setTextColor(161, 161, 170);
    doc.text('Documento eclesiástico gerado eletronicamente pelo Sistema de Tesouraria ADJ Jeruel.', 74, 140, { align: 'center' });

    doc.save(`Recibo_${receiptNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 max-w-xl w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Recibo Eclesiástico
            </span>
            <span className="text-[11px] bg-amber-500/15 text-amber-700 dark:text-amber-400 font-mono px-2 py-0.5 rounded">
              {receiptNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Imprimir Recibo"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Baixar PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper */}
        <div
          ref={printRef}
          className="my-4 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-7 text-zinc-900 dark:text-zinc-100 relative"
        >
          {/* Watermark Crest */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Church className="w-48 h-48 text-amber-600" />
          </div>

          {/* Header of the Receipt */}
          <div className="border-b border-zinc-200/80 dark:border-zinc-800 pb-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
                  ASSEMBLEIA DE DEUS JERUEL
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  Tesouraria Eclesiástica • Campo Rio Branco • Achados por Deus
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Rua São Raimundo, 784 - Bairro Vitória, Rio Branco/AC
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-400 font-medium">Nº DO RECIBO</div>
                <div className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {receiptNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Title and Value */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3.5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                {receiptTitle}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Categoria: <strong>{transaction.category}</strong>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Valor
              </span>
              <span
                className={`text-xl sm:text-2xl font-bold tabular-nums ${
                  isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatBRL(transaction.amount)}
              </span>
            </div>
          </div>

          {/* Receipt Body */}
          <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed mb-6">
            <p>
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                {isIncome ? 'Recebemos de' : 'Pago a'}:
              </span>{' '}
              <strong className="text-zinc-900 dark:text-zinc-100">
                {transaction.payer_or_beneficiary || (isIncome ? 'Irmão(ã) / Contribuinte da Igreja' : 'Fornecedor / Prestador')}
              </strong>
            </p>

            <p>
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">A quantia de:</span>{' '}
              <span className="italic font-medium text-zinc-800 dark:text-zinc-200">
                {valorExtenso}
              </span>
            </p>

            <p>
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">Referente a:</span>{' '}
              <span className="text-zinc-900 dark:text-zinc-100">{transaction.description}</span>
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-zinc-200/60 dark:border-zinc-800">
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Forma de Pagamento:</span>{' '}
                <strong className="capitalize text-zinc-900 dark:text-zinc-100">
                  {transaction.payment_method || 'Dinheiro'}
                </strong>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Data da Operação:</span>{' '}
                <strong className="tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatDateBR(transaction.date)}
                </strong>
              </div>
            </div>

            {transaction.note && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                <strong>Observações:</strong> {transaction.note}
              </p>
            )}
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-zinc-200/80 dark:border-zinc-800 text-center">
            <div>
              <div className="w-full border-b border-zinc-300 dark:border-zinc-700 mb-1.5" />
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Pr. Manoel Silva</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Pastor Presidente</div>
            </div>
            <div>
              <div className="w-full border-b border-zinc-300 dark:border-zinc-700 mb-1.5" />
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Tesouraria Geral ADJ</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Responsável Ativo</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-medium transition-all cursor-pointer"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-semibold tracking-wide shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Recibo em PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
