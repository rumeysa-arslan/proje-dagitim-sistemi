'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import TaskChat from '@/components/TaskChat';
import { Fireworks } from 'fireworks-js';
import confetti from 'canvas-confetti';

interface DeveloperTaskCardProps {
  task: any;
  user: any;
  onUpdateStatus: (taskId: string, newStatus: string, label?: string) => void;
  onSaveNote?: (taskId: string, comment: string) => Promise<void> | void;
  isToDo: (status: string) => boolean;
  isInProgress: (status: string) => boolean;
  isDone: (status: string) => boolean;
  onStatusChange?: (taskId: string, newStatus: string) => void;
}

export default function DeveloperTaskCard({
  task,
  user,
  onUpdateStatus,
  isToDo,
  isInProgress,
  isDone,
}: DeveloperTaskCardProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [isRinging, setIsRinging] = useState(false);

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return t('high' as any) || 'Yüksek';
      case 'LOW':
        return t('low' as any) || 'Düşük';
      default:
        return t('medium' as any) || 'Orta';
    }
  };

  // 🎆 Koyu Modda 360° Gerçek Neon Havai Fişek / Açık Modda Konfeti
const triggerCelebration = () => {
    const isDark = theme === 'dark' || document.documentElement.classList.contains('dark');

    if (isDark) {
      // 🎆 1. Havai Fişek için geçici bir kapsayıcı div oluştur
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100vw';
      container.style.height = '100vh';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '999999';
      document.body.appendChild(container);

      // 🎆 2. Gerçek Neon Havai Fişek Motorunu Başlat
      const fireworks = new Fireworks(container, {
        autoresize: true,
        opacity: 0.5,
        acceleration: 1.05,
        friction: 0.97,
        gravity: 1.5,
        particles: 80,
        traceLength: 4,      // Roketin arkasında bıraktığı ışık çizgisi
        traceSpeed: 10,
        explosion: 6,        // Patlama büyüklüğü
        intensity: 35,       // Sıklık
        flickering: 50,
        lineStyle: 'round',
        hue: {
          min: 0,
          max: 360,          // Canlı neon renk geçişleri
        },
        delay: {
          min: 20,
          max: 40,
        },
        rocketsPoint: {
          min: 30,
          max: 70,
        },
      });

      fireworks.start();

      // 🎆 3. 3 saniye sonra durdur ve ekrandan temizle
      setTimeout(() => {
        fireworks.stop();
        setTimeout(() => {
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
        }, 1000);
      }, 3000);

    } else {
      // ☀️ Gündüz modunda klasik renkli konfeti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        zIndex: 99999,
      });
    }
  };

  const handleMouseEnter = () => {
    if (!isRinging) {
      setIsRinging(true);
      setTimeout(() => setIsRinging(false), 1200);
    }
  };

  const renderDueDateBadge = () => {
    if (!task.dueDate) return null;
    const formattedDate = new Date(task.dueDate).toLocaleDateString('tr-TR');

    if (isDone(task.status)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          <span>📅</span> {t('dueDateLabel' as any) || 'Son Tarih'}: {formattedDate}
        </span>
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isDueTodayOrOverdue = diffDays <= 0;
    const isUrgent = diffDays > 0 && diffDays <= 3;

    return (
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold border transition-all duration-300 ${
          isDueTodayOrOverdue
            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-xs'
            : isUrgent
            ? 'bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
        }`}
      >
        <span>
          {t('dueDateLabel' as any) || 'Son Tarih'}: {formattedDate} (
          {diffDays === 0
            ? (t('todayDue' as any) || 'Bugün son gün!')
            : diffDays < 0
            ? `${Math.abs(diffDays)} gün gecikti!`
            : `${diffDays} gün kaldı`}
          )
        </span>

        {(isDueTodayOrOverdue || isUrgent) && (
          <div
            className={`transition-all duration-200 ${
              isRinging ? 'animate-bounce text-amber-600 dark:text-amber-400 scale-125 rotate-12' : 'text-amber-500 scale-100 rotate-0'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-xs"
            >
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2 2" />
              <path d="M5 3 2 6" />
              <path d="m22 6-3-3" />
              <path d="M6.38 18.7 4 21" />
              <path d="M17.64 18.67 20 21" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    if (isDone(status)) {
      return (
        <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs px-3 py-1 rounded-full font-bold">
          ✓ {t('completed' as any) || 'Tamamlandı'}
        </span>
      );
    }
    if (isInProgress(status)) {
      return (
        <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs px-3 py-1 rounded-full font-bold">
          ⏳ {t('inProgress' as any) || 'Devam Ediyor'}
        </span>
      );
    }
    return (
      <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs px-3 py-1 rounded-full font-bold">
        ⏱️ {t('pending' as any) || 'Beklemede'}
      </span>
    );
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 border border-slate-200/80 dark:border-slate-800 p-6 space-y-4"
    >
      {/* Üst Bilgi Barı */}
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 px-3 py-1 rounded-full">
              📁 {t('projectLabel' as any) || 'Proje'}: {task.project?.title || '---'}
            </span>
            {renderDueDateBadge()}
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{task.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{task.description || '---'}</p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {getStatusBadge(task.status)}
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${
              task.priority === 'HIGH'
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800'
                : task.priority === 'LOW'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800'
            }`}
          >
            🎯 {getPriorityLabel(task.priority)}
          </span>
        </div>
      </div>

      {/* Tarih ve Durum Butonları */}
      <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="text-slate-400 text-xs font-medium">
          🗓️ {t('createdDate' as any) || 'Oluşturulma'}: {new Date(task.createdAt).toLocaleDateString('tr-TR')}
        </span>

        <div className="flex gap-2">
          {isToDo(task.status) && (
            <button
              onClick={() => onUpdateStatus(task.id, 'IN_PROGRESS', t('inProgress' as any) || 'Devam Ediyor')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-xs cursor-pointer active:scale-95"
            >
              ▶ {t('startTask' as any) || 'Görevi Başlat'}
            </button>
          )}

          {isInProgress(task.status) && (
            <button
              onClick={() => {
                triggerCelebration();
                onUpdateStatus(task.id, 'DONE', t('completed' as any) || 'Tamamlandı');
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-xs cursor-pointer active:scale-95"
            >
              ✓ {t('completeTask' as any) || 'Görevi Tamamla'}
            </button>
          )}

          {isDone(task.status) && (
            <button
              onClick={() => onUpdateStatus(task.id, 'IN_PROGRESS', t('inProgress' as any) || 'Devam Ediyor')}
              className="bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer"
            >
              🔄 {t('reopen' as any) || 'Yeniden Aç'}
            </button>
          )}
        </div>
      </div>

      {/* Canlı Chat */}
      {user && <TaskChat taskId={task.id} currentUser={user} />}
    </div>
  );
}