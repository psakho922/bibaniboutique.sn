/**
 * AUDIT DOC (Admin > Accounts & Ledger):
 * - Visualisation des comptes (avec soldes) et des écritures récentes.
 */
'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

type AccountRow = { id: string; type: string; balanceCfa: number };
type LedgerRow = { id: string; accountId: string; deltaCfa: number; desc?: string; createdAt?: string };

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [a, l] = await Promise.all([
      fetch(`${API}/payments/accounts`).then((r) => r.json()),
      fetch(`${API}/payments/ledger`).then((r) => r.json()),
    ]);
    setAccounts(a);
    setLedger(l);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section>
      <h2>Accounts</h2>
      {loading && <p>Chargement...</p>}
      <table style={{ width: '100%', marginBottom: 20 }}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Type</th>
            <th>Balance (CFA)</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.type}</td>
              <td>{a.balanceCfa}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Ledger (derniers mouvements)</h3>
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Account</th>
            <th>Delta</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {ledger.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.accountId}</td>
              <td>{e.deltaCfa}</td>
              <td>{e.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
