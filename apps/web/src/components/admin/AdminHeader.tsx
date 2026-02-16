'use client';

import { useAuth } from '@/context/auth';

export function AdminHeader() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold text-gray-800">Administration</h2>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Connecté en tant que <span className="font-bold">{user?.email}</span> (ADMIN)
        </span>
        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
          A
        </div>
      </div>
    </header>
  );
}
