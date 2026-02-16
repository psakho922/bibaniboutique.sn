'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { User, ShoppingBag, CreditCard, MessageCircle, Star, ShieldCheck, Briefcase } from 'lucide-react';
import { api } from '@/lib/api';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewForm from '@/components/reviews/ReviewForm';

export default function AccountPage() {
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'sales' | 'reviews'>('profile');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Data states
  const [profileData, setProfileData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({ phone: '', password: '' });
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [reviewingListingId, setReviewingListingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch profile extended info
      const profileRes = await api.get('/users/me');
      setProfileData(profileRes.data);
      setEditForm(prev => ({ ...prev, phone: profileRes.data.phone || '' }));

      // Fetch orders using the payments controller endpoints
      const ordersRes = await api.get('/payments/my-orders');
      setOrders(ordersRes.data);

      if (user.role === 'SELLER' || user.role === 'ADMIN') {
        const salesRes = await api.get('/payments/my-sales');
        setSales(salesRes.data);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, activeTab]);

  const handleBecomeSeller = async () => {
    if (!confirm('Voulez-vous devenir vendeur ? Cela vous permettra de créer des annonces.')) return;
    setActionLoading(true);
    try {
      await api.put('/users/me/profile', { role: 'SELLER' });
      await refreshUser();
      alert('Félicitations ! Vous êtes maintenant vendeur.');
    } catch (err) {
      console.error('Error upgrading to seller:', err);
      alert('Erreur lors du changement de rôle.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestKyc = async () => {
    if (!confirm('Soumettre votre dossier KYC ? (Simulation)')) return;
    setActionLoading(true);
    try {
      await api.put('/users/me/profile', { kycStatus: 'PENDING' });
      fetchData();
    } catch (err) {
      console.error('Error requesting KYC:', err);
      alert('Erreur lors de la soumission KYC.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.put('/users/me/profile', {
        phone: editForm.phone || undefined,
        password: editForm.password || undefined
      });
      alert('Profil mis à jour !');
      setEditForm(prev => ({ ...prev, password: '' })); // Clear password
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setActionLoading(true);
    try {
      await api.post('/auth/verify-email');
      alert('Email vérifié avec succès !');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la vérification.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    setActionLoading(true);
    try {
      await api.post('/auth/verify-phone/init');
      const code = prompt('Code reçu par SMS (Simulation: entrez 0000) :');
      if (code) {
        await api.post('/auth/verify-phone/finalize', { code });
        alert('Téléphone vérifié avec succès !');
        fetchData();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Erreur lors de la vérification.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;
    setActionLoading(true);
    try {
      await api.post('/payments/cancel', { intentId: orderId });
      alert('Commande annulée.');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'annulation.');
    } finally {
      setActionLoading(false);
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
      <div className="md:flex md:space-x-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 mb-8 md:mb-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h2 className="text-sm font-medium text-gray-900 truncate">{user.email}</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {user.role}
                </span>
              </div>
            </div>
            <nav className="p-2 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'profile' ? 'bg-orange-50 text-orange-700' : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                <User className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400" />
                Profil & Sécurité
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'orders' ? 'bg-orange-50 text-orange-700' : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ShoppingBag className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400" />
                Mes Commandes
              </button>
              {(user.role === 'SELLER' || user.role === 'ADMIN') && (
                <button
                  onClick={() => setActiveTab('sales')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'sales' ? 'bg-orange-50 text-orange-700' : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400" />
                  Mes Ventes
                </button>
              )}
              {user.role === 'USER' && (
                <button
                  onClick={handleBecomeSeller}
                  disabled={actionLoading}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-900 hover:bg-gray-50"
                >
                  <Briefcase className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400" />
                  Devenir Vendeur
                </button>
              )}
              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'reviews' ? 'bg-orange-50 text-orange-700' : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Star className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400" />
                Avis Reçus
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
              >
                <ShieldCheck className="flex-shrink-0 mr-3 h-5 w-5 text-red-400" />
                Déconnexion
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white shadow rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Informations Personnelles</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <div className="p-2 block w-full shadow-sm sm:text-sm bg-gray-50 border border-gray-300 rounded-md">
                      {user.email}
                    </div>
                    {profileData?.emailVerified ? (
                        <span className="text-green-600 text-xs font-bold px-2 py-1 bg-green-100 rounded-full flex-shrink-0">VÉRIFIÉ</span>
                    ) : (
                        <button 
                            onClick={handleVerifyEmail}
                            disabled={actionLoading}
                            className="text-orange-600 text-xs font-medium hover:text-orange-800 underline flex-shrink-0"
                        >
                            Vérifier
                        </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <div className="p-2 block w-full shadow-sm sm:text-sm bg-gray-50 border border-gray-300 rounded-md">
                      {profileData?.phone || 'Non renseigné'}
                    </div>
                     {profileData?.phoneVerified ? (
                        <span className="text-green-600 text-xs font-bold px-2 py-1 bg-green-100 rounded-full flex-shrink-0">VÉRIFIÉ</span>
                    ) : (
                        <button 
                            onClick={handleVerifyPhone}
                            disabled={actionLoading || !profileData?.phone}
                            className={`text-orange-600 text-xs font-medium hover:text-orange-800 underline flex-shrink-0 ${(!profileData?.phone) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={!profileData?.phone ? "Ajoutez un numéro d'abord" : "Vérifier le numéro"}
                        >
                            Vérifier
                        </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rôle</label>
                  <div className="mt-1 p-2 block w-full shadow-sm sm:text-sm bg-gray-50 border border-gray-300 rounded-md">
                    {user.role}
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6 border-t border-gray-200 pt-6">
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Modifier Téléphone</label>
                        <input
                            type="text"
                            value={editForm.phone}
                            onChange={e => setEditForm({...editForm, phone: e.target.value})}
                            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border"
                            placeholder="+221..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                        <input
                            type="password"
                            value={editForm.password}
                            onChange={e => setEditForm({...editForm, password: e.target.value})}
                            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border"
                            placeholder="Laisser vide si inchangé"
                        />
                    </div>
                 </div>
                 <div className="flex justify-end">
                    <Button type="submit" isLoading={actionLoading}>Enregistrer les modifications</Button>
                 </div>
              </form>

              <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Vérification d'identité (KYC)</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Statut actuel:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profileData?.kycStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        profileData?.kycStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        profileData?.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {profileData?.kycStatus === 'NONE' ? 'NON VÉRIFIÉ' : profileData?.kycStatus}
                      </span>
                    </div>

                    {profileData?.kycStatus !== 'APPROVED' && profileData?.kycStatus !== 'PENDING' && (
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pièce d'identité (CNI / Passeport)</label>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                <input 
                                    type="file" 
                                    onChange={(e) => setKycFile(e.target.files?.[0] || null)}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                />
                                <Button 
                                    onClick={handleRequestKyc} 
                                    disabled={!kycFile || actionLoading}
                                    isLoading={actionLoading}
                                >
                                    Soumettre
                                </Button>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">Pour cet audit, l'upload est simulé. Sélectionnez n'importe quel fichier.</p>
                        </div>
                    )}
                     {profileData?.kycStatus === 'PENDING' && (
                        <p className="text-sm text-gray-500 italic">Votre dossier est en cours d'examen par nos équipes.</p>
                    )}
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Historique des Commandes</h2>
              </div>
              {orders.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Vous n'avez pas encore passé de commande.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <li key={order.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ShoppingBag className="h-8 w-8 text-gray-400 bg-gray-100 p-1.5 rounded-full" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{order.listing.title}</p>
                            <p className="text-sm text-gray-500">Vendeur: {order.seller.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{order.amountCfa} CFA</p>
                          <p className={`text-xs font-medium mb-1 ${
                            order.status === 'CAPTURED' ? 'text-green-600' : 
                            order.status === 'CANCELED' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {order.status}
                          </p>
                          {order.status === 'REQUIRES_CONFIRMATION' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 border-red-200 hover:bg-red-50 h-7 text-xs"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={actionLoading}
                            >
                              Annuler
                            </Button>
                          )}
                          {order.status === 'CAPTURED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-7 text-xs"
                              onClick={() => setReviewingListingId(order.listing.id)}
                            >
                              Laisser un avis
                            </Button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Historique des Ventes</h2>
              </div>
              {sales.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Aucune vente pour le moment.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {sales.map((sale) => (
                    <li key={sale.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="h-8 w-8 text-gray-400 bg-gray-100 p-1.5 rounded-full" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{sale.listing.title}</p>
                            <p className="text-sm text-gray-500">Acheteur: {sale.buyer.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{sale.amountCfa} CFA</p>
                          <p className={`text-xs font-medium ${
                            sale.status === 'CAPTURED' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {sale.status}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Avis Reçus</h2>
              <ReviewList userId={user.id} />
            </div>
          )}
        </div>
      </div>

      {reviewingListingId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <ReviewForm
              listingId={reviewingListingId}
              onSuccess={() => setReviewingListingId(null)}
              onCancel={() => setReviewingListingId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
