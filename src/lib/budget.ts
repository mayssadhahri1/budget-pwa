// Logique métier pure (sans React) : facile à tester unitairement

export type Kind = 'income' | 'expense';

export interface Transaction {
  id: string;
  kind: Kind;
  amount: number; // en dinars, toujours positif
  category: string;
  label: string;
  date: string; // format AAAA-MM-JJ
}

export const CATEGORIES: Record<Kind, string[]> = {
  expense: ['Alimentation', 'Transport', 'Logement', 'Loisirs', 'Santé', 'Études', 'Autre'],
  income: ['Salaire', 'Bourse', 'Freelance', 'Cadeau', 'Autre'],
};

export interface Totals {
  income: number;
  expense: number;
  balance: number;
}

// Arrondi à 3 décimales (le dinar a 1000 millimes) pour éviter 0.1 + 0.2 = 0.30000000000000004
export const round = (n: number) => Math.round(n * 1000) / 1000;

// Mois au format AAAA-MM à partir d'une date AAAA-MM-JJ
export const monthOf = (date: string) => date.slice(0, 7);

export function filterByMonth(list: Transaction[], month: string): Transaction[] {
  return list.filter((t) => monthOf(t.date) === month);
}

export function totals(list: Transaction[]): Totals {
  let income = 0;
  let expense = 0;
  for (const t of list) {
    if (t.kind === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income: round(income), expense: round(expense), balance: round(income - expense) };
}

// Dépenses regroupées par catégorie, de la plus grosse à la plus petite
export function expensesByCategory(list: Transaction[]): { category: string; amount: number; share: number }[] {
  const map = new Map<string, number>();
  for (const t of list) {
    if (t.kind === 'expense') map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }
  const total = [...map.values()].reduce((a, b) => a + b, 0);
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount: round(amount), share: total ? amount / total : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

// Pourcentage du budget mensuel déjà dépensé (null si aucun budget défini)
export function budgetUsage(expense: number, budget: number): number | null {
  if (!budget || budget <= 0) return null;
  return expense / budget;
}

export interface TransactionInput {
  kind: Kind;
  amount: string;
  category: string;
  label: string;
  date: string;
}

// Valide la saisie du formulaire et renvoie les erreurs par champ
export function validate(input: TransactionInput): Partial<Record<keyof TransactionInput, string>> {
  const errors: Partial<Record<keyof TransactionInput, string>> = {};
  const amount = Number(input.amount.replace(',', '.'));
  if (!input.amount.trim() || Number.isNaN(amount)) errors.amount = 'Montant invalide';
  else if (amount <= 0) errors.amount = 'Le montant doit être positif';
  else if (amount > 1_000_000) errors.amount = 'Montant trop élevé';
  if (!CATEGORIES[input.kind].includes(input.category)) errors.category = 'Catégorie inconnue';
  if (input.label.trim().length > 60) errors.label = '60 caractères maximum';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) errors.date = 'Date invalide';
  return errors;
}

export function toTransaction(input: TransactionInput, id: string): Transaction {
  return {
    id,
    kind: input.kind,
    amount: round(Number(input.amount.replace(',', '.'))),
    category: input.category,
    label: input.label.trim() || input.category,
    date: input.date,
  };
}

// Export CSV (séparateur « ; » pour Excel en français)
export function toCsv(list: Transaction[]): string {
  const escape = (v: string) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const rows = list.map((t) =>
    [t.date, t.kind === 'income' ? 'Revenu' : 'Dépense', t.category, escape(t.label), t.amount.toFixed(3)].join(';')
  );
  return ['Date;Type;Catégorie;Libellé;Montant (TND)', ...rows].join('\n');
}

export const formatTnd = (n: number) =>
  new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(n);
