'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { Search, Trash2, ExternalLink, Eye, Ban } from 'lucide-react';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  priceCfa: number;
  createdAt: string;
  seller: {
    id: string;
    email: string;
  };
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function AdminListingsPage() {
  const { data: listings, error, isLoading, mutate } = useSWR<Listing[]>('/listings/admin', fetcher);
  const [search, setSearch] = useState('');

  const filteredListings = listings?.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase()) || 
    l.seller.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeactivate = async (id: string) => {
    if (!confirm('Voulez-vous désactiver cette annonce ?')) return;
    try {
      await api.put(`/listings/${id}`, { status: 'INACTIVE' });
      mutate();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la désactivation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.')) return;
    try {
      await api.delete(`/listings/${id}`);
      mutate();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression');
    }
  };

  if (isLoading) return <div className="p-8 text-center">Chargement des annonces...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Erreur lors du chargement.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Annonces</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher (titre, vendeur)..."
            className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-orange-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendeur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredListings?.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                  <div className="text-sm text-gray-500">ID: {listing.id.substring(0, 8)}...</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {listing.priceCfa.toLocaleString()} CFA
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {listing.seller.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(listing.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <Link href={`/listings/${listing.id}`} target="_blank" className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </Link>
                  <button
                    onClick={() => handleDeactivate(listing.id)}
                    className="text-orange-600 hover:text-orange-900 inline-flex items-center"
                  >
                    <Ban className="w-4 h-4 mr-1" />
                    Désactiver
                  </button>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    className="text-red-600 hover:text-red-900 inline-flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
