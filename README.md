# Biba Audit — Marketplace & Fintech Audit-Grade

## Objectif
Un projet complet de marketplace C2C (type Vinted/Leboncoin) avec une brique de paiement audit-grade (Ledger double écriture), une interface admin complète et un frontend utilisateur moderne.
Le projet est conçu pour être pédagogique, lisible et "production-ready" pour une démonstration.

## Architecture Monorepo
- **apps/api**: NestJS + Prisma (PostgreSQL)
  - Modules: Auth (JWT, RBAC), Users (KYC), Listings, Payments (Ledger, Idempotency), Chat, Reviews.
  - Sécurité: Guards, Interceptors, Validation DTO.
- **apps/web**: Next.js (App Router) + Tailwind CSS
  - Frontend utilisateur complet : Accueil, Recherche, Compte, Vente, Achat, Chat, Avis.
- **apps/admin**: Intégré dans `apps/web` sous `/admin` (RBAC protégé)
  - Gestion totale : Utilisateurs (Blocage, KYC), Annonces (Modération), Paiements (Remboursement, Capture), Chat (Modération), Monitoring.

## Fonctionnalités Clés

### Partie 1 : Front Utilisateur (Next.js)
- **Public**: Accueil, Recherche avec filtres, Détails annonce, Profil vendeur public.
- **Authentification**: Inscription, Connexion, Vérification Email/Téléphone, Mot de passe oublié.
- **Compte Utilisateur**: Profil, Changement de rôle (Acheteur -> Vendeur), Statut KYC, Historique Commandes/Ventes.
- **Parcours Achat**: Création PaymentIntent (Idempotence), Confirmation, Annulation, Remboursement.
- **Parcours Vendeur**: Création/Modification annonce, Suivi des ventes, Porte-monnaie virtuel.
- **Social**: Chat interne temps réel (polling), Avis & Notations.

### Partie 2 : Admin Panel (Next.js)
- **Dashboard**: Stats globales (Utilisateurs, Annonces, Volume financier).
- **Utilisateurs**: Liste, Recherche, Blocage/Déblocage, Validation KYC (Approuver/Rejeter).
- **Annonces**: Modération, Suppression.
- **Paiements & Ledger**: Vue audit des transactions, Actions manuelles (Confirm/Capture/Refund), Ledger comptable.
- **Modération Chat**: Lecture des conversations, Suppression de messages.

### Partie 3 : Backend (NestJS)
- **Paiement Audit-Grade**:
  - Double écriture comptable (Ledger) pour chaque mouvement.
  - Idempotence stricte via clé d'idempotence.
  - Machines à états finis pour les PaymentIntents.
  - Blocage des fonds si KYC vendeur non validé.
- **Sécurité**:
  - JWT Authentication.
  - RBAC (Role-Based Access Control) : USER, SELLER, ADMIN.
  - Protection des routes sensibles.

## Installation & Démarrage

### Pré-requis
- Node.js 18+
- PostgreSQL
- Docker (optionnel pour la DB)

### 1. Base de données & Environnement

**Créer un fichier `.env` à la racine de `apps/api` :**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/biba_audit?schema=public"
JWT_SECRET="super-secret-key-change-me"
```

**Lancer la base de données :**
```bash
# Option A : Via Docker
docker-compose up -d

# Option B : PostgreSQL local
# Assurez-vous que la BDD "biba_audit" existe.
```

**Initialiser le schéma et les données (Seed) :**
```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
npx prisma db seed
# Cela crée les comptes :
# - Admin : admin@biba.sn / password123
# - Vendeur : vendeur@biba.sn / password123
# - Acheteur : acheteur@biba.sn / password123
```

### 2. Backend (API)
```bash
cd apps/api
npm install
npm run start:dev
# L'API tourne sur http://localhost:3001
```

### 3. Frontend (Web + Admin)
**Créer un fichier `.env.local` à la racine de `apps/web` (optionnel si par défaut) :**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

```bash
cd apps/web
npm install
npm run dev
# Le site est accessible sur http://localhost:3000
# L'admin est accessible sur http://localhost:3000/admin (Connexion requise avec compte Admin)
```

## Scénarios de Test (Demo)

1. **Créer un compte** : S'inscrire sur le frontend.
2. **Devenir Vendeur** : Dans "Mon Compte", passer au rôle Vendeur.
3. **Créer une annonce** : Mettre en vente un article.
4. **Acheter (autre compte)** : Créer un second compte, acheter l'article.
5. **Admin - Validation** :
   - Se connecter en ADMIN (ou modifier le rôle en BDD).
   - Valider le KYC du vendeur.
   - Vérifier le Ledger.
6. **Chat & Avis** : Discuter entre acheteur et vendeur, laisser un avis après la vente.

## Structure du Code
- `apps/api/src/payments`: Cœur du système financier.
- `apps/web/src/app`: Routes Next.js (App Router).
- `apps/web/src/components`: Composants réutilisables (UI).
- `apps/web/src/lib/api.ts`: Client Axios centralisé.
