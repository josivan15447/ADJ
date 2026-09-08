export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function parseBRLInput(valueStr: string): number {
  if (!valueStr) return NaN;
  const clean = valueStr.trim();
  if (!clean) return NaN;

  // Case 1: Both dot and comma present, e.g. "1.234,56" or "1,234.56"
  if (clean.includes('.') && clean.includes(',')) {
    const lastDot = clean.lastIndexOf('.');
    const lastComma = clean.lastIndexOf(',');
    if (lastComma > lastDot) {
      // Brazilian format: 1.234,56 -> remove dots, replace comma with dot
      return parseFloat(clean.replace(/\./g, '').replace(',', '.'));
    } else {
      // US format: 1,234.56 -> remove commas
      return parseFloat(clean.replace(/,/g, ''));
    }
  }

  // Case 2: Only comma present, e.g. "150,50" or "1500,00"
  if (clean.includes(',')) {
    return parseFloat(clean.replace(',', '.'));
  }

  // Case 3: Only dot present, e.g. "150.50" or "1.500"
  if (clean.includes('.')) {
    const dotCount = (clean.match(/\./g) || []).length;
    if (dotCount > 1) {
      // Multiple dots: thousand separators e.g. "1.000.000"
      return parseFloat(clean.replace(/\./g, ''));
    }
    // Single dot
    const parts = clean.split('.');
    if (parts[1].length <= 2) {
      return parseFloat(clean);
    } else if (parts[1].length === 3) {
      return parseFloat(clean.replace('.', ''));
    }
    return parseFloat(clean);
  }

  return parseFloat(clean);
}

export function formatDateBR(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '';
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTimeBR(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getTodayISODate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatNumberToExtensoBRL(val: number): string {
  // A clean and friendly representation of currency in words for church receipts
  const num = Math.round(Number(val) * 100) / 100;
  if (isNaN(num) || num <= 0) return 'zero reais';
  
  const inteiros = Math.floor(num);
  const centavos = Math.round((num - inteiros) * 100);

  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  function converterMenorQueMil(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'cem';
    const c = Math.floor(n / 100);
    const resto = n % 100;
    const d = Math.floor(resto / 10);
    const u = resto % 10;

    let res = '';
    if (c > 0) res += centenas[c];

    if (resto > 0) {
      if (res !== '') res += ' e ';
      if (resto >= 10 && resto < 20) {
        res += especiais[resto - 10];
      } else {
        if (d > 0) res += dezenas[d];
        if (d > 0 && u > 0) res += ' e ';
        if (u > 0) res += unidades[u];
      }
    }
    return res;
  }

  let extenso = '';
  if (inteiros === 0) {
    extenso = '';
  } else if (inteiros < 1000) {
    extenso = `${converterMenorQueMil(inteiros)} ${inteiros === 1 ? 'real' : 'reais'}`;
  } else if (inteiros < 1000000) {
    const mil = Math.floor(inteiros / 1000);
    const resto = inteiros % 1000;
    const parteMil = mil === 1 ? 'mil' : `${converterMenorQueMil(mil)} mil`;
    if (resto === 0) {
      extenso = `${parteMil} reais`;
    } else {
      extenso = `${parteMil} e ${converterMenorQueMil(resto)} reais`;
    }
  } else {
    extenso = `${formatBRL(num)}`;
  }

  if (centavos > 0) {
    const textoCentavos = converterMenorQueMil(centavos);
    extenso += ` e ${textoCentavos} ${centavos === 1 ? 'centavo' : 'centavos'}`;
  }

  return extenso.trim();
}
