// Tests unitaires de la logique métier
import { describe, expect, it } from 'vitest';
import {
  budgetUsage,
  expensesByCategory,
  filterByMonth,
  toCsv,
  toTransaction,
  totals,
  validate,
  type Transaction,
} from './budget';

const tx = (over: Partial<Transaction>): Transaction => ({
  id: Math.random().toString(),
  kind: 'expense',
  amount: 10,
  category: 'Alimentation',
  label: 'Test',
  date: '2026-11-10',
  ...over,
});

describe('totals', () => {
  it('additionne revenus et dépenses et calcule le solde', () => {
    const list = [tx({ kind: 'income', amount: 1000, category: 'Salaire' }), tx({ amount: 250.5 }), tx({ amount: 49.5 })];
    expect(totals(list)).toEqual({ income: 1000, expense: 300, balance: 700 });
  });

  it('évite les erreurs d\'arrondi des nombres à virgule', () => {
    expect(totals([tx({ amount: 0.1 }), tx({ amount: 0.2 })]).expense).toBe(0.3);
  });

  it('renvoie zéro pour une liste vide', () => {
    expect(totals([])).toEqual({ income: 0, expense: 0, balance: 0 });
  });
});

describe('filterByMonth', () => {
  it('ne garde que les opérations du mois demandé', () => {
    const list = [tx({ date: '2026-11-01' }), tx({ date: '2026-10-31' }), tx({ date: '2026-11-30' })];
    expect(filterByMonth(list, '2026-11')).toHaveLength(2);
  });
});

describe('expensesByCategory', () => {
  it('regroupe, trie et calcule la part de chaque catégorie', () => {
    const list = [
      tx({ category: 'Transport', amount: 20 }),
      tx({ category: 'Alimentation', amount: 60 }),
      tx({ category: 'Transport', amount: 20 }),
      tx({ kind: 'income', category: 'Salaire', amount: 999 }),
    ];
    const result = expensesByCategory(list);
    expect(result.map((r) => r.category)).toEqual(['Alimentation', 'Transport']);
    expect(result[0].share).toBe(0.6);
    expect(result[1].amount).toBe(40);
  });
});

describe('budgetUsage', () => {
  it('renvoie la part du budget utilisée', () => {
    expect(budgetUsage(400, 800)).toBe(0.5);
  });
  it('renvoie null sans budget', () => {
    expect(budgetUsage(400, 0)).toBeNull();
  });
});

describe('validate', () => {
  const base = { kind: 'expense' as const, amount: '12,500', category: 'Transport', label: '', date: '2026-11-23' };

  it('accepte une saisie correcte avec une virgule décimale', () => {
    expect(validate(base)).toEqual({});
  });

  it('refuse un montant vide, négatif ou non numérique', () => {
    expect(validate({ ...base, amount: '' }).amount).toBeDefined();
    expect(validate({ ...base, amount: '-5' }).amount).toBeDefined();
    expect(validate({ ...base, amount: 'abc' }).amount).toBeDefined();
  });

  it('refuse une catégorie qui ne correspond pas au type', () => {
    expect(validate({ ...base, category: 'Salaire' }).category).toBeDefined();
  });
});

describe('toTransaction', () => {
  it('convertit le montant et utilise la catégorie si le libellé est vide', () => {
    const t = toTransaction({ kind: 'expense', amount: '12,5', category: 'Transport', label: '  ', date: '2026-11-23' }, 'id1');
    expect(t).toMatchObject({ id: 'id1', amount: 12.5, label: 'Transport' });
  });
});

describe('toCsv', () => {
  it('génère un en-tête et échappe les points-virgules', () => {
    const csv = toCsv([tx({ label: 'Café; croissant', amount: 4.2 })]);
    const [header, row] = csv.split('\n');
    expect(header).toBe('Date;Type;Catégorie;Libellé;Montant (TND)');
    expect(row).toBe('2026-11-10;Dépense;Alimentation;"Café; croissant";4.200');
  });
});
