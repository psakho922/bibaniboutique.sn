'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageCircle, User, ShoppingBag } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth';

interface Conversation {
  id: string;
  listing: {
    title: string;
    images: string[];
    priceCfa: number;
  };
  buyer: {
    id: string;
    email: string;
  };
  seller: {
    id: string;
    email: string;
  };
  messages: {
    content: string;
    createdAt: string;
    isRead: boolean;
  }[];
  updatedAt: string;
}

export default function ChatListPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const res = await api.get('/chat/conversations');
        setConversations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messagerie</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune conversation</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez à discuter avec des vendeurs ou des acheteurs.
          </p>
          <div className="mt-6">
            <Link
              href="/search"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
            >
              Parcourir les annonces
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {conversations.map((conversation) => {
              const lastMessage = conversation.messages[0];
              const otherUser = user?.id === conversation.buyer.id ? conversation.seller : conversation.buyer;

              return (
                <li key={conversation.id}>
                  <Link href={`/chat/${conversation.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {conversation.listing.images.length > 0 ? (
                              <img className="h-12 w-12 rounded-full object-cover" src={conversation.listing.images[0]} alt="" />
                            ) : (
                              <ShoppingBag className="h-12 w-12 text-gray-400 bg-gray-100 rounded-full p-2" />
                            )}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-orange-600 truncate">{conversation.listing.title}</p>
                            <p className="flex items-center text-sm text-gray-500">
                              <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <span className="truncate">
                                {otherUser ? otherUser.email.split('@')[0] : 'Utilisateur inconnu'}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {conversation.listing.priceCfa} CFA
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {new Date(conversation.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <MessageCircle className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {lastMessage ? (
                              <span className="truncate max-w-xs">{lastMessage.content}</span>
                            ) : (
                              <span className="italic">Aucun message</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
