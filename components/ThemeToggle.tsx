'use client';

import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative flex items-center w-14 h-7 px-1 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer transition-colors duration-300 focus:outline-none select-none shrink-0"
      title={isDark ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
    >
      <span className="absolute left-1.5 text-xs">☀️</span>
      <span className="absolute right-1.5 text-xs">🌙</span>
      <div
        className={`z-10 flex items-center justify-center w-5 h-5 bg-white dark:bg-slate-900 rounded-full shadow-md transform transition-transform duration-300 text-[10px] ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {isDark ? '🌙' : '☀️'}
      </div>
    </button>
  );
}