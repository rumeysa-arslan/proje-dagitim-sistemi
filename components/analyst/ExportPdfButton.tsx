'use client';

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportPdfButtonProps {
  stats: any;
  mode: 'PM' | 'DEVELOPER';
  selectedUserName?: string;
}

export default function ExportPdfButton({
  stats,
  mode,
  selectedUserName = 'Genel',
}: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const generatePDF = () => {
    if (!stats) {
      alert('Raporlanacak veri bulunamadı!');
      return;
    }

    setIsExporting(true);

    try {
      const doc = new jsPDF();
      const dateStr = new Date().toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // 1. ÜST HEADER (Koyu Mavi / Indigo Başlık Bandı)
      doc.setFillColor(30, 41, 59); // Slate-800
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SISTEM PERFORMANS VE ANALIZ RAPORU', 14, 15);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text(`Rapor Turu: ${mode === 'PM' ? 'Proje Yoneticisi (PM) Analizi' : 'Gelistirici (Developer) Analizi'}`, 14, 23);
      doc.text(`Tarih: ${dateStr}`, 14, 28);
      doc.text(`Secili Kisi: ${selectedUserName}`, 140, 28);

      // 2. ÖZET METRİK KARTLARI (Kutular)
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Ozet Performans Metrikleri', 14, 42);

      const drawCard = (x: number, y: number, w: number, h: number, title: string, value: string, color: number[]) => {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, y, w, h, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, y, w, h, 2, 2, 'S');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(title, x + 4, y + 7);

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(value, x + 4, y + 17);
      };

      if (mode === 'PM') {
        drawCard(14, 46, 42, 22, 'Yonetilen Proje', String(stats.totalProjects || 0), [37, 99, 235]);
        drawCard(61, 46, 42, 22, 'Acilan Gorev', String(stats.totalTasks || 0), [79, 70, 229]);
        drawCard(108, 46, 42, 22, 'Tamamlanan', String(stats.completedTasks || 0), [16, 185, 129]);
        drawCard(155, 46, 42, 22, 'Ilerleme Orani', `%${stats.overallCompletionRate || 0}`, [245, 158, 11]);

        // PM Detay Tablosu: Proje İlerlemeleri
        const projectRows = (stats.projectProgressList || []).map((p: any) => [
          p.title || '-',
          p.totalTasks || 0,
          p.doneTasks || 0,
          `%${p.percentage || 0}`,
          p.percentage === 100 ? 'Tamamlandi' : p.percentage > 0 ? 'Devam Ediyor' : 'Baslanmadi',
        ]);

        autoTable(doc, {
          startY: 76,
          head: [['Proje Adi', 'Toplam Gorev', 'Biten Gorev', 'Ilerleme', 'Durum']],
          body: projectRows.length > 0 ? projectRows : [['Kayitli proje gorevi bulunamadi', '-', '-', '-', '-']],
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          styles: { fontSize: 9, cellPadding: 3.5 },
        });

        // PM Detay Tablosu 2: Geliştirici İş Dağılımı
        const currentY = (doc as any).lastAutoTable.finalY + 12;
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Ekip Gorev ve Is Dagitim Tablosu', 14, currentY);

        const devRows = (stats.distributionChart || []).map((d: any) => [
          d.name || '-',
          d.assignedCount || 0,
          d.completedCount || 0,
          d.lastAssignedDate || '-',
          d.lastCompletedDate || '-',
        ]);

        autoTable(doc, {
          startY: currentY + 4,
          head: [['Gelistirici', 'Atanan Is', 'Biten Is', 'Son Is Atama', 'Son Is Bitirme']],
          body: devRows.length > 0 ? devRows : [['Ekip verisi bulunamadi', '-', '-', '-', '-']],
          theme: 'grid',
          headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          styles: { fontSize: 9, cellPadding: 3.5 },
        });
      } else {
        // Developer Modu Kartları
        drawCard(14, 46, 42, 22, 'Toplam Gorev', String(stats.totalTasks || 0), [37, 99, 235]);
        drawCard(61, 46, 42, 22, 'Tamamlanan', String(stats.completedCount || 0), [16, 185, 129]);
        drawCard(108, 46, 42, 22, 'Cozum Hizi', String(stats.avgCompletionHours || '0 Saat'), [245, 158, 11]);
        drawCard(155, 46, 42, 22, 'Zamaninda Teslim', `%${stats.onTimeRate ?? 100}`, [139, 92, 246]);

        // Developer Durum Dağılımı Tablosu
        const devStatusRows = [
          ['Yapilacak (TODO)', stats.todoCount || 0, stats.prioritiesByStatus?.todo?.high || 0, stats.prioritiesByStatus?.todo?.medium || 0, stats.prioritiesByStatus?.todo?.low || 0],
          ['Devam Eden (IN_PROGRESS)', stats.inProgressCount || 0, stats.prioritiesByStatus?.inProgress?.high || 0, stats.prioritiesByStatus?.inProgress?.medium || 0, stats.prioritiesByStatus?.inProgress?.low || 0],
          ['Tamamlanan (DONE)', stats.completedCount || 0, stats.prioritiesByStatus?.done?.high || 0, stats.prioritiesByStatus?.done?.medium || 0, stats.prioritiesByStatus?.done?.low || 0],
        ];

        autoTable(doc, {
          startY: 76,
          head: [['Gorev Durumu', 'Adet', 'Yuksek Oncelik', 'Orta Oncelik', 'Dusuk Oncelik']],
          body: devStatusRows,
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          styles: { fontSize: 9, cellPadding: 4 },
        });

        // Developer Not Kutusu
        const currentY = (doc as any).lastAutoTable.finalY + 12;
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(14, currentY, 182, 20, 2, 2, 'F');
        doc.setDrawColor(187, 247, 208);
        doc.roundedRect(14, currentY, 182, 20, 2, 2, 'S');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(22, 101, 52);
        doc.text('Performans Degerlendirmesi:', 18, currentY + 8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Secili gelistirici gorevleri ortalama ${stats.avgCompletionHours || '0 Saat'} icerisinde tamamlamakta ve islerini %${stats.onTimeRate ?? 100} oraninda zamaninda teslim etmektedir.`,
          18,
          currentY + 14
        );
      }

      // 3. ALT FOOTER
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Proje Yonetim & Dagitim Sistemi - Otomatik Analiz Raporu', 14, pageHeight - 10);
      doc.text('Sayfa 1 / 1', 180, pageHeight - 10);

      doc.save(`Analiz_Raporu_${selectedUserName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF Hatası:', err);
      alert('PDF oluşturulurken bir sorun çıktı.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isExporting || !stats}
      className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
    >
      <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {isExporting ? 'Hazırlanıyor...' : 'PDF Rapor İndir'}
    </button>
  );
}