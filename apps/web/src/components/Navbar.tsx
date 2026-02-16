'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth';
import { ShoppingBag, User, LogOut, Search, Menu, X, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-600">Biba</span>
              <span className="text-2xl font-bold text-gray-900">Boutique</span>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link href="/search" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Acheter
            </Link>
            <Link href="/sell" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Vendre
            </Link>
            
            {user ? (
              <div className="relative flex items-center space-x-4">
                <Link href="/chat" className="text-gray-500 hover:text-gray-900" title="Messagerie">
                  <MessageCircle className="h-6 w-6" />
                </Link>
                <Link href="/account" className="text-gray-500 hover:text-gray-900" title="Mon Compte">
                  <User className="h-6 w-6" />
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin/dashboard" className="text-red-600 hover:text-red-800 font-bold text-sm">
                    ADMIN
                  </Link>
                )}
                <button onClick={logout} className="text-gray-500 hover:text-red-600" title="Déconnexion">
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Connexion</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Inscription</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/search" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
              Acheter
            </Link>
            <Link href="/sell" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
              Vendre
            </Link>
            {user ? (
              <>
                <Link href="/account" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Mon Compte
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="mt-4 px-3 space-y-2">
                <Link href="/login" className="block w-full">
                  <Button variant="ghost" className="w-full justify-start">Connexion</Button>
                </Link>
                <Link href="/register" className="block w-full">
                  <Button className="w-full justify-start">Inscription</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
