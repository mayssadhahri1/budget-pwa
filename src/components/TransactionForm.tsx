// Formulaire d'ajout d'une opération (revenu ou dépense)
import { useState, type FormEvent } from 'react';
import { CATEGORIES, validate, type Kind, type TransactionInput } from '../lib/budget';

interface Props {
  onAdd: (input: TransactionInput) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function TransactionForm({ onAdd }: Props) {
  const [input, setInput] = useState<TransactionInput>({
    kind: 'expense',
    amount: '',
    category: CATEGORIES.expense[0],
    label: '',
    date: today(),
  });
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});

  const update = (patch: Partial<TransactionInput>) => setInput((prev) => ({ ...prev, ...patch }));

  // Changer de type remet une catégorie valide pour ce type
  const switchKind = (kind: Kind) => update({ kind, category: CATEGORIES[kind][0] });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(input);
    setErrors(found);
    if (Object.keys(found).length) return;
    onAdd(input);
    setInput((prev) => ({ ...prev, amount: '', label: '' })); // on garde type, catégorie et date
  };

  return (
    <form className="panel form" onSubmit={submit} noValidate>
      <h2>Nouvelle opération</h2>

      <div className="toggle" role="radiogroup" aria-label="Type d'opération">
        {(['expense', 'income'] as Kind[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={input.kind === k}
            className={input.kind === k ? `active ${k}` : ''}
            onClick={() => switchKind(k)}
          >
            {k === 'expense' ? 'Dépense' : 'Revenu'}
          </button>
        ))}
      </div>

      <label>
        Montant (TND)
        <input
          inputMode="decimal"
          placeholder="0,000"
          value={input.amount}
          onChange={(e) => update({ amount: e.target.value })}
          aria-invalid={!!errors.amount}
        />
        {errors.amount && <small className="error">{errors.amount}</small>}
      </label>

      <div className="row">
        <label>
          Catégorie
          <select value={input.category} onChange={(e) => update({ category: e.target.value })}>
            {CATEGORIES[input.kind].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input type="date" value={input.date} onChange={(e) => update({ date: e.target.value })} />
          {errors.date && <small className="error">{errors.date}</small>}
        </label>
      </div>

      <label>
        Libellé (optionnel)
        <input
          maxLength={60}
          placeholder="ex. Courses Carrefour"
          value={input.label}
          onChange={(e) => update({ label: e.target.value })}
        />
      </label>

      <button type="submit" className="primary">Ajouter</button>
    </form>
  );
}
