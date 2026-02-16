# Pull Request — Core Freeze Checklist

Merci de compléter cette checklist avant revue.

## Phase
- [ ] Phase 2 (Auth/RBAC, Users/KYC, Admin minimal)
- [ ] Phase 3 (Annonces, Chat, Avis, Notifications)
- [ ] Core Change (RFC obligatoire) — `core-change`

## Core Freeze
- [ ] Je n’ai modifié aucun fichier gelé :
      - apps/api/src/payments/payments.service.ts
      - apps/api/src/idempotency/idempotency.interceptor.ts
      - apps/api/src/idempotency/idempotency.store.ts
      - apps/api/src/idempotency/inmemory-idempotency.store.ts
      - apps/api/src/idempotency/prisma-idempotency.store.ts
      - apps/api/prisma/schema.prisma (modèles paiements)
- [ ] Si modification du noyau : RFC jointe, label `core-change`, tests mis à jour.

## Qualité & Tests
- [ ] Typecheck OK — `npm --prefix apps/api run typecheck`
- [ ] Lint OK — `npm --prefix apps/api run lint`
- [ ] Tests e2e idempotence OK — `npm --prefix apps/api run test:e2e`
- [ ] Les DTOs sont validés et les endpoints protégés (guards/RBAC si nécessaire).

## Paiement & Ledger
- [ ] Aucune écriture directe du ledger en dehors de `payments.service.ts`.
- [ ] Invariants double‑écriture conservés (deltas opposés, somme nulle par opération).
- [ ] FSM PaymentIntent inchangée (ou RFC si élargissement).
- [ ] Idempotence non régressée (mêmes requêtes → même réponse).

## Sécurité
- [ ] Pas de secrets en clair; variables d’environnement utilisées.
- [ ] Entrées utilisateur validées; limites basiques anti‑abus (si pertinent).

## Description de la PR
Décrire le périmètre, l’impact, et les tests effectués : 


