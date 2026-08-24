'use client';

import React, { useState, useEffect } from 'react';
import InteractiveBarChart from '@/components/InteractiveBarChart';
import StatusPieChart from '@/components/StatusPieChart';
import ProjectProgressList from '@/components/ProjectProgressList';

export default function AnalystDashboard() {
  const [activeTab, setActiveTab] = useState<'PM' | 'DEVELOPER'>('DEVELOPER');
  const [pms, setPms] = useState<any[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async (type: 'PM' | 'DEVELOPER', id?: string) => {
    setLoading(true);
    try {
      const url = id ? `/api/analyst/stats?type=${type}&id=${id}` : `/api/analyst/stats?type=${type}`;
      const res = await fetch(url);
      const data = await res.json();

      setPms(data.pms || []);
      setDevelopers(data.developers || []);
      setStats(data.stats);

      if (!id) {
        if (type === 'PM' && data.pms?.length > 0) setSelectedPersonId(data.pms[0].id);
        if (type === 'DEVELOPER' && data.developers?.length > 0) setSelectedPersonId(data.developers[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const handlePersonChange = (id: string) => {
    setSelectedPersonId(id);
    fetchData(activeTab, id);
  };

  const hasTasks = stats && stats.totalTasks > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 space-y-6 text-slate-800 dark:text-slate-100 font-sans">
      {/* Üst Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            📊 Sistem Performans & Analiz Paneli
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Süreç hızı, iş yükü adaleti ve tamamlama metrikleri</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab('PM'); setSelectedPersonId(''); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'PM' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              📁 PM Analizi
            </button>
            <button
              onClick={() => { setActiveTab('DEVELOPER'); setSelectedPersonId(''); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'DEVELOPER' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              ⚡ Developer Analizi
            </button>
          </div>

          <select
            value={selectedPersonId}
            onChange={(e) => handlePersonChange(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-hidden"
          >
            {activeTab === 'PM'
              ? pms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)
              : developers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400 font-medium">Analizler Hesaplanıyor...</div>
      ) : !hasTasks ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl">📭</div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Henüz Kayıtlı Görev Verisi Yok</h3>
            <p className="text-xs text-slate-400 mt-1">Bu kullanıcı için atanmış aktif bir görev bulunamadı.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Developer Görünümü */}
          {activeTab === 'DEVELOPER' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block font-medium">Toplam Görev</span>
                  <span className="text-2xl font-black text-blue-600 mt-1 block">{stats.totalTasks}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block font-medium">Tamamlanan</span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">{stats.completedCount}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block font-medium">Ortalama Çözüm Hızı</span>
                  <span className="text-2xl font-black text-amber-600 mt-1 block">{stats.avgCompletionHours} </span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block font-medium">Zamanında Teslim</span>
                  <span className="text-2xl font-black text-purple-600 mt-1 block">%{stats.onTimeRate}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pasta Grafik Bileşeni */}
                <StatusPieChart
                  todoCount={stats.todoCount}
                  inProgressCount={stats.inProgressCount}
                  completedCount={stats.completedCount}
                  priorities={stats.prioritiesByStatus}
                />

                {/* Çeviklik Notu */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6 flex flex-col justify-center space-y-4">
                  <h5 className="text-base font-bold text-slate-800 dark:text-slate-100">⚡ Geliştirici Analizi</h5>
                  <div className="p-5 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-300">💡 Performans Notu:</span>
                    <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                      Seçili geliştirici görevleri ortalama <b>{stats.avgCompletionHours} saat</b> içerisinde tamamlamakta ve işlerini <b>%{stats.onTimeRate}</b> oranında teslim tarihinden önce bitirmektedir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PM Görünümü */}
          {activeTab === 'PM' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block font-medium">Yönetilen Projeler</span>
                  <span className="text-2xl font-black text-indigo-600 mt-1 block">{stats.totalProjects}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block font-medium">Açılan Toplam Görev</span>
                  <span className="text-2xl font-black text-blue-600 mt-1 block">{stats.totalTasks}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block font-medium">Tamamlanan İşler</span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">{stats.completedTasks}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block font-medium">Proje İlerleme Oranı</span>
                  <span className="text-2xl font-black text-purple-600 mt-1 block">%{stats.overallCompletionRate}</span>
                </div>
              </div>

              {/* Çubuk Grafiği Bileşeni */}
              <InteractiveBarChart data={stats.distributionChart || []} />

              {/* Proje İlerleme Listesi Bileşeni */}
              <ProjectProgressList projects={stats.projectProgressList || []} />
            </div>
          )}
        </>
      )}
    </div>
  );
}