import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface Listing {
  id: string;
  title: string;
  description?: string;
  priceCfa: number;
  sellerId: string;
  seller?: {
    email: string;
  };
  createdAt: string;
  images: string[];
  size?: string;
  brand?: string;
  condition?: string;
}

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow group">
      <div className="aspect-square bg-gray-200 relative">
        {/* Placeholder for image */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <ShoppingBag className="h-12 w-12 opacity-20" />
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
           {/* Favorite button could go here */}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 truncate">{listing.title}</h3>
        <p className="mt-1 text-xl font-bold text-indigo-600">{listing.priceCfa.toLocaleString('fr-FR')} FCFA</p>
        <p className="mt-2 text-sm text-gray-500 truncate">Vendeur: {listing.seller?.email || listing.sellerId}</p>
        <div className="mt-4">
          <Link href={`/listings/${listing.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              Voir détails
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
