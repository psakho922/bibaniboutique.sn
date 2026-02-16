import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-bold text-indigo-600">Biba</span>
            <span className="text-2xl font-bold text-gray-900">Boutique</span>
            <p className="mt-4 text-gray-500 text-sm">
              La première marketplace de vêtements d'occasion audit-grade au Sénégal.
              Achetez et vendez en toute confiance avec notre système de paiement sécurisé.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Navigation</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/search" className="text-base text-gray-500 hover:text-gray-900">
                  Acheter
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-base text-gray-500 hover:text-gray-900">
                  Vendre
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Légal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/terms" className="text-base text-gray-500 hover:text-gray-900">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; 2024 BibaBoutique. Tous droits réservés. Projet Audit Fintech.
          </p>
        </div>
      </div>
    </footer>
  );
}
