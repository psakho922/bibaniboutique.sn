'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

function SuccessContent() {
  const searchParams = useSearchParams();
  const intentId = searchParams.get('intentId');

  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement Confirmé !</h1>
      <p className="text-gray-600 mb-6">
        Votre commande a été enregistrée avec succès.
        {intentId && <><br/> <span className="text-xs text-gray-400">ID Transaction: {intentId}</span></>}
      </p>

      <div className="space-y-3">
        <Link 
          href="/account"
          className="block w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Voir mes commandes
        </Link>
        <Link 
          href="/"
          className="block w-full py-2 px-4 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Suspense fallback={<div>Chargement...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
