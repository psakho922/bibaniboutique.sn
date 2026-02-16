'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { useRouter } from 'next/navigation';
import { Plus, Package, DollarSign, TrendingUp, Edit, Trash2, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'sales'>('overview');
  const [loading, setLoading] = useState(false);
  
  // Data
  const [myListings, setMyListings] = useState<any[]>([]);
  const [mySales, setMySales] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSales: 0, activeListings: 0, revenue: 0 });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (!authLoading && user && user.role !== 'SELLER' && user.role !== 'ADMIN') {
      router.push('/account'); // Redirect if not seller
    }
  }, [authLoading, user, router]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Parallel fetching
      const [listingsRes, salesRes] = await Promise.all([
        api.get('/listings/my-listings'),
        api.get('/payments/my-sales')
      ]);

      setMyListings(listingsRes.data);
      setMySales(salesRes.data);

      // Calculate stats
      const activeCount = listingsRes.data.filter((l: any) => l.status === 'ACTIVE').length;
      const salesCount = salesRes.data.length;
      const totalRevenue = salesRes.data.reduce((acc: number, sale: any) => acc + (sale.amountCfa || 0), 0);

      setStats({
        activeListings: activeCount,
        totalSales: salesCount,
        revenue: totalRevenue
      });

    } catch (err) {
      console.error('Error fetching seller data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
    try {
      await api.delete(`/listings/${id}`);
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('Erreur lors de la suppression');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Tableau de Bord Vendeur
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/listings/create"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouvelle Annonce
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['overview', 'listings', 'sales'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`${
                activeTab === tab
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab === 'overview' ? "Vue d'ensemble" : tab === 'listings' ? 'Mes Annonces' : 'Mes Ventes'}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Annonces Actives</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.activeListings}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Ventes Totales</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.totalSales}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Revenu Total (Est.)</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.revenue.toLocaleString()} FCFA</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {myListings.length === 0 ? (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">Aucune annonce trouvée. Créez votre première annonce !</li>
            ) : (
              myListings.map((listing) => (
                <li key={listing.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
                           {/* Placeholder image logic could go here */}
                           <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-orange-600 truncate">{listing.title}</p>
                          <p className="flex items-center text-sm text-gray-500">
                            {listing.priceCfa} FCFA - {listing.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/listings/${listing.id}`} className="text-gray-400 hover:text-gray-500">
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link href={`/listings/${listing.id}/edit`} className="text-blue-400 hover:text-blue-500">
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button onClick={() => handleDeleteListing(listing.id)} className="text-red-400 hover:text-red-500">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === 'sales' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {mySales.length === 0 ? (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">Aucune vente pour le moment.</li>
            ) : (
              mySales.map((sale) => (
                <li key={sale.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600 truncate">Vente #{sale.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-500">
                          Montant: {sale.amountCfa} FCFA | Statut: {sale.status}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sale.status === 'SUCCEEDED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sale.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
