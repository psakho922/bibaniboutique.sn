'use client';

import { api } from '@/lib/api';
import { Listing } from '@/components/ListingCard';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, Heart, Share2, ShieldCheck, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function ListingDetailsPage() {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger l\'annonce');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Oups !</h2>
        <p className="text-gray-600 mb-8">{error || 'Annonce introuvable'}</p>
        <Link href="/search">
          <Button variant="outline">Retour à la boutique</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
        {/* Image gallery */}
        <div className="flex flex-col-reverse">
          <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
             {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover object-center"
                />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ShoppingBag className="h-24 w-24 opacity-20" />
                </div>
             )}
          </div>
        </div>

        {/* Product info */}
        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{listing.title}</h1>
          
          <div className="mt-3">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl tracking-tight text-indigo-600 font-bold">
              {listing.priceCfa.toLocaleString('fr-FR')} FCFA
            </p>
          </div>

          <div className="mt-6">
            <h3 className="sr-only">Description</h3>
            <div className="text-base text-gray-700 space-y-6">
              <p>{listing.description}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Taille</dt>
                <dd className="mt-1 text-sm text-gray-900">{listing.size || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Marque</dt>
                <dd className="mt-1 text-sm text-gray-900">{listing.brand || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">État</dt>
                <dd className="mt-1 text-sm text-gray-900">{listing.condition || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Vendeur</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                   {listing.seller?.email}
                   <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                     Vérifié
                   </span>
                </dd>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <Button size="lg" className="flex-1">
              Acheter maintenant
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="lg">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
             <ShieldCheck className="h-5 w-5 text-green-600" />
             <span>Protection acheteur Biba incluse</span>
          </div>
        </div>
      </div>
    </div>
  );
}
