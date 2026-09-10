'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DevData {
  name: string;
  assignedCount: number;
  completedCount: number;
  lastAssignedDate: string | null;
  lastCompletedDate: string | null;
}

interface InteractiveBarChartProps {
  data: DevData[];
}

export default function InteractiveBarChart({ data = [] }: InteractiveBarChartProps) {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<'all' | 'assigned' | 'completed'>('all');

  const totalAssigned = data.reduce((acc, curr) => acc + (curr.assignedCount || 0), 0);
  const totalCompleted = data.reduce((acc, curr) => acc + (curr.completedCount || 0), 0);
  const grandTotal = totalAssigned + totalCompleted;

  // Özel Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const itemData = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-800 text-white p-3.5 rounded-xl text-xs shadow-2xl space-y-2">
          <p className="font-black text-slate-100 border-b border-slate-800 pb-1.5 text-sm">{label}</p>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4 text-blue-400 font-semibold">
              <span>🔵 {itemData.assignedCount} Görev Atandı</span>
              <span className="text-[11px] text-slate-400 font-normal">
                {itemData.lastAssignedDate ? `: ${itemData.lastAssignedDate}` : ''}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 text-emerald-400 font-semibold">
              <span>🟢 {itemData.completedCount} Görev Tamamlandı</span>
              <span className="text-[11px] text-slate-400 font-normal">
                {itemData.lastCompletedDate ? `: ${itemData.lastCompletedDate}` : ': Devam Ediyor'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Üst Sekmeli Header */}
      <div className="flex flex-col sm:flex-row items-stretch border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-1 flex-col justify-center px-6 py-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {t('teamDistributionTitle')}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('teamDistributionDesc')}
          </p>
        </div>

        {/* 3'lü Buton Grubu */}
        <div className="flex border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800">
          {/* Tümü Butonu */}
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`flex flex-1 flex-col justify-center gap-1 px-5 py-4 sm:px-7 text-left transition ${
              activeFilter === 'all'
                ? 'bg-indigo-50/50 dark:bg-indigo-950/40 border-b-2 border-indigo-600'
                : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
            }`}
          >
            <span className="text-[11px] font-medium text-slate-400">{t('all')}</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-600">
              {grandTotal}
            </span>
          </button>

          {/* Atanan Görevler Butonu */}
          <button
            type="button"
            onClick={() => setActiveFilter('assigned')}
            className={`flex flex-1 flex-col justify-center gap-1 px-5 py-4 sm:px-7 text-left border-l border-slate-100 dark:border-slate-800 transition ${
              activeFilter === 'assigned'
                ? 'bg-blue-50/50 dark:bg-blue-950/40 border-b-2 border-blue-600'
                : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
            }`}
          >
            <span className="text-[11px] font-medium text-slate-400">{t('assignedTasks')}</span>
            <span className="text-xl sm:text-2xl font-black text-blue-600">
              {totalAssigned}
            </span>
          </button>

          {/* Tamamlanan Butonu */}
          <button
            type="button"
            onClick={() => setActiveFilter('completed')}
            className={`flex flex-1 flex-col justify-center gap-1 px-5 py-4 sm:px-7 text-left border-l border-slate-100 dark:border-slate-800 transition ${
              activeFilter === 'completed'
                ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-b-2 border-emerald-600'
                : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
            }`}
          >
            <span className="text-[11px] font-medium text-slate-400">{t('completedTask')}</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600">
              {totalCompleted}
            </span>
          </button>
        </div>
      </div>

      {/* Recharts Bar Alanı */}
      <div className="p-6">
        <style jsx global>{`
          .recharts-wrapper,
          .recharts-surface,
          .recharts-responsive-container,
          .recharts-cartesian-grid-bg,
          svg {
            outline: none !important;
            border: none !important;
            user-select: none;
          }
          .recharts-cartesian-grid-bg {
            stroke: none !important;
            fill: transparent !important;
          }
          *:focus {
            outline: none !important;
          }
        `}</style>

        <div className="h-[300px] w-full focus:outline-hidden outline-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              accessibilityLayer={false}
              margin={{ top: 15, right: 20, left: -20, bottom: 15 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                interval={0}
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.04)' }} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }} />

              {(activeFilter === 'all' || activeFilter === 'assigned') && (
                <Bar name={t('assignedTaskLegend')} dataKey="assignedCount" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={36} />
              )}
              {(activeFilter === 'all' || activeFilter === 'completed') && (
                <Bar name={t('completedTaskLegend')} dataKey="completedCount" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={36} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}