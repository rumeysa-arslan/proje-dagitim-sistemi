'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '../../../components/Toast';
import DeveloperSkills from './components/DeveloperSkills';
import DeveloperTaskCard from './components/DeveloperTaskCard';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';
import ChangePasswordModal from '@/components/ChangePasswordModal';

export default function DeveloperDashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const isPending = (s: string) => ['TODO', 'PENDING', 'BEKLEMEDE', 'BEKLEYEN'].includes(s?.toUpperCase());
  const isInProgress = (s: string) => ['IN_PROGRESS', 'DEVAM EDIYOR'].includes(s?.toUpperCase());
  const isCompleted = (s: string) => ['DONE', 'COMPLETED', 'TAMAMLANDI'].includes(s?.toUpperCase());
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setCurrentUserId(parsedUser.id);
    fetchMyTasks(parsedUser.id);
  }, [router]);

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  const fetchMyTasks = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/developer/tasks?userId=${userId}`);
      if (res.ok) setTasks(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string, statusName: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      showToast(`Görev durumu "${statusName}" olarak güncellendi! 🎉`, 'success');
      fetchMyTasks(user.id);
    }
  };

  const handleSaveNote = async (taskId: string, comment: string) => {
    const res = await fetch(`/api/tasks/${taskId}/comment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment }),
    });
    if (res.ok) {
      showToast('Görev açıklaması güncellendi! 📝', 'success');
      fetchMyTasks(user.id);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.project?.title?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'TODO') matchesStatus = isPending(task.status);
    else if (statusFilter === 'IN_PROGRESS') matchesStatus = isInProgress(task.status);
    else if (statusFilter === 'DONE') matchesStatus = isCompleted(task.status);

    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingCount = tasks.filter((t) => isPending(t.status)).length;
  const inProgressCount = tasks.filter((t) => isInProgress(t.status)).length;
  const completedCount = tasks.filter((t) => isCompleted(t.status)).length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <Navbar user={user} onLogout={handleLogout} onChangePassword={() => setIsPasswordModalOpen(true)}/>

      <div className="max-w-5xl mx-auto space-y-6 px-4">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Yetenek Giriş Kartı */}
        <DeveloperSkills user={user} setUser={setUser} showToast={showToast} />

        {/* Başarı Çubuğu */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center text-sm font-bold text-gray-700">
            <span>🎯 {t('generalCompletionRate')}</span>
            <span className="text-green-600">%{completionPercentage}</span>
          </div>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-green-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Filtre ve Arama Barı */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100">
          
          {/* Sekme Butonları */}
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'ALL'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('all')} ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('TODO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'TODO'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              {t('pending')} ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              {t('inProgress')} ({inProgressCount})
            </button>
            <button
              onClick={() => setStatusFilter('DONE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'DONE'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              {t('completed')} ({completedCount})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Öncelik Filtresi */}
            <select
              value={priorityFilter}
              onChange={(e: any) => setPriorityFilter(e.target.value)}
              className="border rounded-lg px-2 py-1.5 text-xs text-gray-600 font-medium focus:outline-none bg-white"
            >
              <option value="ALL">{t('allPriorities')}</option>
              <option value="HIGH">{t('high')}</option>
              <option value="MEDIUM">{t('medium')}</option>
              <option value="LOW">{t('low')}</option>
            </select>

            {/* Arama Input */}
            <input
              type="text"
              placeholder={`🔍 ${t('skillsPlaceholder')}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-green-500 focus:outline-none w-full sm:w-48"
            />
          </div>
        </div>

        {/* Görev Listesi */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-xs text-gray-400 py-8">...</p>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-100">
              {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? '---'
                : '---'}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <DeveloperTaskCard
                key={task.id}
                task={task}
                user={user}
                onUpdateStatus={handleUpdateStatus as any}
                onSaveNote={handleSaveNote}
                isPending={isPending}
                isInProgress={isInProgress}
                isCompleted={isCompleted}
              />
            ))
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