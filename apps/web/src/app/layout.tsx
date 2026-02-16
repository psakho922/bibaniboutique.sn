/**
 * AUDIT DOC (Web Layout):
 * - Front minimal: simule un parcours d’achat.
 */
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui', margin: 20 }}>
        <h1>Boutique Démo</h1>
        <main>{children}</main>
      </body>
    </html>
  );
}
