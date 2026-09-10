'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import AnimatedTrashBtn from './AnimatedTrashBtn';

interface Props {
  user: {
    id: string;
    name?: string;
    isActive: boolean;
  };
  onToggleActive?: () => void;
  onDeleteUser?: (id: string) => void;
}

export default function UserActionButtons({ user, onToggleActive, onDeleteUser }: Props) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // 1. Durum Değiştirme (Aktif / Pasif)
  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Durum güncellenemedi');
      }

      if (onToggleActive) {
        onToggleActive();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Kullanıcı durumu güncellenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  //  Şifre Sıfırlama 
  const handleResetPassword = async () => {
    const promptMessage = `${user.name || ''} ${t('passwordResetPrompt')}`;
    const newPassword = prompt(promptMessage);

    if (!newPassword) return; 
    if (newPassword.trim().length < 6) {
      alert(t('passwordMinLengthError'));
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPassword.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');

      alert(`✅ ${t('passwordUpdatedSuccess')}`);
    } catch (err: any) {
      console.error(err);
      alert('Hata: ' + err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={resetLoading}
        onClick={handleResetPassword}
        className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 disabled:opacity-50"
        title="Şifre Sıfırla"
      >
        {resetLoading ? '...' : `${t('password')}`}
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={handleToggle}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer disabled:opacity-50 ${
          user.isActive
            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
        }`}
      >
        {loading ? '...' : user.isActive ? t('deactivate') : t('activate')}
      </button>

      {onDeleteUser && (
        <AnimatedTrashBtn
          onDelete={() => onDeleteUser(user.id)}
          title={t('permanentlyDelete' as any) || 'Sil'}
        />
      )}
    </div>
  );
}