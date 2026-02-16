/**
 * AUDIT DOC (Admin Layout):
 * - Met en place la navigation des rubriques: Intents, Accounts & Ledger, Users.
 * - L'objectif est de permettre un contrôle total côté admin.
 */
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui', margin: 20 }}>
        <h1>Admin Biba Audit</h1>
        <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <a href="/">Accueil</a>
          <a href="/intents">Intents</a>
          <a href="/accounts">Accounts & Ledger</a>
          <a href="/users">Users</a>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
