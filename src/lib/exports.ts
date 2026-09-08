import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Transaction } from '../types/finance';
import { formatBRL, formatDateBR } from './formatters';

interface ExportFilterOptions {
  periodLabel?: string;
  startDate?: string;
  endDate?: string;
}

export function exportToCSV(transactions: Transaction[], options?: ExportFilterOptions): void {
  const headers = ['Data', 'Nº Recibo', 'Descrição', 'Categoria', 'Tipo', 'Valor (R$)', 'Status', 'Forma Pgto', 'Contribuinte / Favorecido', 'Observações'];
  const rows = transactions.map((t) => [
    formatDateBR(t.date),
    `"${(t.receipt_number || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    t.type === 'income' ? 'Entrada' : 'Saída',
    (Number(t.amount) || 0).toFixed(2).replace('.', ','),
    t.status === 'confirmed' ? 'Confirmado' : 'Pendente',
    `"${(t.payment_method || 'Dinheiro').replace(/"/g, '""')}"`,
    `"${(t.payer_or_beneficiary || '').replace(/"/g, '""')}"`,
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  const round2 = (val: number) => Math.round(val * 100) / 100;
  const totalIncome = round2(
    transactions
      .filter((t) => t.type === 'income' && t.status === 'confirmed')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  );
  const totalExpense = round2(
    transactions
      .filter((t) => t.type === 'expense' && t.status === 'confirmed')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  );
  const totalPending = round2(
    transactions
      .filter((t) => t.status === 'pending')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  );
  const balance = round2(totalIncome - totalExpense);

  const summaryRows = [
    [],
    ['"RESUMO FINANCEIRO"', '', '', '', '', '', '', '', '', ''],
    ['Total de Entradas Confirmadas', '', '', '', totalIncome.toFixed(2).replace('.', ','), '', '', '', '', ''],
    ['Total de Saídas Confirmadas', '', '', '', totalExpense.toFixed(2).replace('.', ','), '', '', '', '', ''],
    ['Lançamentos Pendentes', '', '', '', totalPending.toFixed(2).replace('.', ','), '', '', '', '', ''],
    ['Saldo Líquido', '', '', '', balance.toFixed(2).replace('.', ','), '', '', '', '', ''],
  ];

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Microsoft Excel in PT-BR
    ['ADJ Jeruel - Tesouraria - Relatório Financeiro', `Período: ${options?.periodLabel || 'Geral'}`].join(';') +
    '\n\n' +
    [headers.join(';'), ...rows.map((r) => r.join(';')), ...summaryRows.map((r) => r.join(';'))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ADJ_Jeruel_Tesouraria_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel(transactions: Transaction[], options?: ExportFilterOptions): void {
  const round2 = (val: number) => Math.round(val * 100) / 100;
  const data = transactions.map((t) => ({
    Data: formatDateBR(t.date),
    'Nº Recibo': t.receipt_number || '',
    Descrição: t.description,
    Categoria: t.category,
    Tipo: t.type === 'income' ? 'Entrada' : 'Saída',
    'Valor (R$)': round2(Number(t.amount || 0)),
    Status: t.status === 'confirmed' ? 'Confirmado' : 'Pendente',
    'Forma Pgto': t.payment_method || 'dinheiro',
    'Contribuinte / Favorecido': t.payer_or_beneficiary || '',
    Observações: t.note || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 12 }, // Data
    { wch: 15 }, // Recibo
    { wch: 36 }, // Descrição
    { wch: 22 }, // Categoria
    { wch: 10 }, // Tipo
    { wch: 16 }, // Valor
    { wch: 14 }, // Status
    { wch: 14 }, // Forma
    { wch: 25 }, // Favorecido
    { wch: 35 }, // Obs
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lançamentos');

  const totalIncome = round2(
    transactions
      .filter((t) => t.type === 'income' && t.status === 'confirmed')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  );
  const totalExpense = round2(
    transactions
      .filter((t) => t.type === 'expense' && t.status === 'confirmed')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  );
  const totalPending = round2(
    transactions
      .filter((t) => t.status === 'pending')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  );
  const balance = round2(totalIncome - totalExpense);

  const summaryData = [
    { Indicador: 'Igreja', Valor: 'Assembleia de Deus Jeruel - Tesouraria' },
    { Indicador: 'Período', Valor: options?.periodLabel || 'Geral' },
    { Indicador: 'Data de Emissão', Valor: new Date().toLocaleDateString('pt-BR') },
    { Indicador: 'Total de Entradas Confirmadas (R$)', Valor: totalIncome },
    { Indicador: 'Total de Saídas Confirmadas (R$)', Valor: totalExpense },
    { Indicador: 'Lançamentos Pendentes (R$)', Valor: totalPending },
    { Indicador: 'Saldo Líquido Atual (R$)', Valor: balance },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 34 }, { wch: 42 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo Geral');

  XLSX.writeFile(workbook, `ADJ_Jeruel_Tesouraria_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportToPDF(transactions: Transaction[], options?: ExportFilterOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [39, 39, 42] as const; // Zinc 800
  const goldColor = [217, 119, 6] as const; // Amber 600
  const incomeColor = [16, 185, 129] as const;
  const expenseColor = [244, 63, 94] as const;

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 38, 'F');

  // Gold accent line
  doc.setFillColor(goldColor[0], goldColor[1], goldColor[2]);
  doc.rect(0, 38, 210, 2, 'F');

  // Header texts
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('ASSEMBLEIA DE DEUS JERUEL', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(253, 230, 138); // Amber 200
  doc.text('Tesouraria Eclesiástica • Campo Rio Branco • "Achados por Deus"', 14, 22);

  doc.setFontSize(7.5);
  doc.setTextColor(228, 228, 231);
  doc.text('Rua São Raimundo, 784 - Bairro Vitória, Rio Branco/AC', 14, 28);

  const now = new Date();
  const generationDate = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  doc.text(`Emissão: ${generationDate}  |  Período: ${options?.periodLabel || 'Todos os registros'}`, 14, 34);

  // Summary box
  const round2 = (val: number) => Math.round(val * 100) / 100;
  const totalIncome = round2(
    transactions
      .filter((t) => t.type === 'income' && t.status === 'confirmed')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  );
  const totalExpense = round2(
    transactions
      .filter((t) => t.type === 'expense' && t.status === 'confirmed')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  );
  const totalPending = round2(
    transactions
      .filter((t) => t.status === 'pending')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  );
  const balance = round2(totalIncome - totalExpense);

  // Draw 4 mini stats cards
  const cardY = 46;
  const cardW = 43;
  const cardH = 20;

  // Saldo
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(228, 228, 231);
  doc.roundedRect(14, cardY, cardW, cardH, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.text('SALDO ATUAL', 17, cardY + 6);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(balance >= 0 ? incomeColor[0] : expenseColor[0], balance >= 0 ? incomeColor[1] : expenseColor[1], balance >= 0 ? incomeColor[2] : expenseColor[2]);
  doc.text(formatBRL(balance), 17, cardY + 14);

  // Entradas
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(61, cardY, cardW, cardH, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.setFont('helvetica', 'normal');
  doc.text('ENTRADAS', 64, cardY + 6);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(incomeColor[0], incomeColor[1], incomeColor[2]);
  doc.text(formatBRL(totalIncome), 64, cardY + 14);

  // Saídas
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(108, cardY, cardW, cardH, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.setFont('helvetica', 'normal');
  doc.text('SAÍDAS', 111, cardY + 6);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(expenseColor[0], expenseColor[1], expenseColor[2]);
  doc.text(formatBRL(totalExpense), 111, cardY + 14);

  // Pendentes
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(155, cardY, cardW, cardH, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.setFont('helvetica', 'normal');
  doc.text('PENDENTES', 158, cardY + 6);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
  doc.text(formatBRL(totalPending), 158, cardY + 14);

  // Table
  const tableData = transactions.map((t) => [
    formatDateBR(t.date),
    t.receipt_number || '-',
    t.description,
    t.category,
    t.type === 'income' ? 'Entrada' : 'Saída',
    t.status === 'confirmed' ? 'Confirmado' : 'Pendente',
    (t.type === 'income' ? '+ ' : '- ') + formatBRL(t.amount),
  ]);

  autoTable(doc, {
    startY: 72,
    head: [['Data', 'Recibo', 'Descrição', 'Categoria', 'Tipo', 'Status', 'Valor']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [39, 39, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [24, 24, 27],
    },
    alternateRowStyles: {
      fillColor: [244, 244, 245],
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 24 },
      2: { cellWidth: 54 },
      3: { cellWidth: 32 },
      4: { cellWidth: 18 },
      5: { cellWidth: 20 },
      6: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
    },
    didDrawPage: (data) => {
      const str = `Página ${data.pageNumber} de ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(161, 161, 170);
      doc.text(str, 196, 290, { align: 'right' });
      doc.text('ADJ Jeruel - Tesouraria • Campo Rio Branco • Achados por Deus', 14, 290);
    },
  });

  doc.save(`ADJ_Jeruel_Relatorio_${new Date().toISOString().slice(0, 10)}.pdf`);
}
