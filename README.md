# Biba Audit — Monorepo Pédagogique (Banque/Fintech)

## Objectif
Un projet compréhensible par un débutant via le code et l’historique Git, aligné audit fintech:
- Paiements avec intentions + idempotence
- Comptabilité double écriture (ledger)
- Admin UI de contrôle
- Front boutique minimal

## Architecture
- apps/api: NestJS + Prisma (PostgreSQL). Modules:
  - payments: PaymentIntent + ledger double écriture
  - idempotency: Interceptor générique, stockage Prisma
  - users: lecture simple
  - demo: seed de données
- apps/admin: Next.js (App Router). Vues:
  - Intents (confirm, capture, refund)
  - Accounts & Ledger (lecture)
  - Users (lecture)
- apps/web: Next.js. Parcours d’achat simulé.

## Flux de paiement
1. createIntent (Idempotency-Key obligatoire) → calcule frais
2. confirm → EXTERNAL_PSP → ESCROW
3. capture → ESCROW → USER + ESCROW → PLATFORM_FEES
4. refund (avant capture) → ESCROW → EXTERNAL_PSP

## Rôles
- USER: acheteur
- SELLER: vendeur (reçoit le montant net)
- ADMIN: actions capture/refund côté admin

## Invariants métier
- Idempotence: même clé + même requête → même réponse
- Ledger: toute mutation crée deux écritures opposées
- Comptes techniques toujours présents: PLATFORM_ESCROW, PLATFORM_FEES, EXTERNAL_PSP

## Démarrage rapide (API)
1. Dépendances:
   - DATABASE_URL (PostgreSQL)
2. Générer Prisma:
   - npm --prefix apps/api run prisma:generate
3. Dev:
   - npm --prefix apps/api run dev
4. Démo:
   - POST /demo/seed → récupère buyer/seller/listing
   - POST /payments/intents (Idempotency-Key) → crée intention
   - POST /payments/confirm /capture /refund
   - GET /payments/accounts /ledger

## Tests
- npm --prefix apps/api run test:e2e
- Teste explicitement l’anti-rejeu d’IdempotencyInterceptor.

## Admin & Web
- Admin: NEXT_PUBLIC_API_BASE_URL par défaut http://localhost:3001
- Web: Idem, propose un chemin “seed → intent → confirm → capture”
