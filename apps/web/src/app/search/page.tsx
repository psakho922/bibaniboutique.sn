'use client';

import { api } from '@/lib/api';
import { Listing, ListingCard } from '@/components/ListingCard';
import { useEffect, useState } from 'react';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SearchPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      // Assuming GET /listings endpoint exists or similar
      // Currently backend only has GET /payments/intents and users.
      // We probably need a ListingsController in backend.
      // For now, let's mock or try to hit an endpoint if I create one.
      // I'll assume I will create GET /listings in backend.
      const res = await api.get('/listings');
      setListings(res.data);
    } catch (error) {
      console.error('Failed to fetch listings', error);
      // Fallback for demo if endpoint fails
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings = listings.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Explorer la boutique</h1>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Rechercher un article..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">Aucun article trouvé.</p>
          <Button className="mt-4" onClick={() => setSearch('')}>
            Effacer la recherche
          </Button>
        </div>
      )}
    </div>
  );
}
