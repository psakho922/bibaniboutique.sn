'use client';

import { useAuth } from '@/context/auth';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { User, Package, ShoppingBag, CreditCard, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setProfile(res.data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    if (authUser) fetchProfile();
  }, [authUser]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="md:flex md:gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 mb-8 md:mb-0">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col items-center mb-6">
              <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{profile.email.split('@')[0]}</h2>
              <p className="text-sm text-gray-500">{profile.role}</p>
            </div>
            
            <nav className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-indigo-600 bg-indigo-50">
                <User className="mr-2 h-4 w-4" />
                Mon Profil
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Mes Achats
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Mes Ventes
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
                Déconnexion
              </Button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* KYC Status Banner */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
             <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
               <ShieldCheck className="h-5 w-5 mr-2 text-indigo-600" />
               Statut Vérification (KYC)
             </h3>
             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                   <p className="font-medium text-gray-900">
                     Statut actuel: 
                     <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold
                       ${profile.kycStatus === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                         profile.kycStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                         profile.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-800'}
                     `}>
                       {profile.kycStatus || 'NON SOUMIS'}
                     </span>
                   </p>
                   {profile.kycStatus === 'NONE' && (
                     <p className="text-sm text-gray-500 mt-1">Vérifiez votre identité pour pouvoir vendre et retirer vos fonds.</p>
                   )}
                </div>
                {profile.kycStatus === 'NONE' && (
                  <Button size="sm">Vérifier mon identité</Button>
                )}
             </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm font-medium text-gray-500">Achats</p>
              <p className="text-2xl font-bold text-gray-900">{profile.intentsBought.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm font-medium text-gray-500">Ventes</p>
              <p className="text-2xl font-bold text-gray-900">{profile.intentsSold.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm font-medium text-gray-500">Annonces en ligne</p>
              <p className="text-2xl font-bold text-gray-900">{profile.listings.length}</p>
            </div>
          </div>

          {/* Recent Listings */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Mes Annonces Récentes</h3>
              <Link href="/sell">
                <Button size="sm">Créer une annonce</Button>
              </Link>
            </div>
            
            {profile.listings.length > 0 ? (
              <div className="space-y-4">
                {profile.listings.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.priceCfa.toLocaleString()} FCFA</p>
                    </div>
                    <Link href={`/listings/${item.id}`}>
                      <Button variant="outline" size="sm">Voir</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Vous n'avez aucune annonce en ligne.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
