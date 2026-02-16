'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger l'annonce.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchListing();
  }, [id]);

  const handlePayment = async () => {
    setProcessing(true);
    setError('');
    try {
      // 1. Create Payment Intent with Idempotency Key
      const idempotencyKey = crypto.randomUUID();
      const intentRes = await api.post(
        '/payments/intents',
        { listingId: id },
        { headers: { 'idempotency-key': idempotencyKey } }
      );
      
      const intent = intentRes.data;

      // 2. Simulate Payment Confirmation (In real world, this is done by Stripe/Provider)
      // For this audit/demo, we confirm immediately.
      await api.post('/payments/confirm', { intentId: intent.id });

      // 3. Redirect to Success
      router.push(`/checkout/success?intentId=${intent.id}`);

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Une erreur est survenue lors du paiement.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!listing) return <div className="min-h-screen flex items-center justify-center">Annonce introuvable.</div>;

  const fees = Math.round(listing.price * 0.05); // 5% fees example
  const total = listing.price + fees;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Paiement Sécurisé</h1>
        
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Récapitulatif de la commande</h2>
          
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Article</span>
            <span className="font-medium">{listing.title}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Prix</span>
            <span className="font-medium">{listing.price} FCFA</span>
          </div>
          
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Frais de protection (5%)</span>
            <span className="font-medium">{fees} FCFA</span>
          </div>
          
          <div className="border-t pt-4 mb-6 flex justify-between items-center">
            <span className="text-lg font-bold">Total à payer</span>
            <span className="text-lg font-bold text-green-600">{total} FCFA</span>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={processing}
            className={`w-full py-3 rounded-md text-white font-bold transition-colors ${
              processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {processing ? 'Traitement en cours...' : 'Payer maintenant'}
          </button>
          
          <p className="mt-4 text-xs text-center text-gray-500">
            Paiement sécurisé par Bibaniboutique via Ledger Audit-Grade.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
