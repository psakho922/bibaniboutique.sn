'use client';

import { Users, ShoppingBag, CreditCard, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function AdminDashboardPage() {
  const { data: statsData, error } = useSWR('/monitoring/stats', fetcher);

  if (error) return <div className="p-6 text-red-600">Erreur lors du chargement des statistiques. Vérifiez que vous êtes connecté en tant qu'administrateur.</div>;
  if (!statsData) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );

  const stats = [
    { 
      name: 'Utilisateurs', 
      value: statsData.users.total, 
      subtext: `+${statsData.users.newToday} aujourd'hui`, 
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      name: 'Annonces', 
      value: statsData.listings.total, 
      subtext: `${statsData.listings.active} actives / ${statsData.listings.sold} vendues`, 
      icon: ShoppingBag,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    { 
      name: 'Volume Ventes', 
      value: `${statsData.payments.volume.toLocaleString()} CFA`, 
      subtext: 'Total capturé', 
      icon: CreditCard,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    { 
      name: 'Système', 
      value: 'Opérationnel', 
      subtext: `Uptime: ${Math.floor(statsData.system.uptime / 60)} min`, 
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Activité Récente</h2>
        </div>
        <div className="p-6">
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-100">
              {statsData.activity && statsData.activity.length > 0 ? (
                statsData.activity.map((activity: any, index: number) => (
                  <li key={index} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          activity.type === 'PAYMENT' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {activity.type === 'PAYMENT' ? 'P' : 'U'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.user}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {activity.details}
                        </p>
                      </div>
                      <div className="inline-flex items-center text-xs text-gray-400">
                        {new Date(activity.date).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">Aucune activité récente</div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
