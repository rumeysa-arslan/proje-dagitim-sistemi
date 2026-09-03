'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedMascot from '@/components/AnimatedMascot';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFocusPassword, setIsFocusPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
      }

      localStorage.setItem('user', JSON.stringify(data.user));

      const role = data.user?.role;
      if (role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else if (role === 'PM') {
        router.push('/dashboard/pm');
      } else if (role === 'DEVELOPER') {
        router.push('/dashboard/developer');
      } else if (role === 'ANALYST') {
        router.push('/dashboard/analyst');
      }
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full space-y-4 border border-gray-100">
        {/* 🙈 ANİMASYONLU MASKOT */}
        <AnimatedMascot
          isFocusPassword={isFocusPassword}
        />

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Proje Dağıtım Portalı</h1>
          <p className="text-xs text-gray-500 mt-1">Lütfen hesabınıza giriş yapın</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">E-Posta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@test.com"
              className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Şifre</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsFocusPassword(true)}
              onBlur={() => setIsFocusPassword(false)}
              placeholder="••••••••"
              className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition duration-200 cursor-pointer shadow-md shadow-indigo-100 disabled:opacity-50"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>

          <div className="mt-6 text-center text-xs text-gray-500">
            Hesabınız yok mu?{' '}
            <Link
              href="/auth/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition"
            >
              Kayıt Başvurusu Yapın
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}