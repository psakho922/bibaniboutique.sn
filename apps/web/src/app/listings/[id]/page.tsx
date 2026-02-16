'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/auth';
import { MessageCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import ReviewList from '@/components/reviews/ReviewList';

// Header: Page de détails d'une annonce
// Rôle: Permet de voir les détails d'un article, contacter le vendeur et de l'acheter.

interface Listing {
  id: string;
  title: string;
  description: string;
  priceCfa: number;
  images: string[];
  size?: string;
  brand?: string;
  condition?: string;
  seller: {
    id: string;
    email: string;
  };
  createdAt: string;
  status: string;
}

export default function ListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [params.id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/listings/${params.id}`);
      setListing(res.data);
    } catch (err) {
      console.error(err);
      setError('Annonce non trouvée');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = () => {
    if (!user) {
      router.push(`/login?redirect=/checkout/${params.id}`);
      return;
    }
    router.push(`/checkout/${params.id}`);
  };

  const handleContact = async () => {
    if (!user) {
      router.push(`/login?redirect=/listings/${params.id}`);
      return;
    }
    
    if (user.id === listing?.seller.id) {
      alert("Vous ne pouvez pas vous contacter vous-même !");
      return;
    }

    setContacting(true);
    try {
      // Start or get existing conversation
      const res = await api.post('/chat/conversations', { listingId: listing?.id });
      router.push(`/chat?conversationId=${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création de la conversation');
    } finally {
      setContacting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">{error || 'Annonce introuvable'}</h1>
          <Button className="mt-4" onClick={() => router.push('/search')}>Retour aux annonces</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwner = user?.id === listing.seller.id;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-6xl mx-auto">
          <div className="md:flex">
            {/* Images Section */}
            <div className="md:w-1/2 p-4 bg-gray-100">
              <div className="aspect-w-1 aspect-h-1 bg-white rounded-lg overflow-hidden shadow-sm mb-4">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-center object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Pas d'image
                  </div>
                )}
              </div>
              {listing.images && listing.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {listing.images.slice(1).map((img, idx) => (
                    <div key={idx} className="aspect-w-1 aspect-h-1 bg-white rounded overflow-hidden shadow-sm cursor-pointer hover:opacity-75">
                      <img src={img} alt="" className="w-full h-full object-center object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="md:w-1/2 p-8 flex flex-col">
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                   <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                   {listing.status !== 'ACTIVE' && (
                     <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">
                       {listing.status}
                     </span>
                   )}
                </div>
                
                <p className="text-3xl font-bold text-orange-600 mb-6">{listing.priceCfa.toLocaleString()} FCFA</p>

                <div className="bg-gray-50 rounded-lg p-4 mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-b border-gray-200 pb-2">
                      <span className="block text-xs font-medium text-gray-500 uppercase">Taille</span>
                      <span className="block text-lg font-medium text-gray-900">{listing.size || 'N/A'}</span>
                    </div>
                    <div className="border-b border-gray-200 pb-2">
                      <span className="block text-xs font-medium text-gray-500 uppercase">Marque</span>
                      <span className="block text-lg font-medium text-gray-900">{listing.brand || 'N/A'}</span>
                    </div>
                    <div className="pb-2">
                      <span className="block text-xs font-medium text-gray-500 uppercase">État</span>
                      <span className="block text-lg font-medium text-gray-900">
                        {listing.condition === 'NEW' ? 'Neuf avec étiquette' :
                         listing.condition === 'LIKE_NEW' ? 'Très bon état' :
                         listing.condition === 'GOOD' ? 'Bon état' :
                         listing.condition === 'FAIR' ? 'Satisfaisant' : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-line leading-relaxed">{listing.description}</p>
                </div>

                <div className="mb-8 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Vendeur</h3>
                  <div className="flex items-center mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={() => router.push(`/sellers/${listing.seller.id}`)}>
                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">
                      {listing.seller.email[0].toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900">
                        {listing.seller.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        Membre vérifié <ShieldCheck className="inline h-3 w-3 ml-1 text-green-500" />
                      </p>
                      <p className="text-xs text-orange-600 mt-1">Voir le profil public &rarr;</p>
                    </div>
                  </div>
                  
                  {/* Reviews Section */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Avis récents</h4>
                    <ReviewList userId={listing.seller.id} />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                {!isOwner && listing.status === 'ACTIVE' && (
                  <>
                    <Button onClick={handleBuy} className="flex-1 py-4 text-lg flex items-center justify-center">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Acheter maintenant
                    </Button>
                    <Button 
                      onClick={handleContact} 
                      variant="outline" 
                      className="flex-1 py-4 text-lg flex items-center justify-center"
                      disabled={contacting}
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      {contacting ? '...' : 'Contacter'}
                    </Button>
                  </>
                )}
                {isOwner && (
                  <Button 
                    variant="outline" 
                    className="w-full py-4 text-lg"
                    onClick={() => router.push(`/listings/${listing.id}/edit`)}
                  >
                    Modifier mon annonce
                  </Button>
                )}
              </div>
              
              {!isOwner && listing.status === 'ACTIVE' && (
                <p className="mt-4 text-xs text-center text-gray-500 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 mr-1 text-green-500" />
                  Paiement sécurisé via BibaBoutique. Satisfait ou remboursé.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
