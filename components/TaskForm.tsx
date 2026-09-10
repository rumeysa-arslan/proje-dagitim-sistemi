'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export interface IDev {
  id: string;
  name: string;
  email: string;
  skills?: any[];
  isActive: boolean;
  tasks?: { id: string; status: string }[];
}

interface TaskFormProps {
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  priority: string;
  setPriority: (val: string) => void;
  assignedToId: string;
  setAssignedToId: (val: string) => void;
  dueDate: string;
  setDueDate: (val: string) => void;
  developers: IDev[];
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
}

export default function TaskForm({
  title,
  setTitle,
  description,
  setDescription,
  priority,
  setPriority,
  assignedToId,
  setAssignedToId,
  dueDate,
  setDueDate,
  developers,
  onSubmit,
  loading = false,
}: TaskFormProps) {
  const { t } = useLanguage();
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);

  // Seçilen geliştiriciyi bul
  const selectedDev = developers.find((d) => d.id === assignedToId);

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6 self-start h-fit">
        <h3 className="font-bold text-gray-800 text-base mb-4 pb-2 border-b border-gray-100">
          {t('assignNewTask') || 'Yeni Görev Ata'}
        </h3>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Görev Adı */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {t('taskName') || 'Görev Adı'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('taskTitlePlaceholder')}
              className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white transition"
            />
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {t('description' as any) || 'Açıklama'}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('taskDescPlaceholder')}
              className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white transition"
            />
          </div>

          {/* Öncelik Derecesi */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {t('priorityDegree' as any) || 'Öncelik Derecesi'}
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white transition"
            >
              <option value="LOW">{t('low' as any) || 'Düşük'}</option>
              <option value="MEDIUM">{t('medium' as any) || 'Orta'}</option>
              <option value="HIGH">{t('high' as any) || 'Yüksek'}</option>
            </select>
          </div>

          {/* 📅 Son Teslim Tarihi */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              📅 {t('dueDate' as any) || 'Son Teslim Tarihi'}
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white transition"
            />
          </div>

          {/*Geliştirici Seçim Butonu */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {t('developerAssignment' as any) || 'Geliştirici Atama'}
            </label>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDevModalOpen(true)}
                className={`flex-1 border py-3 px-4 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                  selectedDev
                    ? 'border-indigo-300 bg-indigo-50/70 text-indigo-700 font-semibold'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span>{selectedDev ? `👤 ${selectedDev.name}` : (t('selectDeveloper' as any) || 'Geliştirici Seç')}</span>
                <span className="text-gray-400 text-xs">▼</span>
              </button>

              {assignedToId && (
                <button
                  type="button"
                  onClick={() => setAssignedToId('')}
                  title="Seçimi Kaldır"
                  className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 text-xs px-3.5 py-3 rounded-xl transition cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Görevi Oluştur Butonu */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-xs transition duration-200 cursor-pointer disabled:opacity-50 shadow-sm shadow-indigo-100 mt-2"
          >
            {loading ? 'Ekleniyor...' : t('createTask' as any) || 'Görevi Oluştur'}
          </button>
        </form>
      </div>

      {/* 📋 GELİŞTİRİCİ SEÇİM TABLOSU (MODAL) */}
      {isDevModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
            
            {/* Modal Başlık */}
            <div className="p-4 px-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/60">
              <div>
                <h3 className="font-bold text-gray-800 text-base">{t('developerListTitle')}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{t('developerListSub')}</p>
              </div>
              <button
                onClick={() => setIsDevModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 rounded-lg transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tablo Alanı */}
            <div className="p-6 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-400 font-semibold uppercase">
                    <th className="pb-3 px-4">{t('developerCol')}</th>
                    <th className="pb-3 px-4">{t('skillsCol')}</th>
                    <th className="pb-3 px-4 text-center">{t('activeTasksCol')}</th>
                    <th className="pb-3 px-4 text-center">{t('statusCol')}</th>
                    <th className="pb-3 px-4 text-right">{t('actionCol')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {developers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400 text-xs">
                        {t('noDevelopersFound')}
                      </td>
                    </tr>
                  ) : (
                    developers.map((dev) => {
                      const activeTaskCount =
                        dev.tasks?.filter((tsk) => tsk.status !== 'DONE' && tsk.status !== 'COMPLETED').length || 0;
                      const isSelected = assignedToId === dev.id;
                      const isPassive = dev.isActive === false;
                      const skills = dev.skills ;

                     // console.log(skills1);
                      return (
                        <tr
                          key={dev.id}
                          className={`transition ${
                            isPassive
                              ? 'bg-gray-50/80 opacity-50 cursor-not-allowed'
                              : isSelected
                              ? 'bg-indigo-50/80'
                              : 'hover:bg-gray-50/80'
                          }`}
                        >
                          {/* İsim & E-Posta */}
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-gray-800 text-xs">{dev.name}</p>
                            <p className="text-[11px] text-gray-400">{dev.email}</p>
                          </td>

                          {/* Yetenekler */}
                          <td className="py-3.5 px-4 max-w-[250px]">
                            <div className="flex flex-wrap gap-2 text-[11px] text-gray-700">
                              {skills?.map((s, index) => {
                                let emoji = "🔹";
                                const level = s?.level?.toUpperCase();
                                
                                if (level === "LOW" ) emoji = "😩";
                                else if (level === "MEDIUM" ) emoji = "😌";
                                else if (level === "HIGH" ) emoji = "🥳";

                                return (
                                  <span 
                                    key={index} 
                                    className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-md whitespace-nowrap"
                                  >
                                    {s?.text} {emoji}
                                  </span>
                                );
                              }) || <span className="bg-gray-100 px-2.5 py-1 rounded-md">---</span>}
                            </div>
                          </td>

                          {/* Aktif Görev */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md text-[11px]">
                              {activeTaskCount} Görev
                            </span>
                          </td>

                          {/* Aktif / Pasif */}
                          <td className="py-3.5 px-4 text-center">
                            {isPassive ? (
                              <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
                                {t('passiveStatus')}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                                {t('activeStatus')}
                              </span>
                            )}
                          </td>

                          {/* Seç Butonu (Modalı kapatmaz, tıklandığında yeşil tik olur, tekrar tıklanırsa veya başkası seçilirse anında güncellenir) */}
                          <td className="py-3.5 px-4 text-right">
                            {isPassive ? (
                              <span className="text-[11px] text-gray-400 font-medium italic">
                                {t('cannotSelect')}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  // Seçiliyse seçimi kaldır, değilse bu kişiyi seç
                                  setAssignedToId(isSelected ? '' : dev.id);
                                }}
                                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                                }`}
                              >
                                {isSelected ? t('selectedBtn') : t('selectBtn')}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Alt Kısım */}
            <div className="p-4 px-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDevModalOpen(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                {t('completeBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}