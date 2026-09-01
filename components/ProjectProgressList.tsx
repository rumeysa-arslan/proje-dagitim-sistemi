'use client';

interface ProjectProgress {
  id: string;
  title: string;
  percentage: number;
  doneTasks: number;
  totalTasks: number;
}

interface ProjectProgressListProps {
  projects: ProjectProgress[];
}

export default function ProjectProgressList({ projects = [] }: ProjectProgressListProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">
        📁 Yönetilen Projeler ve İlerleme Yüzdeleri
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
          >
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="truncate max-w-[180px] text-slate-800 dark:text-slate-100">{proj.title}</span>
              <span className="text-blue-600 font-extrabold text-sm">%{proj.percentage ?? 0}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${proj.percentage ?? 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Tamamlanan: <b className="text-slate-700 dark:text-slate-300">{proj.doneTasks ?? 0}</b></span>
              <span>Toplam: <b className="text-slate-700 dark:text-slate-300">{proj.totalTasks ?? 0} Görev</b></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}