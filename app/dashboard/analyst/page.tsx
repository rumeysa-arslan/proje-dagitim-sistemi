'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InteractiveBarChart from '@/components/InteractiveBarChart';
import StatusPieChart from '@/components/StatusPieChart';
import ProjectProgressList from '@/components/ProjectProgressList';
import Navbar from '@/components/Navbar';
import { useRef } from 'react';
import ExportPdfButton from '@/components/analyst/ExportPdfButton';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import { useLanguage } from '@/context/LanguageContext';


export default function AnalystDashboard() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'PM' | 'DEVELOPER'>('PM');
  const [pms, setPms] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

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
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setCurrentUser(parsedUser.id);
    fetchData(parsedUser.id);
    fetchData(activeTab);
  }, [activeTab]);

  const handlePersonChange = (id: string) => {
    setSelectedPersonId(id);
    fetchData(activeTab, id);
  };

  const hasTasks = stats && stats.totalTasks > 0;

    const handleLogout = () => {
    localStorage.clear();
    router.push('/auth/login');
  };

return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      
      {/* 1. ÜST BAR (Navbar) - Tam genişlikte ve en üstte sıfıra sıfır */}
        <Navbar user={user} onLogout={handleLogout} onChangePassword={() => setIsPasswordModalOpen(true)}/>
    
      {/* Sayfanın Geri Kalanı - İçeriklerin kenarlara yapışmasını engelleyen ana kapsayıcı */}
      <div className="px-4 pb-6 pt-2 space-y-8">        
        {/* 2. BAŞLIK VE KONTROLLER */}
        <div className="flex flex-col items-center justify-center space-y-5">          
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent pb-1">
              📊 {t('title')}
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">{t('subtitle')}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            
            <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <button
                onClick={() => { setActiveTab('PM'); setSelectedPersonId(''); }}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition whitespace-nowrap ${
                  activeTab === 'PM' ? 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                📁 {t('pmAnalysis')}
              </button>
              <button
                onClick={() => { setActiveTab('DEVELOPER'); setSelectedPersonId(''); }}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition whitespace-nowrap ${
                  activeTab === 'DEVELOPER' ? 'bg-emerald-50 dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                ⚡ {t('developerAnalysis')}
              </button>
            </div>

            <select
              value={selectedPersonId}
              onChange={(e) => handlePersonChange(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-sm rounded-xl px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px] cursor-pointer"
            >
              {activeTab === 'PM'
                ? pms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)
                : developers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>

            <div>
              <ExportPdfButton 
                stats={stats} 
                mode={activeTab} 
                selectedUserName={
                  activeTab === 'PM' 
                    ? pms.find((p) => p.id === selectedPersonId)?.name || 'PM' 
                    : developers.find((d) => d.id === selectedPersonId)?.name || 'Developer'
                } 
              />
            </div>

          </div>
        </div>

        {/* 3. RAPOR İÇERİĞİ - Tamamı ref={reportRef} içinde kalmalı ki PDF'e düzgün çıksın */}
        <div ref={reportRef} className="space-y-6">
          
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
                      <span className="text-xs text-slate-400 block font-medium">{t('totalTasks')}</span>
                      <span className="text-2xl font-black text-blue-600 mt-1 block">{stats.totalTasks}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <span className="text-xs text-slate-400 block font-medium">{t('completed')}</span>
                      <span className="text-2xl font-black text-emerald-600 mt-1 block">{stats.completedCount}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <span className="text-xs text-slate-400 block font-medium">{t('avgResolutionSpeed')}</span>
                      <span className="text-2xl font-black text-amber-600 mt-1 block">{stats.avgCompletionHours} </span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <span className="text-xs text-slate-400 block font-medium">{t('onTimeDelivery')}</span>
                      <div className="text-purple-600 font-bold text-2xl">
                        {stats.onTimeRate !== null ? `%${stats.onTimeRate}` : 'Tamamlanan Görev Yok'}
                      </div>
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
                      <h5 className="text-base font-bold text-slate-800 dark:text-slate-100">⚡{t('developerAnalysisCardTitle')}:</h5>
                      <div className="p-5 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-blue-800 dark:text-blue-300">💡{t('performanceNoteTitle')}:</span>
                        <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                          Seçili geliştirici görevleri ortalama {stats.avgCompletionHours} içerisinde tamamlamakta...
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
                      <span className="text-xs text-slate-400 block font-medium">{t('managedProjects')}</span>
                      <span className="text-2xl font-black text-indigo-600 mt-1 block">{stats.totalProjects}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <span className="text-xs text-slate-400 block font-medium">{t('totalTasksCreated')}</span>
                      <span className="text-2xl font-black text-blue-600 mt-1 block">{stats.totalTasks}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <span className="text-xs text-slate-400 block font-medium">{t('completedWorks')}</span>
                      <span className="text-2xl font-black text-emerald-600 mt-1 block">{stats.completedTasks}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <span className="text-xs text-slate-400 block font-medium">{t('projectProgressRate')}</span>
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
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userId={user?.id}
      />
    </div>
  );
}