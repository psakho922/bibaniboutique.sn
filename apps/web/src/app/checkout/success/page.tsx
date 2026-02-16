'use client';

import { Button } from '@/components/ui/Button';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-green-100 rounded-full p-6 mb-6">
        <CheckCircle className="h-16 w-16 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Paiement confirmé !</h1>
      <p className="text-gray-600 max-w-md mb-8">
        Votre commande a été traitée avec succès. Vous recevrez un email de confirmation sous peu.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/account">
          <Button variant="outline" className="w-full sm:w-auto">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Voir ma commande
          </Button>
        </Link>
        <Link href="/">
          <Button className="w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}
