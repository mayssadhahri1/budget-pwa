// Test d'interface : on simule un utilisateur qui ajoute puis supprime une dépense
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('App', () => {
  it('ajoute une dépense, met à jour le solde puis la supprime', () => {
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText('0,000'), { target: { value: '45,5' } });
    fireEvent.change(screen.getByPlaceholderText('ex. Courses Carrefour'), { target: { value: 'Courses' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(screen.getByText('Courses')).toBeTruthy();
    expect(screen.getByText('Opérations (1)')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer Courses' }));
    expect(screen.getByText('Opérations (0)')).toBeTruthy();
  });

  it('affiche une erreur si le montant est vide', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(screen.getByText('Montant invalide')).toBeTruthy();
  });

  it('enregistre les opérations dans le navigateur', () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText('0,000'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    const saved = JSON.parse(localStorage.getItem('budget.transactions') ?? '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].amount).toBe(10);
  });
});
