'use client';

import AnimatedTrashBtn from './AnimatedTrashBtn';
import TaskChat from './TaskChat';
import { useLanguage } from '@/context/LanguageContext';

interface TaskCardProps {
  task: any;
  user: any;
  openingLidTaskId: string | null;
  suckingTaskId: string | null;
  onDeleteTask: (id: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

export default function TaskCard({
  task,
  user,
  openingLidTaskId,
  suckingTaskId,
  onDeleteTask,
  getStatusBadge,
}: TaskCardProps) {
  const { t } = useLanguage();
  const isSucking = suckingTaskId === task.id;

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return t('low');
      case 'HIGH':
        return t('high');
      default:
        return t('medium');
    }
  };

  // Tarih Durumunu Hesaplama (Alarm & Çalar Saat Entegreli)
  const getDueDateBadge = (dueDateString: string, status: string) => {
    if (!dueDateString) return null;
    const formattedDate = new Date(dueDateString).toLocaleDateString();

    if (status === 'DONE' || status === 'COMPLETED') {
      return (
        <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
          📅 {formattedDate}
        </span>
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateString);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      // ⚠️ Gecikmiş (Animasyonlu Alarm Çalıyor)
      return (
        <span className="text-[11px] font-bold text-red-700 bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs">
          <span className="animate-alarm text-sm">⏰</span>
          <span>
            {t('dueDateLabel' as any) || 'Son Tarih'}: {formattedDate} ({Math.abs(diffDays)} {t('daysOverdue' as any) || 'gün gecikti'})
          </span>
        </span>
      );
    } else if (diffDays === 0) {
      // 🚨 Bugün son gün (Animasyonlu Alarm Çalıyor)
      return (
        <span className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs">
          <span className="animate-alarm text-sm">⏰</span>
          <span>
            {t('dueDateLabel' as any) || 'Son Tarih'}: {formattedDate} ({t('todayDue' as any) || 'Bugün son gün!'})
          </span>
        </span>
      );
    } else if (diffDays <= 3) {
      // ⏰ Son 3 gün kaldı (Sabit Çalar Saat Görünür)
      return (
        <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs">
          <span className="text-sm">⏰</span>
          <span>
            {t('dueDateLabel' as any) || 'Son Tarih'}: {formattedDate} ({diffDays} {t('daysLeft' as any) || 'gün kaldı'})
          </span>
        </span>
      );
    } else {
      // ⏳ Normal Durum (3 günden fazla - Standart Takvim/Saat)
      return (
        <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
          <span>📅</span>
          <span>
            {t('dueDateLabel' as any) || 'Son Tarih'}: {formattedDate} ({diffDays} {t('daysLeft' as any) || 'gün kaldı'})
          </span>
        </span>
      );
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 transition-all duration-500 origin-right ${
        isSucking ? 'scale-0 opacity-0 translate-x-12 -rotate-12 blur-xs' : 'scale-100 opacity-100'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-bold text-gray-800 text-base">{task.title}</h3>
            {/* ⏰ Dinamik Alarm ve Tarih Rozeti */}
            {getDueDateBadge(task.dueDate, task.status)}
          </div>
          <p className="text-xs text-gray-500">{task.description || '---'}</p>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(task.status)}
          <AnimatedTrashBtn
            onDelete={() => onDeleteTask(task.id)}
            title={t('permanentlyDelete')}
            isLidOpen={openingLidTaskId === task.id}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
        <span className="text-indigo-600 font-medium">
          👤 {task.assignedTo ? task.assignedTo.name : '---'}
        </span>
        <span className="font-bold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">
          {t('priorityDegree' as any) || 'Öncelik Derecesi'}: {getPriorityLabel(task.priority)}
        </span>
      </div>

      {user && <TaskChat taskId={task.id} currentUser={user} />}
    </div>
  );
}