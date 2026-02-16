'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth';
import { Send, ArrowLeft, Image as ImageIcon, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    email: string;
  };
}

interface Conversation {
  id: string;
  listing: {
    id: string;
    title: string;
    priceCfa: number;
    images: string[];
    sellerId: string;
  };
  buyerId: string;
  sellerId: string;
}

export default function ChatDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = params.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchData = async () => {
    try {
      // Fetch messages
      const msgsRes = await api.get(`/chat/conversations/${conversationId}/messages`);
      setMessages(msgsRes.data);

      // Fetch conversation details directly
      const convRes = await api.get(`/chat/conversations/${conversationId}`);
      setConversation(convRes.data);
    } catch (err) {
      console.error(err);
      // router.push('/chat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      // Simple polling for new messages every 5 seconds
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [user, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post(`/chat/conversations/${conversationId}/messages`, { content: newMessage });
      setNewMessage('');
      fetchData(); // Refresh immediately
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (!user || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <Link href="/chat" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {conversation?.listing.title || 'Conversation'}
            </h1>
            <p className="text-sm text-gray-500">
              {conversation?.listing.priceCfa} FCFA
            </p>
          </div>
        </div>
        {conversation && (
          <Link href={`/listings/${conversation.listing.id}`}>
            <Button variant="outline" size="sm" className="flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Voir l'annonce
            </Button>
          </Link>
        )}
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
                <p>Aucun message. Commencez la discussion !</p>
            </div>
        ) : (
            messages.map((msg) => {
            const isMe = msg.senderId === user.id;
            return (
                <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                <div
                    className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 shadow-sm ${
                    isMe
                        ? 'bg-orange-600 text-white rounded-br-none'
                        : 'bg-white text-gray-900 rounded-bl-none'
                    }`}
                >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-orange-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                </div>
            );
            })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 rounded-full border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="inline-flex items-center justify-center p-2 rounded-full text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
