'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/superadmin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
      }
      localStorage.setItem('superadmin', JSON.stringify(data.superAdmin));
      router.push('/superadmin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }

  };

return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-6 border border-slate-700">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-wider">SİSTEM YÖNETİMİ</h1>
          <p className="text-sm text-slate-400 mt-2">Sadece Yetkili Personel</p>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-200 text-sm p-3 rounded-lg border border-red-800 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Kurucu E-Posta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="admin@sistem.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Şifre</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition duration-200 shadow-lg disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? 'Doğrulanıyor...' : 'Sisteme Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}