'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PriorityBreakdown {
  high: number;
  medium: number;
  low: number;
}

interface StatusPieChartProps {
  todoCount: number;
  inProgressCount: number;
  completedCount: number;
  priorities?: {
    todo: PriorityBreakdown;
    inProgress: PriorityBreakdown;
    done: PriorityBreakdown;
  };
}

export default function StatusPieChart({
  todoCount = 0,
  inProgressCount = 0,
  completedCount = 0,
  priorities = {
    todo: { high: 0, medium: 0, low: 0 },
    inProgress: { high: 0, medium: 0, low: 0 },
    done: { high: 0, medium: 0, low: 0 },
  },
}: StatusPieChartProps) {
  const series =
    todoCount === 0 && inProgressCount === 0 && completedCount === 0
      ? [0, 0, 0]
      : [todoCount, inProgressCount, completedCount];

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'pie',
      fontFamily: 'Inter, sans-serif',
    },
    labels: ['Yapılacak (Atanan)', 'Devam Eden', 'Tamamlandı'],
    colors: ['#93C5FD', '#3B82F6', '#1E40AF'],
    dataLabels: {
      enabled: true,
      formatter: (val: any) => Number(val).toFixed(1) + '%',
      style: { fontSize: '12px', fontWeight: 600 },
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
      labels: { colors: '#64748b' },
    },
    tooltip: {
      enabled: true,
      custom: function ({ seriesIndex, w }) {
        const statusNames = ['Yapılacak (Atanan)', 'Devam Eden', 'Tamamlandı'];
        const totalCount = w.globals.series[seriesIndex];
        const statusKey = seriesIndex === 0 ? 'todo' : seriesIndex === 1 ? 'inProgress' : 'done';
        const p = priorities[statusKey as keyof typeof priorities] || { high: 0, medium: 0, low: 0 };

        return `
          <div class="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl text-xs shadow-2xl space-y-2">
            <div class="font-bold border-b border-slate-700/60 pb-1 flex justify-between gap-3">
              <span>${statusNames[seriesIndex]}</span>
              <span class="text-blue-400 font-extrabold">${totalCount} Görev</span>
            </div>
            <div class="space-y-1 text-[11px]">
              <div class="flex items-center justify-between gap-4">
                <span class="text-rose-400">🔴 Yüksek Öncelik:</span>
                <b class="text-slate-100">${p.high}</b>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-amber-400">🟡 Orta Öncelik:</span>
                <b class="text-slate-100">${p.medium}</b>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-emerald-400">🟢 Düşük Öncelik:</span>
                <b class="text-slate-100">${p.low}</b>
              </div>
            </div>
          </div>
        `;
      },
    },
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <h5 className="text-base font-bold text-slate-800 dark:text-slate-100">Görev Durum Dağılımı</h5>
          <p className="text-xs text-slate-400 mt-0.5">Mevcut işlerin aşama analizi</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-600 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900/40">
            {todoCount} Atandı
          </span>
          <span className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
            {inProgressCount} Devam Eden
          </span>
          <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
            {completedCount} Tamamlandı
          </span>
        </div>
      </div>

      <div className="w-full flex justify-center items-center py-4 min-h-[300px]">
        <Chart options={chartOptions} series={series} type="pie" width="100%" height={320} />
      </div>
    </div>
  );
}