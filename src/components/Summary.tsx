// Cartes de synthèse du mois + barre de progression du budget
import { budgetUsage, formatTnd, type Totals } from '../lib/budget';

interface Props {
  totals: Totals;
  budget: number;
  onBudgetChange: (value: number) => void;
}

export function Summary({ totals, budget, onBudgetChange }: Props) {
  const usage = budgetUsage(totals.expense, budget);
  const level = usage === null ? '' : usage >= 1 ? 'danger' : usage >= 0.8 ? 'warning' : 'ok';

  return (
    <section className="summary">
      <div className="cards">
        <article className="card">
          <span>Revenus</span>
          <strong className="positive">{formatTnd(totals.income)}</strong>
        </article>
        <article className="card">
          <span>Dépenses</span>
          <strong className="negative">{formatTnd(totals.expense)}</strong>
        </article>
        <article className="card">
          <span>Solde</span>
          <strong className={totals.balance >= 0 ? 'positive' : 'negative'}>{formatTnd(totals.balance)}</strong>
        </article>
      </div>

      <div className="budget">
        <label>
          Budget du mois (TND)
          <input
            type="number"
            min="0"
            step="10"
            inputMode="decimal"
            value={budget || ''}
            placeholder="ex. 800"
            onChange={(e) => onBudgetChange(Math.max(0, Number(e.target.value) || 0))}
          />
        </label>
        {usage !== null && (
          <>
            <div className="bar" role="progressbar" aria-valuenow={Math.round(usage * 100)} aria-valuemin={0} aria-valuemax={100}>
              <div className={`bar-fill ${level}`} style={{ width: `${Math.min(usage, 1) * 100}%` }} />
            </div>
            <p className={`budget-text ${level}`}>
              {usage >= 1
                ? `Budget dépassé de ${formatTnd(totals.expense - budget)}`
                : `${Math.round(usage * 100)} % utilisé · reste ${formatTnd(budget - totals.expense)}`}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
