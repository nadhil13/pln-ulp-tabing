import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InventoryItem, JENIS_BARANG_LABELS, KONDISI_LABELS, TiangItem, KwhMeterItem, KabelItem, MaterialUmumItem } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Helper to format date in Indonesian
const formatDateID = (date: Date): string => {
  return format(date, "d MMMM yyyy, HH:mm", { locale: id });
};

// Helper to get item details based on type
const getItemDetails = (item: InventoryItem): string => {
  switch (item.jenisBarang) {
    case 'tiang':
      const tiangItem = item as TiangItem;
      return `ID: ${tiangItem.idTiang || '-'}, Tinggi: ${tiangItem.tinggi || '-'}m, Material: ${tiangItem.material || '-'}`;
    case 'kwh_meter':
      const meterItem = item as KwhMeterItem;
      return `ID: ${meterItem.idMeter || '-'}, Merek: ${meterItem.merek || '-'}, Segel: ${meterItem.nomorSegel || '-'}`;
    case 'kabel':
      const kabelItem = item as KabelItem;
      return `${kabelItem.description || '-'}${kabelItem.length ? `, Panjang: ${kabelItem.length}m` : ''}`;
    case 'material_umum':
      const matItem = item as MaterialUmumItem;
      return `${matItem.namaMaterial || '-'}${matItem.serialNumber ? `, SN: ${matItem.serialNumber}` : ''}${matItem.catatan ? `, ${matItem.catatan}` : ''}`;
    default:
      return '-';
  }
};

// Get item name for display
const getItemName = (item: InventoryItem): string => {
  switch (item.jenisBarang) {
    case 'tiang': return `Tiang ${(item as TiangItem).idTiang || ''}`;
    case 'kwh_meter': return `KWh Meter ${(item as KwhMeterItem).idMeter || ''}`;
    case 'kabel': return (item as KabelItem).description || 'Kabel';
    case 'material_umum': return (item as MaterialUmumItem).namaMaterial || 'Material';
    default: return '-';
  }
};

// Get volume from item if applicable
const getVolume = (item: InventoryItem): string => {
  if (item.jenisBarang === 'tiang') return String((item as TiangItem).volume || '-');
  if (item.jenisBarang === 'kabel') return String((item as KabelItem).length || '-');
  if (item.jenisBarang === 'material_umum') return String((item as MaterialUmumItem).jumlah || '-');
  if (item.jenisBarang === 'kwh_meter') return String((item as KwhMeterItem).jumlah || '-');
  return '-';
};

// Get unit
const getSatuan = (item: InventoryItem): string => {
  if (item.jenisBarang === 'material_umum') return (item as MaterialUmumItem).satuanMaterial || 'BH';
  if (item.jenisBarang === 'kabel') return 'M';
  return 'BH';
};

// Get status label in Indonesian
const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending': return 'Menunggu';
    case 'approved': return 'Disetujui';
    case 'rejected': return 'Ditolak';
    default: return status;
  }
};

// Export to Excel with professional formatting
export const exportToExcel = (items: InventoryItem[], filename: string = 'laporan-inventaris'): void => {
  const headerRows = [
    ['PT PLN (PERSERO) - UID SUMATERA BARAT'],
    ['ULP TABING - GUDANG MATERIAL'],
    ['Laporan Data Inventaris'],
    [`Dicetak pada: ${formatDateID(new Date())}`],
    [],
    ['No', 'Nama Material', 'Kategori', 'Jumlah', 'Satuan', 'Kondisi', 'Status', 'Diinput Oleh', 'Tanggal Input', 'Diverifikasi Oleh', 'Catatan'],
  ];

  const dataRows = items.map((item, index) => [
    index + 1,
    getItemName(item),
    item.jenisBarang === 'material_umum' ? (item as MaterialUmumItem).kategoriMaterial || '-' : JENIS_BARANG_LABELS[item.jenisBarang],
    getVolume(item),
    getSatuan(item),
    KONDISI_LABELS[item.kondisi] || '-',
    getStatusLabel(item.status),
    item.createdByName || '-',
    formatDateID(item.createdAt),
    item.verifiedByName || '-',
    item.rejectionNote || '-',
  ]);

  const allRows = [...headerRows, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  ws['!cols'] = [
    { wch: 5 }, { wch: 35 }, { wch: 20 }, { wch: 10 }, { wch: 8 },
    { wch: 16 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 25 },
  ];

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 10 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 10 } },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventaris');
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  XLSX.writeFile(wb, `${filename}-${dateStr}.xlsx`);
};

// ============================================================================
// PREMIUM PDF EXPORT - PLN Corporate Letterhead
// ============================================================================

export const exportToPDF = (items: InventoryItem[], filename: string = 'laporan-inventaris'): void => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ---- KOP SURAT / LETTERHEAD ----
  const drawHeader = () => {
    // PLN Logo area (yellow box with PLN text)
    doc.setFillColor(255, 227, 0); // #FFE300
    doc.roundedRect(14, 8, 28, 28, 2, 2, 'F');
    doc.setFillColor(22, 60, 147); // #163C93
    doc.roundedRect(16, 10, 24, 24, 1.5, 1.5, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 227, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('PLN', 28, 24, { align: 'center' });
    doc.setFontSize(7);
    doc.text('⚡', 28, 29, { align: 'center' });

    // Company Header Text
    doc.setFontSize(16);
    doc.setTextColor(22, 60, 147); // PLN Blue
    doc.setFont('helvetica', 'bold');
    doc.text('PT PLN (PERSERO)', 48, 16);

    doc.setFontSize(13);
    doc.text('UNIT INDUK DISTRIBUSI SUMATERA BARAT', 48, 23);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('ULP TABING - GUDANG MATERIAL', 48, 29);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Jl. Raya Tabing No. 1, Kel. Bungo Pasang, Kec. Koto Tangah, Kota Padang 25171', 48, 34);

    // Double line separator (thick + thin)
    doc.setDrawColor(22, 60, 147);
    doc.setLineWidth(1.2);
    doc.line(14, 40, pageWidth - 14, 40);
    doc.setLineWidth(0.3);
    doc.line(14, 42, pageWidth - 14, 42);

    // Report title
    doc.setFontSize(12);
    doc.setTextColor(22, 60, 147);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN STOK & MUTASI MATERIAL', pageWidth / 2, 50, { align: 'center' });

    // Report meta
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Tanggal Cetak: ${formatDateID(new Date())}`, 14, 56);
    doc.text(`Total Data: ${items.length} item`, pageWidth - 14, 56, { align: 'right' });
  };

  // ---- FOOTER WITH SIGNATURE ----
  const drawFooter = (pageNumber: number, totalPages: number, isLastPage: boolean) => {
    // Page number
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Halaman ${pageNumber} dari ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );

    // Bottom line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    // Left footer text
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Dicetak oleh Sistem WMS PLN ULP Tabing', 14, pageHeight - 5);

    // Signature block on last page
    if (isLastPage) {
      const sigY = pageHeight - 55;
      
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(14, sigY - 5, pageWidth - 14, sigY - 5);

      // Left signature
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      doc.text(`Padang, ${format(new Date(), 'd MMMM yyyy', { locale: id })}`, 14, sigY + 2);

      doc.text('Dibuat oleh,', 14, sigY + 10);
      doc.text('Staff Gudang', 14, sigY + 35);
      doc.setLineWidth(0.3);
      doc.setDrawColor(100, 100, 100);
      doc.line(14, sigY + 32, 65, sigY + 32);

      // Right signature
      doc.text('Mengetahui,', pageWidth - 80, sigY + 10);
      doc.setFont('helvetica', 'bold');
      doc.text('Supervisor Gudang / Logistik', pageWidth - 80, sigY + 35);
      doc.setFont('helvetica', 'normal');
      doc.line(pageWidth - 80, sigY + 32, pageWidth - 14, sigY + 32);
    }
  };

  // Draw header on first page
  drawHeader();

  // Prepare table data
  const tableData = items.map((item, index) => [
    index + 1,
    getItemName(item),
    item.jenisBarang === 'material_umum' ? (item as MaterialUmumItem).kategoriMaterial || '-' : JENIS_BARANG_LABELS[item.jenisBarang],
    getVolume(item),
    getSatuan(item),
    KONDISI_LABELS[item.kondisi] || '-',
    getStatusLabel(item.status),
    item.createdByName || '-',
    formatDateID(item.createdAt),
  ]);

  // Generate table with premium styling
  autoTable(doc, {
    startY: 60,
    head: [[
      'No', 'Nama Material', 'Kategori', 'Jml', 'Sat', 'Kondisi', 'Status', 'Diinput Oleh', 'Tanggal',
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [22, 60, 147], // PLN Blue #163C93
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [40, 40, 40],
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246], // #F3F4F6
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 50 }, // Nama Material - wide
      2: { cellWidth: 28 },
      3: { halign: 'center', cellWidth: 10 },
      4: { halign: 'center', cellWidth: 8 },
      5: { halign: 'center', cellWidth: 20 },
      6: { halign: 'center', cellWidth: 16 },
      7: { cellWidth: 28 },
      8: { cellWidth: 32 },
    },
    margin: { left: 14, right: 14, bottom: 60 },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        // Continuation header
        doc.setFontSize(10);
        doc.setTextColor(22, 60, 147);
        doc.setFont('helvetica', 'bold');
        doc.text('PT PLN (PERSERO) UID SUMBAR - ULP TABING', 14, 12);
        doc.text('Laporan Material (lanjutan)', 14, 18);
        doc.setDrawColor(22, 60, 147);
        doc.setLineWidth(0.5);
        doc.line(14, 20, pageWidth - 14, 20);
      }
    },
  });

  // Draw footers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages, i === totalPages);
  }

  const dateStr = format(new Date(), 'yyyy-MM-dd');
  doc.save(`${filename}-${dateStr}.pdf`);
};

// Export summary for dashboard
export const exportSummaryToPDF = (
  totalItems: number,
  pendingCount: number,
  approvedCount: number,
  rejectedCount: number,
  filename: string = 'ringkasan-inventaris'
): void => {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header with PLN branding
  doc.setFillColor(22, 60, 147);
  doc.roundedRect(18, 12, 22, 22, 1.5, 1.5, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 227, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('PLN', 29, 25, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(22, 60, 147);
  doc.text('PT PLN (PERSERO)', 45, 20);
  doc.setFontSize(11);
  doc.text('UID SUMATERA BARAT - ULP TABING', 45, 27);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Ringkasan Inventaris Gudang Material', 45, 33);

  // Double line
  doc.setDrawColor(22, 60, 147);
  doc.setLineWidth(1.0);
  doc.line(18, 38, pageWidth - 18, 38);
  doc.setLineWidth(0.3);
  doc.line(18, 40, pageWidth - 18, 40);

  // Summary content
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Tanggal Laporan: ${formatDateID(new Date())}`, 18, 52);

  // Stats boxes
  const boxY = 62;
  const boxWidth = 38;
  const boxHeight = 35;
  const gap = 8;

  const stats = [
    { count: totalItems, label: 'Total Barang', color: [22, 60, 147] as [number, number, number] },
    { count: pendingCount, label: 'Menunggu', color: [234, 179, 8] as [number, number, number] },
    { count: approvedCount, label: 'Disetujui', color: [34, 197, 94] as [number, number, number] },
    { count: rejectedCount, label: 'Ditolak', color: [239, 68, 68] as [number, number, number] },
  ];

  stats.forEach((stat, idx) => {
    const x = 18 + (boxWidth + gap) * idx;
    doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.roundedRect(x, boxY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(String(stat.count), x + boxWidth / 2, boxY + 18, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(stat.label, x + boxWidth / 2, boxY + 28, { align: 'center' });
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Dicetak oleh Sistem WMS PLN ULP Tabing pada ${formatDateID(new Date())}`,
    pageWidth / 2, 280, { align: 'center' }
  );

  const dateStr = format(new Date(), 'yyyy-MM-dd');
  doc.save(`${filename}-${dateStr}.pdf`);
};
