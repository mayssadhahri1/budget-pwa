// Composant racine : état global, choix du mois et assemblage des sections
import { useMemo } from 'react';
import { filterByMonth, toCsv, toTransaction, totals, type Transaction, type TransactionInput } from './lib/budget';
import { newId, usePersistentState } from './lib/storage';
import { Summary } from './components/Summary';
import { TransactionForm } from './components/TransactionForm';
import { CategoryChart } from './components/CategoryChart';
import { TransactionList } from './components/TransactionList';

const currentMonth = () => new Date().toISOString().slice(0, 7);

// Décale un mois AAAA-MM de +1 ou -1
function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function App() {
  const [transactions, setTransactions] = usePersistentState<Transaction[]>('budget.transactions', []);
  const [budgets, setBudgets] = usePersistentState<Record<string, number>>('budget.limits', {});
  const [month, setMonth] = usePersistentState('budget.month', currentMonth());

  const monthly = useMemo(() => filterByMonth(transactions, month), [transactions, month]);
  const monthTotals = useMemo(() => totals(monthly), [monthly]);

  const add = (input: TransactionInput) => setTransactions((list) => [...list, toTransaction(input, newId())]);
  const remove = (id: string) => setTransactions((list) => list.filter((t) => t.id !== id));

  // Téléchargement du mois en CSV (BOM pour que Excel lise bien les accents)
  const exportCsv = () => {
    const blob = new Blob(['\uFEFF' + toCsv(monthly)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), { href: url, download: `budget-${month}.csv` });
    link.click();
    URL.revokeObjectURL(url);
  };

  const monthLabel = new Date(`${month}-01`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="app">
      <header className="header">
        <h1>💰 Mon Budget</h1>
        <nav className="month" aria-label="Choix du mois">
          <button className="icon" aria-label="Mois précédent" onClick={() => setMonth(shiftMonth(month, -1))}>‹</button>
          <span>{monthLabel}</span>
          <button className="icon" aria-label="Mois suivant" onClick={() => setMonth(shiftMonth(month, 1))}>›</button>
        </nav>
      </header>

      <Summary
        totals={monthTotals}
        budget={budgets[month] ?? 0}
        onBudgetChange={(value) => setBudgets((b) => ({ ...b, [month]: value }))}
      />

      <main className="grid">
        <TransactionForm onAdd={add} />
        <CategoryChart transactions={monthly} />
        <TransactionList transactions={monthly} onDelete={remove} />
      </main>

      <footer className="footer">
        <button onClick={exportCsv} disabled={monthly.length === 0}>Exporter le mois en CSV</button>
        <small>Données enregistrées uniquement sur cet appareil · fonctionne hors ligne</small>
      </footer>
    </div>
  );
}
