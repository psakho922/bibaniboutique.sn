'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { api } from '@/lib/api';
import { clsx } from 'clsx';
import { Trash2 } from 'lucide-react';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function AdminModerationPage() {
  const { data: conversations, isLoading } = useSWR('/chat/admin/conversations', fetcher);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  return (
    <div className="h-[calc(100vh-100px)] flex gap-4">
      {/* List */}
      <div className="w-1/3 bg-white rounded-lg shadow overflow-y-auto">
        <h2 className="p-4 font-bold border-b">Conversations ({conversations?.length || 0})</h2>
        {isLoading ? (
          <div className="p-4">Chargement...</div>
        ) : (
          <div className="divide-y">
            {conversations?.map((conv: any) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={clsx(
                  'p-4 cursor-pointer hover:bg-gray-50 transition-colors',
                  selectedConversation === conv.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                )}
              >
                <div className="font-medium">{conv.listing?.title || 'Produit supprimé'}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {conv.buyer?.email} ↔ {conv.seller?.email}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(conv.updatedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="w-2/3 bg-white rounded-lg shadow flex flex-col">
        {selectedConversation ? (
          <ChatDetails conversationId={selectedConversation} />
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-400">
            Sélectionnez une conversation
          </div>
        )}
      </div>
    </div>
  );
}

function ChatDetails({ conversationId }: { conversationId: string }) {
  const { data: messages, mutate: refreshMessages } = useSWR(
    `/chat/admin/conversations/${conversationId}/messages`,
    fetcher
  );

  const handleDelete = async (msgId: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    try {
      await api.delete(`/chat/admin/messages/${msgId}`);
      refreshMessages();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression');
    }
  };

  if (!messages) return <div className="p-8 text-center">Chargement des messages...</div>;

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500">Aucun message.</div>
      ) : (
        messages.map((msg: any) => (
          <div key={msg.id} className="border p-3 rounded-lg hover:bg-gray-50 group">
            <div className="flex justify-between items-start mb-1">
              <span className={clsx(
                "text-xs font-bold",
                msg.sender?.role === 'ADMIN' ? 'text-purple-600' :
                msg.sender?.role === 'SELLER' ? 'text-blue-600' : 'text-gray-600'
              )}>
                {msg.sender?.email} ({msg.sender?.role})
              </span>
              <button 
                onClick={() => handleDelete(msg.id)}
                className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.content}</p>
            <div className="text-xs text-gray-400 mt-1 text-right">
              {new Date(msg.createdAt).toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
