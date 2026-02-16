'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ListingCard, Listing } from '@/components/ListingCard';
import ReviewList from '@/components/reviews/ReviewList';
import { ShieldCheck, MapPin, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SellerProfile {
  id: string;
  email: string;
  kycStatus: string;
  createdAt: string;
  role: string;
}

export default function SellerProfilePage() {
  const { id } = useParams();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sellerRes, listingsRes] = await Promise.all([
          api.get(`/users/${id}/public`),
          api.get(`/listings/seller/${id}`)
        ]);
        setSeller(sellerRes.data);
        setListings(listingsRes.data);
      } catch (err) {
        console.error('Error fetching seller data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendeur non trouvé</h1>
        <p className="text-gray-500">Ce profil n'existe pas ou a été désactivé.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl shrink-0">
            {seller.email[0].toUpperCase()}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
              {seller.email.split('@')[0]}
              {seller.kycStatus === 'APPROVED' && (
                <ShieldCheck className="h-6 w-6 text-green-500" aria-label="Vérifié" />
              )}
            </h1>
            
            <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Membre depuis {new Date(seller.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Sénégal
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center md:justify-start gap-6">
              <div className="text-center md:text-left">
                <span className="block text-xl font-bold text-gray-900">{listings.length}</span>
                <span className="text-sm text-gray-500">Annonces</span>
              </div>
              {/* Note: Reviews count could be added here if available in summary */}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('listings')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'listings'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Annonces en ligne
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'reviews'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Avis reçus
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.length > 0 ? (
              listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                Aucune annonce active pour le moment.
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="max-w-2xl">
            <ReviewList userId={seller.id} />
          </div>
        )}
      </div>
    </div>
  );
}
