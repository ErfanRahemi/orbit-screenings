export function formatPrice(amount: number): string {
  if (typeof amount !== 'number') return '۰ تومان';
  const formatted = amount.toLocaleString('fa-IR');
  return `${formatted} تومان`;
}

export function toPersianDigits(input: string | number): string {
  if (input === undefined || input === null) return '';
  const str = input.toString();
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
}

export function toEnglishDigits(input: string): string {
  if (!input) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  let res = input;
  for (let i = 0; i < 10; i++) {
    res = res.replace(new RegExp(persianDigits[i], 'g'), i.toString());
  }
  return res;
}

export function validateIranianMobile(mobile: string): boolean {
  const normalized = toEnglishDigits(mobile).trim().replace(/\s+/g, '');
  return /^(09|\+989|00989|9)[0-9]{9}$/.test(normalized);
}

export function normalizeIranianMobile(mobile: string): string {
  let normalized = toEnglishDigits(mobile).trim().replace(/\s+/g, '');
  if (normalized.startsWith('+98')) {
    normalized = '0' + normalized.slice(3);
  } else if (normalized.startsWith('0098')) {
    normalized = '0' + normalized.slice(4);
  } else if (normalized.startsWith('9') && normalized.length === 10) {
    normalized = '0' + normalized;
  }
  return normalized;
}
