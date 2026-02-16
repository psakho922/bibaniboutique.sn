/**
 * AUDIT DOC (Admin > Intents):
 * - Liste des intentions, actions: confirm, capture, refund.
 * - API_BASE_URL configurable par variable d'environnement; défaut: http://localhost:3001
 */
'use client';
import { useEffect, useState } from 'react';

type Intent = { id: string; status: string; amountCfa: number; feeCfa: number; createdAt?: string };
const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export default function IntentsPage() {
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/payments/intents`);
      const data = await res.json();
      setIntents(data);
    } catch (e) {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const post = async (path: string, body: any) => {
    await fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    await load();
  };

  return (
    <section>
      <h2>Intents</h2>
      {loading && <p>Chargement...</p>}
      {error && <p>{error}</p>}
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Status</th>
            <th>Montant</th>
            <th>Frais</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {intents.map((it) => (
            <tr key={it.id}>
              <td>{it.id}</td>
              <td>{it.status}</td>
              <td>{it.amountCfa}</td>
              <td>{it.feeCfa}</td>
              <td style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => post('/payments/confirm', { intentId: it.id })}>Confirm</button>
                <button onClick={() => post('/payments/capture', { intentId: it.id })}>Capture</button>
                <button onClick={() => post('/payments/refund', { intentId: it.id })}>Refund</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
