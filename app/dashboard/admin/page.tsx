'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserActionButtons from '@/components/UserActionButtons';
import FloatingTrashBtn from '@/components/FloatingTrashBtn';
import TrashModal from '@/components/TrashModal';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';

import AdminStats from '@/components/admin/AdminStats';
import UserCreateForm from '@/components/admin/UserCreateForm';
import UserDetailModal from '@/components/admin/UserDetailModal';

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [trashCount, setTrashCount] = useState<number>(0);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState<string | null>(null);

  const fetchTrashCount = async () => {
    try {
      const res = await fetch('/api/trash/users');
      if (res.ok) {
        const data = await res.json();
        setTrashCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      console.error('Çöp sayısı alınamadı:', err);
    }
  };

  const refreshData = async () => {
    try {
      const [uRes, sRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/stats'),
      ]);
      if (uRes.ok) setUsers(await uRes.json());
      if (sRes.ok) setStats(await sRes.json());
      fetchTrashCount();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return router.push('/auth/login');
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'ADMIN') return router.push('/auth/login');
    setCurrentUser(parsed);
    refreshData();
  }, [router]);

  const handleOpenDetail = (userId: string) => {
    setIsModalOpen(true);
    const existingUser = users.find((u) => u.id === userId);
    if (existingUser) {
      setSelectedUser(existingUser);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        fetchTrashCount();
      }
    } catch (error) {
      console.error('Kullanıcı silinemedi:', error);
    }
  };

  // 🔔 Onaylama & Reddetme Fonksiyonu
  const handleRequestAction = async (userId: string, action: 'APPROVE' | 'REJECT') => {
    setRequestLoading(userId);
    try {
      const res = await fetch(`/api/admin/requests/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'İşlem başarısız');
      alert(data.message);
      refreshData();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setRequestLoading(null);
    }
  };

  const pendingUsers = users.filter((u) => u.approvalStatus === 'PENDING');
  const activeUsers = users.filter((u) => u.approvalStatus !== 'PENDING');
  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <Navbar
        user={currentUser}
        onLogout={() => {
          localStorage.clear();
          router.push('/auth/login');
        }}
      />

      <div className="max-w-6xl mx-auto space-y-6 px-4">
        {/* İstatistik Kartları */}
        <AdminStats stats={stats} />

        {/* 🔔 ONay BEKLEYEN KAYIT TALEPLERİ ALANI */}
        {pendingUsers.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                ⏳ {t('pendingRequestsTitle')} ({pendingUsers.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingUsers.map((pUser) => (
                <div
                  key={pUser.id}
                  className="bg-white border border-amber-100 p-3.5 rounded-xl flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <div className="text-sm font-bold text-gray-800">{pUser.name}</div>
                    <div className="text-xs text-gray-500">{pUser.email}</div>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {pUser.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={requestLoading === pUser.id}
                      onClick={() => handleRequestAction(pUser.id, 'APPROVE')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                      {requestLoading === pUser.id ? '...' : `✅ ${t('approveBtn')}`}
                    </button>
                    <button
                      type="button"
                      disabled={requestLoading === pUser.id}
                      onClick={() => handleRequestAction(pUser.id, 'REJECT')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition disabled:opacity-50 cursor-pointer"
                    >
                      ❌ {t('rejectBtn')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sol Kolon: Form */}
          <UserCreateForm onUserCreated={refreshData} />

          {/* Sağ Kolon: Kullanıcı Tablosu */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">
              {t('userList')} ({activeUsers.length})
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
                    <th className="p-4">{t('userHeader')}</th>
                    <th className="p-4">{t('roleHeader')}</th>
                    <th className="p-4 text-right">{t('actionHeader')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {activeUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </td>
                      <td className="p-4 font-bold text-xs">{u.role}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDetail(u.id)}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                          >
                            {t('details')}
                          </button>
                          <UserActionButtons
                            user={u}
                            onToggleActive={refreshData}
                            onDeleteUser={handleDeleteUser}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <UserDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedUser={selectedUser}
        loading={detailLoading}
      />

      {/* 🔴 Çöp Kutusu Butonu */}
      <FloatingTrashBtn onClick={() => setIsTrashOpen(true)} count={trashCount} />

      {/* 🗑️ Kullanıcı Çöp Kutusu Modalı */}
      <TrashModal
        isOpen={isTrashOpen}
        onClose={() => {
          setIsTrashOpen(false);
          fetchTrashCount();
        }}
        trashType="users"
        onRestoreSuccess={() => {
          refreshData();
          fetchTrashCount();
        }}
      />
    </div>
  );
}