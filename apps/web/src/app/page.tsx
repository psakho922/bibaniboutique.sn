'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Search, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-indigo-600 text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            La Mode de Seconde Main <br className="hidden md:block" />
            <span className="text-indigo-200">Au Prix Juste.</span>
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 max-w-2xl mx-auto mb-10">
            Achetez et vendez vos vêtements en toute sécurité sur la première marketplace audit-grade du Sénégal.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/search">
              <Button size="lg" className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-gray-100 border-none">
                Commencer à acheter
              </Button>
            </Link>
            <Link href="/sell">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-indigo-700 hover:text-white">
                Vendre un article
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Pourquoi choisir Biba ?</h2>
          <p className="mt-4 text-lg text-gray-500">Une expérience d'achat et de vente pensée pour la confiance.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-6">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Paiement Sécurisé</h3>
            <p className="text-gray-500">
              L'argent est bloqué jusqu'à la validation de la réception. Zéro risque pour l'acheteur.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-6">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Double Écriture</h3>
            <p className="text-gray-500">
              Chaque transaction est auditée avec une comptabilité rigoureuse en double entrée.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-6">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Livraison Suivie</h3>
            <p className="text-gray-500">
              Suivez votre colis étape par étape jusqu'à la remise en main propre.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-700 rounded-2xl shadow-xl overflow-hidden md:flex">
            <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white mb-4">Prêt à faire du tri ?</h2>
              <p className="text-indigo-100 mb-8 text-lg">
                Vendez les vêtements que vous ne portez plus et donnez-leur une seconde vie. C'est simple, rapide et sécurisé.
              </p>
              <div>
                <Link href="/register">
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                    Créer mon compte
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block md:w-1/2 bg-indigo-800 relative min-h-[300px]">
              {/* Placeholder for an image */}
              <div className="absolute inset-0 flex items-center justify-center text-indigo-300 opacity-20">
                <span className="text-9xl font-bold">BIBA</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
