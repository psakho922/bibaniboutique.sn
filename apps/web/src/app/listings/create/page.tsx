'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

// Header: Page de création d'annonce
// Rôle: Permet à un utilisateur connecté de mettre en vente un article.

export default function CreateListingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceCfa: '',
    images: '',
    size: '',
    brand: '',
    condition: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        priceCfa: parseInt(formData.priceCfa),
        images: formData.images.split(',').map(url => url.trim()).filter(url => url),
        size: formData.size,
        brand: formData.brand,
        condition: formData.condition
      };

      if (isNaN(payload.priceCfa) || payload.priceCfa <= 0) {
        throw new Error('Le prix doit être un nombre positif');
      }

      await api.post('/listings', payload);
      router.push('/account'); // Redirect to account/listings
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création de l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-6">Vendre un article</h1>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Titre de l'annonce</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Ex: Robe d'été fleurie"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                placeholder="Décrivez votre article (état, matière, etc.)"
              />
            </div>

            <div>
              <Label htmlFor="priceCfa">Prix (CFA)</Label>
              <Input
                id="priceCfa"
                name="priceCfa"
                type="number"
                value={formData.priceCfa}
                onChange={handleChange}
                required
                placeholder="Ex: 5000"
                min="100"
              />
            </div>

            <div>
              <Label htmlFor="images">Images (URLs séparées par des virgules)</Label>
              <Input
                id="images"
                name="images"
                value={formData.images}
                onChange={handleChange}
                placeholder="https://exemple.com/image1.jpg, https://exemple.com/image2.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">Pour ce prototype, utilisez des URLs d'images externes.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <Label htmlFor="size">Taille</Label>
                <Input
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="Ex: M / 38"
                />
              </div>

              <div>
                <Label htmlFor="brand">Marque</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Ex: Zara"
                />
              </div>

              <div>
                <Label htmlFor="condition">État</Label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 h-10"
                >
                  <option value="">Sélectionner</option>
                  <option value="NEW">Neuf avec étiquette</option>
                  <option value="LIKE_NEW">Très bon état</option>
                  <option value="GOOD">Bon état</option>
                  <option value="FAIR">Satisfaisant</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Création en cours...' : 'Publier l\'annonce'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
