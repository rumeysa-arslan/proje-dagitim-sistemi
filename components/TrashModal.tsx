'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface TrashModalProps {
  trashType: 'tasks' | 'users' | 'projects';
  isOpen: boolean;
  projectId?: string;
  onClose: () => void;
  onRestoreSuccess?: () => void;
}
export default function TrashModal({
  projectId,
  trashType,
  isOpen,
  onClose,
  onRestoreSuccess,
}: TrashModalProps) {
  const { t } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Doğru API rotasını belirleme
  const getApiEndpoint = () => {
    if(trashType === 'tasks') return  `/api/trash/tasks?projectId=${projectId}`
    return `/api/trash/${trashType}`;
  };

  const fetchTrashItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiEndpoint());
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Çöp kutusu verisi alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTrashItems();
    }
  }, [isOpen, trashType, projectId]);

  // Geri Yükleme
  const handleRestore = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/trash/${trashType}/${id}`, { method: 'PATCH' });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        if (onRestoreSuccess) onRestoreSuccess();
      }
    } catch (err) {
      console.error('Geri yükleme hatası:', err);
    } finally {
      setActionId(null);
    }
  };

  // Kalıcı Silme
  const handlePermanentDelete = async (id: string) => {
    if (!confirm('Bu öğeyi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setActionId(id);
    try {
      const res = await fetch(`/api/trash/${trashType}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Kalıcı silme hatası:', err);
    } finally {
      setActionId(null);
    }
  };

  if (!isOpen) return null;

  // Başlıklar ve Açıklamalar
  const modalInfo = {
    users: {
      title: t('trashTitleUser'),
      desc: t('trashDescUser'),
      empty: t('trashEmptyUser'),
    },
    projects: {
      title: t('trashTitleProject'),
      desc: t('trashDescProject'),
      empty: t('trashEmptyProject'),
    },
    tasks: {
      title: t('trashTitleTask'),
      desc: ('trashDescTask'),
      empty: t('trashEmptyTask'),
    },
  };

  const currentInfo = modalInfo[trashType] || modalInfo.tasks;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Başlık Alanı */}
        <div className="p-5 px-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-xl shadow-xs">
              🗑️
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base">
                {currentInfo.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {currentInfo.desc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-200/60 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center font-bold text-sm transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Liste Alanı */}
        <div className="p-6 overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">{t('loading' as any) || 'Yükleniyor...'}</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl mb-3">
                ✨
              </div>
              <p className="text-sm font-bold text-gray-700">{t('trashEmptyTitle')}</p>
              <p className="text-xs text-gray-400 mt-1">{currentInfo.empty}</p>
            </div>
          ) : (
            items.map((item) => {
              const isProcessing = actionId === item.id;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100/70 rounded-2xl border border-gray-100 transition-all gap-4"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-gray-800 truncate">
                      {item.title || item.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 flex-wrap">
                      {item.project?.title && (
                        <span className="bg-white px-2 py-0.5 rounded-md border border-gray-100 font-medium text-gray-600">
                          📁 {item.project.title}
                        </span>
                      )}
                      {item.assignedTo?.name && (
                        <span>👤 {item.assignedTo.name}</span>
                      )}
                      {item.role && (
                        <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold text-[10px]">
                          {item.role}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleRestore(item.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>♻️</span>
                      <span>{t('restore' as any) || 'Geri Yükle'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handlePermanentDelete(item.id)}
                      className="px-3 py-1.5 bg-white hover:bg-red-50 disabled:opacity-50 text-red-600 hover:text-red-700 border border-gray-200 hover:border-red-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>💥</span>
                      <span>{t('permanentDelete' as any) || 'Kalıcı Sil'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Alt Bilgi & Kapat Butonu */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <span className="text-xs text-gray-400 font-medium">
            {items.length > 0 && `${items.length} ${t('itemsInTrash' as any) || 'öğe bulundu'}`}
          </span>
          
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-5 py-2 rounded-xl text-xs transition cursor-pointer shadow-xs"
          >
            {t('close' as any) || 'Kapat'}
          </button>
        </div>

      </div>
    </div>
  );
}