'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';
import FloatingTrashBtn from '@/components/FloatingTrashBtn';
import TrashModal from '@/components/TrashModal';
import TaskForm from '@/components/TaskForm';
import DevModal from '@/components/pm/DevModal';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';

import ProjectHeaderCard from '@/components/pm/ProjectHeaderCard';
import ProjectTaskList from '@/components/pm/ProjectTaskList';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useLanguage();
  const { id: projectId } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [openingLidTaskId, setOpeningLidTaskId] = useState<string | null>(null);
  const [deletingTaskId, setdeletingTaskId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignedToId, setAssignedToId] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);

  const [dueDate, setDueDate] = useState('');
  const [trashCount, setTrashCount] = useState(0);

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  useEffect(() => {
    if (projectId) {
    fetchTrashCount();
  }
    const userData = localStorage.getItem('user');
    if (!userData) return router.push('/auth/login');

    setUser(JSON.parse(userData));
    fetchProjectDetail();
    fetchDevelopers();
  }, [projectId]);

  const fetchProjectDetail = async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    if (res.ok) setProject(await res.json());
  };

  const fetchDevelopers = async () => {
    try{    
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        const devs = data.filter(
          (u:any) => u.role?.toUpperCase() ==='DEVELOPER' && !u.deletedAt
        );
        setDevelopers(devs);
      }
    }catch (err) {
      console.error('Geliştiriciler alınamadı:' , err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  try{
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        description, 
        priority, 
        projectId, 
        assignedToId: assignedToId || null,
        dueDate: dueDate? new Date(dueDate).toISOString():null,
      }),
    });

    const data = await res.json();

      if (res.ok) {
        setTitle('');
        setDescription('');
        setAssignedToId('');
        setDueDate('');
        showToast('Görev oluşturuldu! 🎉', 'success');
        fetchProjectDetail();
      } else {
        console.error('Görev oluşturma hatası:', data);
        showToast(data.message || 'Görev oluşturulamadı!', 'error');
      }
    } catch (err: any) {
      console.error('İstek hatası:', err);
      showToast('Bağlantı hatası oluştu!', 'error');
    } finally {
      setLoading(false);
    }
  };

    const fetchTrashCount = async () => {
    try {
      const res = await fetch(`/api/trash/tasks?projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setTrashCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error('Çöp sayısı alınamadı:', error);
    }
  };

    const handleDeleteTask = async (taskId: string) => {
      try {
        setOpeningLidTaskId(taskId);
        setTimeout(() => {
          setdeletingTaskId(taskId);
        }, 300);

        const res = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId }),
        });

        if (res.ok) {
          fetchProjectDetail();
          fetchTrashCount();
          setTimeout(() => {
            setProject((prev: any) => {
              if (!prev) return prev;
              return {
                ...prev,
                tasks: prev.tasks.filter((t: any) => t.id !== taskId),
              };
            });

            setOpeningLidTaskId(null);
            setdeletingTaskId(null);

            showToast('Görev çöp kutusuna taşındı! 🗑️', 'success');
            
          }, 600);
        } else {
          showToast('Görev silinirken hata oluştu!', 'error');
          setOpeningLidTaskId(null);
          setdeletingTaskId(null);
        }
      } catch (error) {
        console.error(error);
        showToast('Bağlantı hatası!', 'error');
        setOpeningLidTaskId(null);
        setdeletingTaskId(null);
      }
    };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DONE':
        return <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-semibold">{t('completed')}</span>;
      case 'IN_PROGRESS':
        return <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold">{t('inProgress')}</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-700 text-xs px-2.5 py-1 rounded-full font-semibold">{t('pending')}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12 overflow-hidden relative">
      {/* ⚡ Dil Seçeneği Üst Bar */}
      <Navbar user={user} onLogout={handleLogout} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-5xl mx-auto space-y-6 px-4">
        {/* ⚡ GERİ DÖN BUTONU */}
        <button
          type="button"
          onClick={() => router.push('/dashboard/pm')}
          className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
        >
          {t('backToHome')}
        </button>

        {/* Proje Başlık ve Özet Kartı */}
        <ProjectHeaderCard
          title={project?.title}
          description={project?.description}
          taskCount={project?.tasks?.length || 0}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sol Kolon: TaskForm Bileşeni */}
        <TaskForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          priority={priority}
          setPriority={setPriority}
          assignedToId={assignedToId}
          setAssignedToId={setAssignedToId}
          dueDate={dueDate} 
          setDueDate={setDueDate} 
          developers={developers}
          onSubmit={handleCreateTask}
          
        />

          {/* Sağ Kolon: Görev Listesi Bileşeni */}
          <ProjectTaskList
            tasks={project?.tasks}
            user={user}
            openingLidTaskId={openingLidTaskId}
            deletingTaskId={deletingTaskId}
            onDeleteTask={handleDeleteTask}
            getStatusBadge={getStatusBadge}
          />
        </div>
      </div>

      <DevModal
        isOpen={isDevModalOpen}
        developers={developers.filter((dev) =>dev.role === 'DEVELOPER')}
        assignedToId={assignedToId}
        onClose={() => setIsDevModalOpen(false)}
        onSelectDev={setAssignedToId}
      />

      <FloatingTrashBtn onClick={() => setIsTrashModalOpen(true)}
      count={trashCount} />

      <TrashModal
              isOpen={isTrashModalOpen}
              onClose={() => {
                setIsTrashModalOpen(false);
                fetchTrashCount();
              }}
              onRestoreSuccess={() => {
                fetchProjectDetail();
                fetchTrashCount();
              }
              }
              trashType="tasks"
              projectId={projectId}
            />      
    </div>
  );
}