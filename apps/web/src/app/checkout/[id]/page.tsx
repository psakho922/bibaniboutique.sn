'use client';

import { api } from '@/lib/api';
import { Listing } from '@/components/ListingCard';
import { useAuth } from '@/context/auth';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Lock, ShieldCheck, CreditCard } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function CheckoutPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les détails de la commande');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchListing();
  }, [id]);

  const handlePayment = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      // 1. Create Payment Intent
      const idempotencyKey = uuidv4();
      const intentRes = await api.post('/payments/intents', {
        listingId: listing?.id,
      }, {
        headers: { 'Idempotency-Key': idempotencyKey }
      });

      const intentId = intentRes.data.id;

      // 2. Simulate Payment Confirmation (In real app, redirect to Stripe/OrangeMoney)
      // For this demo, we auto-confirm immediately to simulate "Payment Success"
      await api.post('/payments/confirm', { intentId });

      // 3. Redirect to Success
      router.push('/checkout/success');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Le paiement a échoué. Veuillez réessayer.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Paiement sécurisé</h1>
        <p className="text-gray-500 mt-2">Finalisez votre commande en toute sécurité</p>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="h-20 w-20 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
               {listing.images && listing.images.length > 0 ? (
                  <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
               ) : (
                  <div className="h-full w-full bg-gray-200" />
               )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-lg">{listing.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{listing.condition || 'Bon état'}</p>
            </div>
            <div className="ml-auto">
              <p className="font-bold text-gray-900 text-lg">{listing.priceCfa.toLocaleString()} FCFA</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sous-total</span>
              <span className="text-gray-900 font-medium">{listing.priceCfa.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Frais de protection acheteur (5%)</span>
              <span className="text-gray-900 font-medium">{(listing.priceCfa * 0.05).toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Livraison</span>
              <span className="text-green-600 font-medium">Gratuite</span>
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
              <span className="text-base font-bold text-gray-900">Total à payer</span>
              <span className="text-2xl font-bold text-indigo-600">{(listing.priceCfa * 1.05).toLocaleString()} FCFA</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 text-sm">
              {error}
            </div>
          )}

          <Button 
            className="w-full h-12 text-lg" 
            onClick={handlePayment} 
            isLoading={processing}
            disabled={processing}
          >
            <Lock className="h-5 w-5 mr-2" />
            Payer maintenant
          </Button>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span>Paiement crypté et sécurisé</span>
          </div>
          <div className="mt-2 text-center text-xs text-gray-400">
             En cliquant sur "Payer maintenant", vous acceptez nos CGV et la Politique de Confidentialité.
          </div>
        </div>
      </div>
    </div>
  );
}
