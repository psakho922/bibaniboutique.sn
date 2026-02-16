'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { Search, CreditCard, DollarSign, FileText } from 'lucide-react';
import { clsx } from 'clsx';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<'intents' | 'accounts' | 'ledger'>('intents');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Paiements & Ledger</h1>
        <div className="flex space-x-2 bg-white p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveTab('intents')}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === 'intents' ? 'bg-orange-100 text-orange-800' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === 'accounts' ? 'bg-orange-100 text-orange-800' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Comptes
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === 'ledger' ? 'bg-orange-100 text-orange-800' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Ledger
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        {activeTab === 'intents' && <IntentsTable />}
        {activeTab === 'accounts' && <AccountsTable />}
        {activeTab === 'ledger' && <LedgerTable />}
      </div>
    </div>
  );
}

function IntentsTable() {
  const { data: intents, isLoading, mutate } = useSWR('/payments/intents', fetcher);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAction = async (action: 'confirm' | 'capture' | 'refund' | 'cancel', intentId: string) => {
    if (!confirm(`Confirmer l'action ${action.toUpperCase()} ?`)) return;
    setProcessing(intentId);
    try {
      await api.post(`/payments/${action}`, { intentId });
      mutate();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Erreur lors de l\'action');
    } finally {
      setProcessing(null);
    }
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {intents?.map((intent: any) => (
          <tr key={intent.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{intent.id.substring(0, 8)}...</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{intent.amountCfa.toLocaleString()} CFA</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={clsx(
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                intent.status === 'CAPTURED' ? 'bg-green-100 text-green-800' :
                intent.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                intent.status === 'REFUNDED' ? 'bg-purple-100 text-purple-800' :
                intent.status === 'CANCELED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              )}>
                {intent.status === 'REQUIRES_CONFIRMATION' ? 'PENDING' : intent.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(intent.createdAt).toLocaleString()}</td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex justify-end space-x-2">
                {intent.status === 'REQUIRES_CONFIRMATION' && (
                  <>
                    <button 
                      onClick={() => handleAction('confirm', intent.id)}
                      disabled={processing === intent.id}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={() => handleAction('cancel', intent.id)}
                      disabled={processing === intent.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {intent.status === 'CONFIRMED' && (
                  <>
                    <button 
                      onClick={() => handleAction('capture', intent.id)}
                      disabled={processing === intent.id}
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                    >
                      Capture
                    </button>
                    <button 
                      onClick={() => handleAction('refund', intent.id)}
                      disabled={processing === intent.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      Refund
                    </button>
                  </>
                )}
                {intent.status === 'CAPTURED' && (
                  <button 
                    onClick={() => handleAction('refund', intent.id)}
                    disabled={processing === intent.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    Refund
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AccountsTable() {
  const { data: accounts, isLoading } = useSWR('/payments/accounts', fetcher);

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {accounts?.map((account: any) => (
        <div key={account.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">{account.type}</h3>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{account.balanceCfa.toLocaleString()} CFA</p>
          <p className="text-sm text-gray-500 mt-2">ID: {account.id}</p>
        </div>
      ))}
    </div>
  );
}

function LedgerTable() {
  const { data: ledger, isLoading } = useSWR('/payments/ledger', fetcher);

  if (isLoading) return <div>Chargement...</div>;

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compte</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {ledger?.map((entry: any) => (
          <tr key={entry.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.desc}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <span className={entry.deltaCfa >= 0 ? 'text-green-600' : 'text-red-600'}>
                {entry.deltaCfa > 0 ? '+' : ''}{entry.deltaCfa.toLocaleString()} CFA
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {entry.account ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {entry.account.type}
                  {entry.account.type === 'USER' && entry.account.userId && (
                    <span className="ml-1 text-gray-500">({entry.account.userId.substring(0, 4)})</span>
                  )}
                </span>
              ) : (
                entry.accountId.substring(0, 8) + '...'
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(entry.createdAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
