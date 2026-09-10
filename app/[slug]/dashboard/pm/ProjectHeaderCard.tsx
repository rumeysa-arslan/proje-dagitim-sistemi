'use client';

import { useLanguage } from '@/context/LanguageContext';

interface Props {
  title?: string;
  description?: string;
  taskCount: number;
}

export default function ProjectHeaderCard({ title, description, taskCount }: Props) {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-600 mt-1">{description || 'Açıklama yok.'}</p>
      </div>
      <div className="text-right border-l pl-6">
        <span className="text-sm text-gray-500">{t('totalTask')}</span>
        <p className="text-2xl font-bold text-indigo-600">{taskCount}</p>
      </div>
    </div>
  );
}