# Rapport d’Audit — Invariants, Implémentations, Vérifications, Limites

Ce document recense les invariants métiers cibles d’un système de paiement “audit-grade”, précise où ils sont implémentés dans ce projet pédagogique, comment ils sont vérifiés et quelles en sont les limites connues (simulations vs. production).

## Invariants Métiers

1) Ledger équilibré (double‑écriture)

- Énoncé
  - Chaque mouvement de fonds est représenté par deux écritures opposées dans le grand livre (LedgerEntry) : un débit et un crédit de même montant sur deux comptes distincts.
  - La somme des deltas par opération est nulle, et les soldes de comptes se déduisent de la somme des écritures.
- Implémentation
  - Service paiements, écritures par paires lors des mutations:
    - Confirm: EXTERNAL_PSP → PLATFORM_ESCROW
    - Capture: PLATFORM_ESCROW → USER et PLATFORM_ESCROW → PLATFORM_FEES
    - Refund (avant capture): PLATFORM_ESCROW → EXTERNAL_PSP
  - Code: [payments.service.ts](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/src/payments/payments.service.ts)
  - Modèle: [schema.prisma](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/prisma/schema.prisma) (models Account, LedgerEntry, PaymentIntent, enums AccountType, PaymentIntentStatus)
- Vérification
  - Atomicité: chaque mutation utilise une transaction DB groupant l’update d’état et les créations d’écritures.
  - Observation par API:
    - GET soldes agrégés: [payments.controller.ts → /payments/accounts](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/src/payments/payments.controller.ts)
    - GET écritures: [payments.controller.ts → /payments/ledger](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/src/payments/payments.controller.ts)
  - Démonstration manuelle:
    - Après confirm: escrow ↑ du montant, psp ↓ du même montant.
    - Après capture: escrow ↓ des montants seller et fees; seller ↑, platform_fees ↑.
    - Après refund (avant capture): escrow ↓, psp ↑.

2) Idempotence (anti‑rejeu)

- Énoncé
  - Pour une même Idempotency‑Key et une même requête (méthode, URL, corps), la réponse doit être identique; l’opération ne doit pas être rejouée côté serveur.
- Implémentation
  - Interceptor générique: [idempotency.interceptor.ts](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/src/idempotency/idempotency.interceptor.ts)
    - Hachage de la requête (méthode + URL + corps).
    - Verrouillage court (store.tryLock) pour éviter les courses.
    - Enregistrement de la réponse (status + body) en fin de traitement.
  - Stores:
    - InMemory (tests): [inmemory-idempotency.store.ts](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/src/idempotency/inmemory-idempotency.store.ts)
    - Prisma (prod démo): [prisma-idempotency.store.ts](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/src/idempotency/prisma-idempotency.store.ts)
  - Endpoints sensibles:
    - POST /payments/intents: application de l’interceptor + sauvegarde de clé sur l’intention: [payments.controller.ts](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/src/payments/payments.controller.ts)
- Vérification
  - Test e2e: [idempotency.e2e.spec.ts](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/test/idempotency.e2e.spec.ts) — deux POST avec même clé → même réponse sans réexécuter le handler.
  - Démonstration manuelle via client HTTP en répétant POST /payments/intents avec le même Idempotency‑Key.

3) Transitions d’états contrôlées

- Énoncé
  - Seules les transitions suivantes sont autorisées:
    - REQUIRES_CONFIRMATION → CONFIRMED
    - CONFIRMED → CAPTURED
    - CONFIRMED → REFUNDED (remboursement avant capture)
  - Transitions invalides (ex: capture sans confirm, refund après capture) sont refusées.
- Implémentation
  - Garde d’état par méthode:
    - confirmIntent: exige REQUIRES_CONFIRMATION
    - captureIntent: exige CONFIRMED
    - refundIntent: exige CONFIRMED
  - Code: [payments.service.ts](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/src/payments/payments.service.ts), enum PaymentIntentStatus dans [schema.prisma](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/prisma/schema.prisma)
- Vérification
  - Lecture de code (conditions + exceptions Forbidden).
  - Tests manuels via requêtes HTTP : POST /payments/confirm, /payments/capture, /payments/refund puis GET /payments/ledger et /payments/accounts.

## Où c’est implémenté (cartographie rapide)

- Schéma et modèles: [schema.prisma](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/prisma/schema.prisma)
- Paiements (service/module/controller): [payments.service.ts](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/src/payments/payments.service.ts), [payments.controller.ts](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/src/payments/payments.controller.ts), [payments.module.ts](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/src/payments/payments.module.ts)
- Idempotence (interceptor + stores + module): [idempotency.interceptor.ts](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/src/idempotency/idempotency.interceptor.ts), [inmemory-idempotency.store.ts](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/src/idempotency/inmemory-idempotency.store.ts), [prisma-idempotency.store.ts](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/src/idempotency/prisma-idempotency.store.ts), [idempotency.module.ts](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/src/idempotency/idempotency.module.ts)
- Démonstration tests: [idempotency.e2e.spec.ts](file:///Users/pro/projet%20khaliss/biba/biba-audit/apps/api/test/idempotency.e2e.spec.ts)
-

## Limites Connues (Simulé vs Réel)

- PSP et flux externes simulés
  - Le compte EXTERNAL_PSP modélise un prestataire de paiement; aucune intégration PSP réelle n’est effectuée.
  - Pas de webhooks, pas de conciliation bancaire, pas de délais de règlement, pas de chargebacks.
- Intégrité DB et contrôles renforcés
  - Les invariants (somme à zéro par opération, contraintes de transitions) sont assurés par la logique applicative et l’usage de transactions.
  - Des contraintes DB (triggers, checks, vues matérialisées d’audit) pourraient renforcer la preuve au niveau base en production.
- Sécurité et habilitations
  - Pas d’authentification/habilitation poussée: l’Admin démo n’implémente pas de RBAC; à intégrer pour un environnement réel.
- Concurrence & verrouillage idempotent
  - Le verrouillage de l’idempotence est de type applicatif (timestamp, TTL court). Sur charge élevée, un mécanisme distribué (ex: lock Redis, advisory locks SQL) serait recommandé.
  - L’idempotence est définie par (méthode, URL, corps). Toute variation de corps engendre un hash différent.
- Calcul des montants
  - Devise unique XOF, montants entiers, frais fixes 5% avec arrondi inférieur. Pas de conversion multidevise ni de TVA.
  - Pas de captures partielles, ni de multi‑vendeurs sur une même intention.
- Sérialisation des réponses
  - L’interceptor persiste le corps de réponse (JSON) et le status HTTP; pas de flux streaming.

## Comment lire et auditer rapidement

- Lire d’abord le README: [README.md](file:///Users/pro/projet%20khaliss/biba/biba-audit/README.md)
- Parcourir le schéma Prisma, puis payments.service.ts (confirm/capture/refund).
- Consulter l’interceptor d’idempotence et le test e2e.
- Vérifier les paires d’écritures avec /payments/ledger et les balances avec /payments/accounts après chaque action (confirm/capture/refund).
