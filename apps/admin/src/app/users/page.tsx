/**
 * AUDIT DOC (Admin > Users):
 * - Liste lecture seule des utilisateurs (id, email, role).
 */
'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

type UserRow = { id: string; email: string; role: string; createdAt?: string };

export default function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);

  useEffect(() => {
    fetch(`${API}/users`).then((r) => r.json()).then(setRows).catch(() => setRows([]));
  }, []);

  return (
    <section>
      <h2>Users</h2>
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
