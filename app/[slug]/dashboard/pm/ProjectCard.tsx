'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import AnimatedTrashBtn from '@/components/AnimatedTrashBtn';

interface Props {
  project: any;
  onDelete: (id: string) => void;
}

export default function ProjectCard({ project, onDelete }: Props) {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-indigo-200 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{project.description || '---'}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
            {project.tasks.length} {t('tasks')}
          </span>
          <AnimatedTrashBtn onDelete={() => onDelete(project.id)} title="Projeyi Sil" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs">
        <span className="text-gray-400">
          {new Date(project.createdAt).toLocaleDateString('tr-TR')}
        </span>
        <button
          onClick={() => router.push(`/dashboard/pm/projects/${project.id}`)}
          className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
        >
          {t('manageTasks')}
        </button>
      </div>
    </div>
  );
}