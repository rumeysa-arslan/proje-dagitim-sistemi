'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import InteractiveBarChart from '@/components/InteractiveBarChart';

// ApexCharts'ı SSR devre dışı olarak dinamik yüklüyoruz
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function AnalystDashboard() {
  const [activeTab, setActiveTab] = useState<'PM' | 'DEVELOPER'>('DEVELOPER');
  const [pms, setPms] = useState<any[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 5 Saniyelik Canlı Güncelleme Efekti
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [liveSeries, setLiveSeries] = useState<number[]>([1, 1, 1]);

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

  // Gerçek verileri al veya boşsa varsayılan ata
  const highCount = stats?.priorityDistribution?.find((p: any) => p.label.includes('HIGH'))?.count || 0;
  const medCount = stats?.priorityDistribution?.find((p: any) => p.label.includes('MEDIUM'))?.count || 0;
  const lowCount = stats?.priorityDistribution?.find((p: any) => p.label.includes('LOW'))?.count || 0;

  const actualSeries = (highCount === 0 && medCount === 0 && lowCount === 0)
    ? [0, 0, 0]
    : [highCount, medCount, lowCount];

  // 5 Saniye Boyunca Grafiği Oynatan Güncelleme Fonksiyonu
  const trigger3DRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    const interval = setInterval(() => {
      setLiveSeries([
        Math.floor(Math.random() * 50) + 10,
        Math.floor(Math.random() * 50) + 10,
        Math.floor(Math.random() * 50) + 10,
      ]);
    }, 400);

    setTimeout(() => {
      clearInterval(interval);
      setIsRefreshing(false);
      fetchData(activeTab, selectedPersonId);
    }, 5000);
  };

  // Flowbite ApexCharts Ayarları
  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'pie',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 400,
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
      fontFamily: 'Inter, sans-serif',
    },
    labels: ['Yüksek (High)', 'Orta (Medium)', 'Düşük (Low)'],
    colors: ['#1E40AF', '#3B82F6', '#93C5FD'], // Flowbite Mavi Tonları
    dataLabels: {
      enabled: true,
      formatter: function (val: any) {
        return Number(val).toFixed(1) + '%';
      },
      style: {
        fontSize: '12px',
        fontWeight: 600,
      },
      dropShadow: {
        enabled: false,
      },
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
      labels: {
        colors: '#64748b',
      },
      markers: {
        size: 6,
      },
    },
    stroke: {
      colors: ['#ffffff'],
      width: 2,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (value) {
          return value + ' Görev';
        },
      },
    },
  };

  const hasTasks = stats && stats.totalTasks > 0;
  const currentChartSeries = isRefreshing ? liveSeries : actualSeries;

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
              ? pms.map((p) => <option key={p.id} value={p.id}>{p.name} (PM)</option>)
              : developers.map((d) => <option key={d.id} value={d.id}>{d.name} (Dev)</option>)}
          </select>

          <button
            onClick={trigger3DRefresh}
            disabled={isRefreshing || !hasTasks}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition transform active:scale-95 ${
              !hasTasks
                ? 'bg-slate-400 cursor-not-allowed opacity-60'
                : isRefreshing
                ? 'bg-amber-500 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
            {isRefreshing ? 'Güncelleniyor (5s)...' : 'Grafiği Güncelle'}
          </button>
        </div>
      </div>

      {loading && !isRefreshing ? (
        <div className="py-24 text-center text-slate-400 font-medium">Analizler Hesaplanıyor...</div>
      ) : !hasTasks ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl">
            📭
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Henüz Kayıtlı Görev Verisi Yok</h3>
            <p className="text-xs text-slate-400 mt-1">
              Bu kullanıcı için atanmış aktif bir görev bulunamadı.
            </p>
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
                  <span className="text-2xl font-black text-amber-600 mt-1 block">{stats.avgCompletionHours} Saat</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block font-medium">Zamanında Teslim</span>
                  <span className="text-2xl font-black text-purple-600 mt-1 block">%{stats.onTimeRate}</span>
                </div>
              </div>

              {/* Flowbite Standart Kartı & Pie Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h5 className="text-base font-bold text-slate-800 dark:text-slate-100">Görev Öncelik Dağılımı</h5>
                      <p className="text-xs text-slate-400">Öncelik türüne göre pasta grafiği</p>
                    </div>
                    {isRefreshing && (
                      <span className="text-xs font-semibold text-blue-600 animate-pulse bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg">
                        Canlı Yenileniyor...
                      </span>
                    )}
                  </div>

                  {/* Flowbite ApexCharts Bileşeni */}
                  <div className="w-full flex justify-center items-center py-4 min-h-[300px]">
                    <Chart
                      options={chartOptions}
                      series={currentChartSeries}
                      type="pie"
                      width="100%"
                      height={320}
                    />
                  </div>
                </div>

                {/* Çeviklik Göstergesi Kartı */}
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
            <InteractiveBarChart data={stats.distributionChart || []} />

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">📁 Yönetilen Projeler ve İlerleme Yüzdeleri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.projectProgressList?.map((proj: any) => (
                <div key={proj.id} className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center text-xs font-bold">
                    <span className="truncate max-w-[180px]">{proj.title}</span>
                    <span className="text-blue-600">%{proj.percentage}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${proj.percentage}%` }}
                    />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>Tamamlanan: {proj.doneTasks}</span>
                    <span>Toplam: {proj.totalTasks} Görev</span>
                    </div>
                </div>
                ))}
            </div>
            </div>
        </div>
        )}
        </>
      )}
    </div>
  );
}