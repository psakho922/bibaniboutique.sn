'use client';

import { useAuth } from '@/context/auth';
import { api } from '@/lib/api';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useRouter } from 'next/navigation';

const listingSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  priceCfa: z.number().min(500, 'Le prix minimum est de 500 FCFA'),
  size: z.string().optional(),
  brand: z.string().optional(),
  condition: z.string().optional(),
  // In a real app, we would handle image uploads.
  // For this demo, we'll just use a placeholder or skip image upload UI but send empty array.
});

type ListingData = z.infer<typeof listingSchema>;

export default function SellPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ListingData>({
    resolver: zodResolver(listingSchema),
  });

  const onSubmit = async (data: ListingData) => {
    try {
      setError(null);
      await api.post('/listings', {
        ...data,
        images: [], // Placeholder
      });
      router.push('/account'); // Redirect to dashboard/account
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la création de l\'annonce');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Vous devez être connecté pour vendre</h2>
        <Button onClick={() => router.push('/login')}>Se connecter</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vendre un article</h1>
        <p className="mt-2 text-gray-600">Mettez en vente vos vêtements en quelques clics.</p>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="title">Titre de l'annonce</Label>
            <div className="mt-2">
              <Input
                id="title"
                placeholder="Ex: Robe d'été fleurie Zara"
                {...register('title')}
                error={errors.title?.message}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <div className="mt-2">
              <textarea
                id="description"
                rows={4}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                placeholder="Décrivez votre article (état, matière, défauts éventuels...)"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="priceCfa">Prix (FCFA)</Label>
            <div className="mt-2 relative rounded-md shadow-sm">
              <Input
                id="priceCfa"
                type="number"
                placeholder="5000"
                {...register('priceCfa', { valueAsNumber: true })}
                error={errors.priceCfa?.message}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">FCFA</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
            <div>
              <Label htmlFor="size">Taille</Label>
              <div className="mt-2">
                <Input
                  id="size"
                  placeholder="Ex: M, 38, Unique"
                  {...register('size')}
                  error={errors.size?.message}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="brand">Marque</Label>
              <div className="mt-2">
                <Input
                  id="brand"
                  placeholder="Ex: Zara, H&M"
                  {...register('brand')}
                  error={errors.brand?.message}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="condition">État</Label>
              <div className="mt-2">
                 <select
                  id="condition"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 h-10"
                  {...register('condition')}
                 >
                   <option value="">Sélectionner...</option>
                   <option value="Neuf avec étiquette">Neuf avec étiquette</option>
                   <option value="Neuf sans étiquette">Neuf sans étiquette</option>
                   <option value="Très bon état">Très bon état</option>
                   <option value="Bon état">Bon état</option>
                   <option value="Satisfaisant">Satisfaisant</option>
                 </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Publier l'annonce
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
