'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface ProjectCreateFormProps {
  user?: any;
  onProjectCreated: () => void;
}

export default function ProjectCreateForm({ user, onProjectCreated }: ProjectCreateFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const activeUserId = user?.id || JSON.parse(localStorage.getItem('user') || '{}')?.id;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          createdById: activeUserId,
        }),
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        onProjectCreated(); 
      } else {
        const errData = await res.json();
        alert(errData.message || 'Proje eklenemedi');
      }
    } catch (error) {
      console.error('Proje oluşturma hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">
        {t('newProjectCreate')}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
            {t('projectName')}
          </label>
          <input
            type="text"
            placeholder={t('projectNamePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
            {t('description')}
          </label>
          <textarea
            rows={4}
            placeholder={t('projectDescPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition cursor-pointer active:scale-98 shadow-xs"
        >
          {loading ? (t('creatingProject' as any) || 'Oluşturuluyor...') : (t('addProjectBtn' as any) || 'Proje Ekle')}
        </button>
      </form>
    </div>
  );
}