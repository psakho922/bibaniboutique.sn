# CONTRIBUTING — Core Freeze Policy (Phase 1)

Ce document définit les règles de contribution pendant la Phase 1.
Le noyau financier est gelé et constitue la source de vérité.

## Périmètre gelé (DO NOT MODIFY)

Les fichiers suivants ne doivent pas être modifiés sans RFC “Core Change” approuvé :

- apps/api/src/payments/payments.service.ts
- apps/api/src/idempotency/idempotency.interceptor.ts
- apps/api/src/idempotency/idempotency.store.ts
- apps/api/src/idempotency/inmemory-idempotency.store.ts
- apps/api/src/idempotency/prisma-idempotency.store.ts
- apps/api/prisma/schema.prisma (parties paiements : PaymentIntent, Account, LedgerEntry, IdempotencyKey)

Objectifs intangibles :
- Double‑écriture stricte sur toute mutation d’état.
- Transitions PaymentIntent contrôlées (REQUIRES_CONFIRMATION → CONFIRMED → CAPTURED/REFUNDED).
- Idempotence: même clé + requête = même réponse; verrouillage anti‑courses.

## Changements autorisés (périphériques)

Les évolutions suivantes sont permises tant qu’elles n’impactent pas la logique ci‑dessus :

- Guards, RBAC, Auth/JWT (Phase 2), KYC (Phase 2), Admin lecture/ops (Phase 2).
- Nouveaux contrôleurs/DTOs qui utilisent le service paiements sans réimplémenter de logique financière.
- Indexes, migrations non financières (ou financières via RFC), observabilité (logs/metrics) non intrusives.

Toute modification nécessitant de toucher aux fichiers gelés doit suivre le processus “Core Change RFC”.

## Core Change RFC (obligatoire si noyau impacté)

1. Ouvrir un document RFC (docs/CORE_CHANGE_RFC-<date>-<sujet>.md) décrivant :
   - Motivation, risques, impact sur invariants, migration/déploiement.
   - Plan de tests (incluant tests e2e idempotence + vérifs ledger).
2. Créer une PR avec label `core-change` et cocher la checklist PR.
3. Validation par un reviewer dédié “core” avant merge.

## Règles de revue PR

Avant d’assigner la PR :

- Ne pas avoir modifié les fichiers gelés (ou alors label `core-change` + RFC joint).
- Exécuter localement :
  - `npm --prefix apps/api run typecheck`
  - `npm --prefix apps/api run lint`
  - `npm --prefix apps/api run test:e2e`
- Si la PR ajoute des endpoints : DTOs validés, guards en place, pas d’accès direct au ledger.
- Pas d’accès en écriture au ledger hors `payments.service.ts`.
- Idempotence inchangée et testée si endpoints sensibles.

## Phases suivantes (contexte)

- Phase 2 (bloquant): Auth + RBAC minimal (JWT, rôles BUYER/SELLER/ADMIN), Users + KYC vendeur (PENDING/APPROVED/REJECTED, capture interdite sans KYC APPROVED), Admin minimal (lecture ledger, refund manuel, blocage user).
- Phase 3 (fonctionnel): annonces, chat, avis, notifications email.

## Sécurité & Qualité

- Validation stricte des entrées (DTO / class‑validator).
- Pas de secrets en clair (utiliser variables d’environnement).
- Journaux d’audit: conserver événements clés des paiements et des décisions KYC.

## Style & Commits

- Commits clairs (Conventional Commits recommandé).
- PRs petites et focalisées; éviter les “fourre-tout”.

Merci de respecter le gel du noyau financier. Toute évolution doit préserver les invariants d’audit. 
