'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { api } from '@/lib/api';
import { Search, CheckCircle, XCircle, AlertTriangle, Shield, User as UserIcon, Lock, Unlock } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';

interface User {
  id: string;
  email: string;
  phone?: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NONE';
  isBlocked: boolean;
  createdAt: string;
  _count: {
    listings: number;
    intentsBought: number;
    intentsSold: number;
  };
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function UsersPage() {
  const { data: users, error, isLoading } = useSWR<User[]>('/users', fetcher);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const filteredUsers = users?.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.id.includes(search)
  );

  const handleKycUpdate = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Êtes-vous sûr de vouloir passer le statut KYC à ${status} ?`)) return;
    setUpdating(userId);
    try {
      await api.put(`/users/${userId}/kyc`, { status });
      mutate('/users'); // Refresh data
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour du statut KYC');
    } finally {
      setUpdating(null);
    }
  };

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    const action = isBlocked ? 'bloquer' : 'débloquer';
    if (!confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) return;
    setUpdating(userId);
    try {
      await api.put(`/users/${userId}/block`, { isBlocked });
      mutate('/users'); // Refresh data
    } catch (err) {
      console.error(err);
      alert(`Erreur lors de l'action ${action}`);
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Chargement des utilisateurs...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Erreur lors du chargement des utilisateurs. Assurez-vous d'être ADMIN.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher (email, ID)..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers?.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email}
                        {user.isBlocked && <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Bloqué</span>}
                      </div>
                      <div className="text-sm text-gray-500">{user.id.substring(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={clsx(
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'SELLER' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  )}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.kycStatus === 'APPROVED' && (
                    <span className="flex items-center text-green-600 text-sm"><CheckCircle className="w-4 h-4 mr-1" /> Validé</span>
                  )}
                  {user.kycStatus === 'PENDING' && (
                    <span className="flex items-center text-yellow-600 text-sm"><AlertTriangle className="w-4 h-4 mr-1" /> En attente</span>
                  )}
                  {user.kycStatus === 'REJECTED' && (
                    <span className="flex items-center text-red-600 text-sm"><XCircle className="w-4 h-4 mr-1" /> Rejeté</span>
                  )}
                  {user.kycStatus === 'NONE' && (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>Annonces: {user._count.listings}</div>
                  <div>Achats: {user._count.intentsBought}</div>
                  <div>Ventes: {user._count.intentsSold}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {updating === user.id ? (
                    <span className="text-gray-400">...</span>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      {user.kycStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleKycUpdate(user.id, 'APPROVED')}
                            className="text-green-600 hover:text-green-900"
                            title="Approuver KYC"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleKycUpdate(user.id, 'REJECTED')}
                            className="text-red-600 hover:text-red-900"
                            title="Rejeter KYC"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleBlockUser(user.id, !user.isBlocked)}
                        className={user.isBlocked ? "text-green-600 hover:text-green-900" : "text-red-600 hover:text-red-900"}
                        title={user.isBlocked ? "Débloquer" : "Bloquer"}
                      >
                        {user.isBlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                      </button>

                      {user.kycStatus !== 'PENDING' && (
                        <button className="text-gray-400 hover:text-gray-600">
                          <UserIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
