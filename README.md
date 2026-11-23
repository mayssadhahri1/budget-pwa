# 💰 Mon Budget — PWA de gestion de budget

Application **web mobile (PWA)** pour suivre ses revenus et dépenses en dinars : installable sur téléphone, utilisable **hors ligne**, avec graphique par catégorie, alerte de budget et export CSV.
Développée en **React + TypeScript**, testée avec **Vitest**, servie par **Nginx** dans **Docker**, et livrée par un pipeline **Jenkins** / **GitHub Actions**.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Nginx-2496ED?logo=docker&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-pipeline-D24939?logo=jenkins&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

## Fonctionnalités

- Ajout de revenus et de dépenses avec catégorie, date et libellé
- Navigation mois par mois, synthèse revenus / dépenses / solde
- Budget mensuel avec barre de progression et alerte (orange à 80 %, rouge en cas de dépassement)
- Graphique en anneau des dépenses par catégorie (SVG fait main, sans librairie)
- Export CSV compatible Excel (séparateur `;`, accents conservés)
- **PWA** : manifeste + service worker → installable sur l'écran d'accueil et utilisable sans Internet
- Interface pensée mobile d'abord, accessible (rôles ARIA, navigation clavier)
- Données stockées uniquement sur l'appareil (`localStorage`), aucun serveur nécessaire

## Architecture

```
src/
├── lib/
│   ├── budget.ts        # Logique métier pure : totaux, catégories, validation, CSV
│   ├── budget.test.ts   # Tests unitaires
│   └── storage.ts       # Hook de persistance localStorage
├── components/          # Summary, TransactionForm, CategoryChart, TransactionList
├── App.tsx              # Composant racine (état, choix du mois)
└── App.test.tsx         # Tests d'interface (Testing Library)
public/                  # Manifeste PWA, icône, service worker
Dockerfile               # Build Node → image Nginx
nginx.conf               # Cache, en-têtes de sécurité, fallback SPA, /healthz
Jenkinsfile              # Pipeline CI/CD
```

La logique métier est séparée de React : elle se teste sans navigateur et peut être réutilisée (par exemple dans une future API).

## Lancer le projet

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 15 tests
npm run build
```

**Avec Docker**

```bash
docker compose up -d --build   # http://localhost:8080
```

## Pipeline CI/CD

```
Qualité (types + tests) → Build image → Scan Trivy → Smoke test → Push Docker Hub
```

- **Jenkins** : vérification TypeScript et tests dans un conteneur Node, build de l'image (qui relance les tests), scan Trivy bloquant sur les failles critiques, démarrage d'un conteneur de test, puis push sur Docker Hub depuis `main` (identifiant Jenkins `dockerhub-credentials`).
- **GitHub Actions** : mêmes étapes à chaque push et pull request.

## Pistes d'amélioration

- Synchronisation entre appareils via une API (Spring Boot ou Node.js) et une base de données
- Graphique d'évolution sur plusieurs mois
- Import de relevés bancaires CSV

---

Réalisé avec l'aide d'un assistant IA.

## Auteure

**Mayssa Dhahri** — élève-ingénieure en Génie Logiciel, École Polytechnique de Sousse
[LinkedIn](https://www.linkedin.com/in/mayssa-dhahri-38b1373bb/) · [GitHub](https://github.com/mayssadhahri1)
