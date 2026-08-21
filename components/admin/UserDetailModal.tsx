'use client';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: any;
  loading?: boolean;
}

export default function UserDetailModal({
  isOpen,
  onClose,
  selectedUser,
  loading = false,
}: UserDetailModalProps) {
  if (!isOpen) return null;

  const parseSkills = (userData: any): string[] => {
    if (!userData) return [];

    const raw =
      userData.skills ??
      userData.technologies ??
      userData.skillsList ??
      userData.skillSet;

    if (!raw) return [];

    if (Array.isArray(raw)) {
      return raw
        .map((item: any) =>
          typeof item === 'object' && item !== null
            ? item.name || item.title || item.label || ''
            : String(item)
        )
        .filter((s: string) => s.trim() !== '');
    }

    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) return [];

      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed
              .map((item: any) =>
                typeof item === 'object' && item !== null
                  ? item.name || item.title || ''
                  : String(item)
              )
              .filter((s: string) => s.trim() !== '');
          }
        } catch {
        }
      }
      return trimmed
        .replace(/[\[\]"']/g, '')
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
    }

    return [];
  };

  const skillsList = parseSkills(selectedUser);
  const isPM = selectedUser?.role?.toUpperCase() === 'PM';
  const userProjects = selectedUser?.projects || selectedUser?.managedProjects || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Başlık Barı */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white capitalize">
              {selectedUser?.name || 'Kullanıcı Detayları'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{selectedUser?.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal İçeriği */}
        <div className="p-6 space-y-4 text-xs">
          {loading ? (
            <div className="py-8 text-center text-slate-400 font-medium animate-pulse">
              Yükleniyor...
            </div>
          ) : !selectedUser ? (
            <div className="py-8 text-center text-slate-400">
              Kullanıcı bilgisi bulunamadı.
            </div>
          ) : (
            <>
              {/* Rol & Durum Kartları */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Kullanıcı Rolü</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase">
                    {selectedUser.role || 'BELİRTİLMEDİ'}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Hesap Durumu</span>
                  <span className={`font-bold text-sm ${selectedUser.isActive !== false ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedUser.isActive !== false ? '● Aktif' : '○ Pasif'}
                  </span>
                </div>
              </div>

              {/* PM İse Yönettiği Projeler, Developer İse Yetenekler */}
              {isPM ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      📁 Yönettiği Projeler
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                      {userProjects.length}
                    </span>
                  </div>

                  {userProjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {userProjects.map((proj: any) => (
                        <span
                          key={proj.id}
                          className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 text-xs px-2.5 py-1 rounded-md font-medium"
                        >
                          {proj.name || proj.title}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Henüz atanmış/yönettiği bir proje yok.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      ⚡ Uzmanlık & Yetenekler
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      {skillsList.length}
                    </span>
                  </div>

                  {skillsList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skillsList.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs px-2.5 py-1 rounded-md font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Henüz bir yetenek eklenmemiş.</p>
                  )}
                </div>
              )}

              {/* Kayıt Tarihi */}
              {selectedUser.createdAt && (
                <div className="pt-3 text-slate-400 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span>Kayıt Tarihi:</span>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {new Date(selectedUser.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Alt Kapat Butonu */}
        <div className="bg-slate-50 dark:bg-slate-950/40 px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-xl transition cursor-pointer text-xs"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}