// Graphique en anneau des dépenses par catégorie (SVG fait main, sans librairie)
import { expensesByCategory, formatTnd, type Transaction } from '../lib/budget';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#64748b'];
const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CategoryChart({ transactions }: { transactions: Transaction[] }) {
  const data = expensesByCategory(transactions);

  if (data.length === 0) {
    return (
      <section className="panel">
        <h2>Dépenses par catégorie</h2>
        <p className="empty">Aucune dépense ce mois-ci.</p>
      </section>
    );
  }

  // Chaque arc commence là où le précédent s'arrête
  let offset = 0;
  const arcs = data.map((d, i) => {
    const length = d.share * CIRCUMFERENCE;
    const arc = { ...d, color: COLORS[i % COLORS.length], dash: `${length} ${CIRCUMFERENCE - length}`, offset: -offset };
    offset += length;
    return arc;
  });

  return (
    <section className="panel">
      <h2>Dépenses par catégorie</h2>
      <div className="chart">
        <svg viewBox="0 0 160 160" role="img" aria-label="Répartition des dépenses">
          <g transform="rotate(-90 80 80)">
            {arcs.map((a) => (
              <circle
                key={a.category}
                cx="80"
                cy="80"
                r={RADIUS}
                fill="none"
                stroke={a.color}
                strokeWidth="22"
                strokeDasharray={a.dash}
                strokeDashoffset={a.offset}
              />
            ))}
          </g>
        </svg>
        <ul className="legend">
          {arcs.map((a) => (
            <li key={a.category}>
              <i style={{ background: a.color }} />
              <span>{a.category}</span>
              <strong>{formatTnd(a.amount)}</strong>
              <small>{Math.round(a.share * 100)} %</small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
