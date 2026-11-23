// Liste des opérations du mois, de la plus récente à la plus ancienne
import { formatTnd, type Transaction } from '../lib/budget';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onDelete }: Props) {
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="panel">
      <h2>Opérations ({transactions.length})</h2>
      {sorted.length === 0 ? (
        <p className="empty">Ajoute ta première opération avec le formulaire.</p>
      ) : (
        <ul className="list">
          {sorted.map((t) => (
            <li key={t.id}>
              <div>
                <strong>{t.label}</strong>
                <small>
                  {t.category} · {new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </small>
              </div>
              <span className={t.kind === 'income' ? 'positive' : 'negative'}>
                {t.kind === 'income' ? '+' : '−'} {formatTnd(t.amount)}
              </span>
              <button className="icon" aria-label={`Supprimer ${t.label}`} onClick={() => onDelete(t.id)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
