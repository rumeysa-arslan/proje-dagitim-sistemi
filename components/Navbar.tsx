'use client';

import { useLanguage } from '@/context/LanguageContext';
import ThemeToggle from './ThemeToggle';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  user?: any;
  onLogout?: () => void;
  onChangePassword?: () => void;
}

export default function Navbar({ user, onLogout, onChangePassword }: NavbarProps) {
  const router = useRouter();
  const { lang, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-100 shadow-2xs mb-6">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* ⚡ Dinamik Çevirili Logo */}
        <div className="flex items-center gap-2 font-bold text-gray-800 text-base">
           <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{t('appName')}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Tema Değiştirici */}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-4">
          {/* Dil Değiştirici */}
          <div className="flex items-center gap-1 text-xs font-bold bg-gray-50 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setLanguage('tr')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                lang === 'tr' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              TR
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                lang === 'en' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('de')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                lang === 'de' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              DE
            </button>
          </div>

          {user && (
            <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
              <span className="text-xs text-gray-600 font-medium hidden sm:inline">
                {t('welcome')}, <strong className="text-indigo-600">{user.name}</strong>
              </span>

              {/*Şifre Değiştir Butonu */}
              {onChangePassword && (
                <button
                  type="button"
                  onClick={onChangePassword}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition cursor-pointer flex items-center gap-1"
                >
                   {t('password')}
                </button>
              )}

              {/* Çıkış Butonu */}
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    document.cookie = 'user_role=; path=/; max-age=0';
                    document.cookie = 'auth_token=; path=/; max-age=0';
                    localStorage.clear();
                    if (onLogout) onLogout();
                    router.push('/auth/login');
                  }}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                >
                  {t('logout')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}