/**
 * AUDIT DOC (Web > Home):
 * - Démonstration guidée:
 *   1) Seed: crée vendeur, acheteur et une annonce
 *   2) Create Intent: utilise Idempotency-Key
 *   3) Confirm puis Capture
 */
'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export default function Page() {
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [buyerId, setBuyerId] = useState<string | null>(null);
  const [listingId, setListingId] = useState<string | null>(null);
  const [intentId, setIntentId] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const append = (l: string) => setLog((x) => [l, ...x]);

  const seed = async () => {
    const res = await fetch(`${API}/demo/seed`, { method: 'POST' });
    const data = await res.json();
    setSellerId(data.seller.id);
    setBuyerId(data.buyer.id);
    setListingId(data.listing.id);
    append(`Seed ok: seller=${data.seller.id}, buyer=${data.buyer.id}, listing=${data.listing.id}`);
  };

  const createIntent = async () => {
    if (!buyerId || !listingId) return;
    const key = crypto.randomUUID();
    const res = await fetch(`${API}/payments/intents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
      body: JSON.stringify({ buyerId, listingId }),
    });
    const data = await res.json();
    setIntentId(data.id);
    append(`Intent created: ${data.id} (status=${data.status})`);
  };

  const confirm = async () => {
    if (!intentId) return;
    const res = await fetch(`${API}/payments/confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intentId }) });
    append(`Confirm → ${res.status}`);
  };
  const capture = async () => {
    if (!intentId) return;
    const res = await fetch(`${API}/payments/capture`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intentId }) });
    append(`Capture → ${res.status}`);
  };

  return (
    <section>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={seed}>1) Seed</button>
        <button onClick={createIntent}>2) Create Intent</button>
        <button onClick={confirm}>3) Confirm</button>
        <button onClick={capture}>4) Capture</button>
      </div>
      <pre>{JSON.stringify({ sellerId, buyerId, listingId, intentId }, null, 2)}</pre>
      <h3>Journal</h3>
      <ul>
        {log.map((l, i) => <li key={i}>{l}</li>)}
      </ul>
    </section>
  );
}
