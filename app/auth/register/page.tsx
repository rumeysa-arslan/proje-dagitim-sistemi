'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('DEVELOPER');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Başvuru alınamadı.');

      setMessage({ type: 'success', text: data.message });
      setName('');
      setEmail('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white"> Hesap Başvurusu</h2>
          <p className="text-xs text-gray-500 mt-1">Bilgilerinizi doldurun, admin onayından sonra şifre linkiniz e-postanıza gelsin.</p>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 text-xs rounded-xl border ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Ad Soyad</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınız Soyadınız"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">E-Posta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@test.com"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="DEVELOPER">Yazılım Geliştirici (Developer)</option>
              <option value="PM">Proje Yöneticisi (PM)</option>
              <option value="ANALYST">Analyst (Sistem Analisti)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/auth/login" className="text-xs text-indigo-600 hover:underline">
            Zaten hesabınız var mı? Giriş Yapın
          </Link>
        </div>
      </div>
    </div>
  );
}