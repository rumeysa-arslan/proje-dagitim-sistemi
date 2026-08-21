'use client';

import { useLanguage } from '@/context/LanguageContext';

interface Props {
  stats: any;
}

export default function AdminStats({ stats }: Props) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* 4 Özet Kart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs text-gray-500 font-semibold">{t('totalProject')}</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats?.overview?.totalProjects || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs text-gray-500 font-semibold">{t('totalTask')}</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats?.overview?.totalTasks || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs text-gray-500 font-semibold">{t('completedTask')}</span>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats?.overview?.completedTasks || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs text-gray-500 font-semibold">{t('ongoingTask')}</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats?.overview?.inProgressTasks || 0}</p>
        </div>
      </div>

      {/* Proje İlerleme Çubukları */}
      {stats && stats.projectStats?.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-800 text-base">📊 {t('projectCompletionStatus')}</h3>
          <div className="space-y-3">
            {stats.projectStats.map((p: any) => (
              <div key={p.id} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700">{p.title}</span>
                  <span className="text-indigo-600">%{p.percent} ({p.completedTasks}/{p.totalTasks} {t('tasks')})</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${p.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}