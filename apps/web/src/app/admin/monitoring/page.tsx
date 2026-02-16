'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import { Users, ShoppingBag, CreditCard, Activity } from 'lucide-react';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function AdminMonitoringPage() {
  const { data: users } = useSWR('/users', fetcher);
  const { data: listings } = useSWR('/listings', fetcher);
  const { data: intents } = useSWR('/payments/intents', fetcher);
  const { data: accounts } = useSWR('/payments/accounts', fetcher);

  const stats = {
    totalUsers: users?.length || 0,
    totalListings: listings?.length || 0,
    activeListings: listings?.filter((l: any) => l.status === 'ACTIVE').length || 0,
    totalVolume: intents?.reduce((acc: number, i: any) => acc + (i.status === 'CAPTURED' ? i.amountCfa : 0), 0) || 0,
    platformFees: intents?.reduce((acc: number, i: any) => acc + (i.status === 'CAPTURED' ? i.feeCfa : 0), 0) || 0,
    platformBalance: accounts?.find((a: any) => a.type === 'PLATFORM')?.balanceCfa || 0,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Monitoring & Statistiques</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Utilisateurs" 
          value={stats.totalUsers} 
          icon={<Users className="w-6 h-6 text-blue-600" />} 
          subtext={`${users?.filter((u: any) => u.role === 'SELLER').length || 0} vendeurs`}
        />
        <StatCard 
          title="Annonces Actives" 
          value={stats.activeListings} 
          icon={<ShoppingBag className="w-6 h-6 text-green-600" />} 
          subtext={`Sur ${stats.totalListings} totales`}
        />
        <StatCard 
          title="Volume d'affaires" 
          value={`${stats.totalVolume.toLocaleString()} CFA`} 
          icon={<Activity className="w-6 h-6 text-purple-600" />} 
          subtext="Total capturé"
        />
        <StatCard 
          title="Revenus Plateforme" 
          value={`${stats.platformFees.toLocaleString()} CFA`} 
          icon={<CreditCard className="w-6 h-6 text-orange-600" />} 
          subtext={`Solde actuel: ${stats.platformBalance.toLocaleString()} CFA`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Dernières Inscriptions</h3>
          <div className="space-y-4">
            {users?.slice(0, 5).map((u: any) => (
              <div key={u.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">{u.email}</div>
                  <div className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</div>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Dernières Transactions</h3>
          <div className="space-y-4">
            {intents?.slice(0, 5).map((i: any) => (
              <div key={i.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">{i.amountCfa.toLocaleString()} CFA</div>
                  <div className="text-xs text-gray-500">{new Date(i.createdAt).toLocaleDateString()}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  i.status === 'CAPTURED' ? 'bg-green-100 text-green-800' : 
                  i.status === 'REFUNDED' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>{i.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, subtext }: any) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {subtext && <div className="text-xs text-gray-500">{subtext}</div>}
    </div>
  );
}
