'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProjectCreateForm from '@/components/pm/ProjectCreateForm';
import ProjectCard from '@/components/pm/ProjectCard';
import FloatingTrashBtn from '@/components/FloatingTrashBtn';
import TrashModal from '@/components/TrashModal';
import { useLanguage } from '@/context/LanguageContext';
import ChangePasswordModal from '@/components/ChangePasswordModal';

export default function PMDashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NEWEST');

  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [trashCount, setTrashCount] = useState(0);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  const fetchTrashCount = async () => {
    try {
      const res = await fetch('/api/trash/projects');
      if (res.ok) {
        const data = await res.json();
        setTrashCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async (userId?: string) => {
    const currentId = userId || user?.id;
    setLoading(true);

    try {
      const url = currentId ? `/api/projects?userId=${currentId}` : '/api/projects';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Projeler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return router.push('/auth/login');

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setCurrentUserId(parsedUser.id);
    fetchProjects(parsedUser?.id);
    fetchTrashCount();
  }, [router]);

  const handleDeleteProject = async (id: string) => {
    setDeletingId(id);

    setTimeout(async () => {
      try {
        const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setProjects((prev) => prev.filter((p) => p.id !== id));
          fetchTrashCount();
        }
      } catch (err) {
        console.error('Silme hatası:', err);
      } finally {
        setDeletingId(null);
      }
    }, 350);
  };

  const filteredProjects = projects
    .filter((p) => p.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'NEWEST') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOrder === 'OLDEST') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortOrder === 'A_Z') return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      <Navbar user={user} onChangePassword={() => setIsPasswordModalOpen(true)} onLogout={() => { 
        localStorage.clear(); 
        router.push('/auth/login');  }} />

      <div className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div>
            <ProjectCreateForm
              user={user}
              onProjectCreated={() => fetchProjects(user?.id)}
            />
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {t('activeProjects')} ({filteredProjects.length})
              </h2>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
                />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="NEWEST">{t('sortNewest')}</option>
                  <option value="OLDEST">{t('sortOldest')}</option>
                  <option value="A_Z">{t('sortMostTasks')}</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 font-medium animate-pulse bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                {t('loadingProjects' as any) || 'Projeler yükleniyor...'}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                {t('noProjectsYet')}
              </div>
            ) : (
              <div className="space-y-3 overflow-hidden">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`transition-all duration-350 ease-out transform ${
                      deletingId === project.id
                        ? 'translate-x-full opacity-0 scale-95 pointer-events-none'
                        : 'translate-x-0 opacity-100 scale-100'
                    }`}
                  >
                    <ProjectCard
                      project={project}
                      onDelete={() => handleDeleteProject(project.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <FloatingTrashBtn count={trashCount} onClick={() => setIsTrashOpen(true)} />
      <TrashModal
        isOpen={isTrashOpen}
        onClose={() => { setIsTrashOpen(false); fetchTrashCount(); }}
        trashType="projects"
        onRestoreSuccess={() => { fetchProjects(user?.id); fetchTrashCount(); }}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userId={user?.id}
      />
    </div>
  );
}