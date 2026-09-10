'use client';

import { useLanguage } from '@/context/LanguageContext';
import TaskCard from '@/components/TaskCard';

interface Props {
  tasks: any[];
  user: any;
  openingLidTaskId: string | null;
  deletingTaskId: string | null;
  onDeleteTask: (id: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

export default function ProjectTaskList({
  tasks,
  user,
  openingLidTaskId,
  deletingTaskId,
  onDeleteTask,
  getStatusBadge,
}: Props) {
  const { t } = useLanguage();

  return (
    <div className="md:col-span-2 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">
        {t('tasks')} ({tasks?.length || 0})
      </h2>
      {tasks?.map((task: any) => (
        <TaskCard
          key={task.id}
          task={task}
          user={user}
          openingLidTaskId={openingLidTaskId}
          deletingTaskId={deletingTaskId}
          onDeleteTask={onDeleteTask}
          getStatusBadge={getStatusBadge}
        />
      ))}
    </div>
  );
}