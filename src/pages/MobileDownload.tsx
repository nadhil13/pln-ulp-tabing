import { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InventoryItem, JENIS_BARANG_LABELS, KONDISI_LABELS, MaterialUmumItem } from '@/types';
import { Loader2, CheckCircle, AlertCircle, FileSpreadsheet, Zap } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const getItemName = (item: InventoryItem): string => {
  switch (item.jenisBarang) {
    case 'tiang': return `Tiang ${item.idTiang}`;
    case 'kwh_meter': return `KWH Meter ${item.idMeter}`;
    case 'kabel': return item.description || 'Kabel';
    case 'material_umum': return (item as MaterialUmumItem).namaMaterial || 'Material';
    default: return '-';
  }
};

const getVolume = (item: InventoryItem): string | number => {
  if (item.jenisBarang === 'tiang') return item.volume || '-';
  if (item.jenisBarang === 'kabel') return item.length || '-';
  if (item.jenisBarang === 'material_umum') return (item as MaterialUmumItem).jumlah || '-';
  if (item.jenisBarang === 'kwh_meter') return item.jumlah || '-';
  return '-';
};

const getSatuan = (item: InventoryItem): string => {
  if (item.jenisBarang === 'material_umum') return (item as MaterialUmumItem).satuanMaterial || 'BH';
  if (item.jenisBarang === 'kabel') return 'M';
  return 'BH';
};

type Status = 'connecting' | 'fetching' | 'generating' | 'done' | 'error' | 'empty';

const STATUS_MESSAGES: Record<Status, string> = {
  connecting: 'Menghubungkan ke Server PLN...',
  fetching: 'Sedang mengambil data realtime...',
  generating: 'Menyusun file Excel...',
  done: 'Laporan berhasil diunduh!',
  error: 'Gagal mengunduh laporan.',
  empty: 'Belum ada data inventaris.',
};

export default function MobileDownload() {
  const [status, setStatus] = useState<Status>('connecting');
  const [itemCount, setItemCount] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      try {
        // Step 1: Connecting animation
        await new Promise(r => setTimeout(r, 1200));
        setStatus('fetching');

        // Step 2: Fetch data from Firestore directly (no auth needed)
        const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const items: InventoryItem[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          } as InventoryItem;
        });

        if (items.length === 0) {
          setStatus('empty');
          return;
        }

        setItemCount(items.length);
        setStatus('generating');
        await new Promise(r => setTimeout(r, 800));

        // Step 3: Generate Excel
        const now = new Date();
        const timestamp = format(now, 'yyyy-MM-dd_HH-mm', { locale: id });

        const headerRows = [
          ['PT PLN (PERSERO) - UID SUMATERA BARAT'],
          ['ULP TABING - GUDANG MATERIAL'],
          ['LAPORAN STOK MATERIAL REALTIME'],
          [`Dicetak pada: ${format(now, 'd MMMM yyyy, HH:mm \'WIB\'', { locale: id })}`],
          [],
          ['No', 'Nama Material', 'Kategori', 'Jumlah', 'Satuan', 'Kondisi', 'Status Verifikasi', 'Lokasi', 'Diinput Oleh', 'Tanggal Input'],
        ];

        const dataRows = items.map((item, index) => [
          index + 1,
          getItemName(item),
          item.jenisBarang === 'material_umum'
            ? (item as MaterialUmumItem).kategoriMaterial || '-'
            : JENIS_BARANG_LABELS[item.jenisBarang],
          getVolume(item),
          getSatuan(item),
          KONDISI_LABELS[item.kondisi] || '-',
          item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Menunggu Verifikasi',
          item.lokasi || '-',
          item.createdByName || '-',
          format(item.createdAt, 'd MMM yyyy HH:mm', { locale: id }),
        ]);

        const allRows = [...headerRows, ...dataRows];
        const ws = XLSX.utils.aoa_to_sheet(allRows);

        // Column widths
        ws['!cols'] = [
          { wch: 5 }, { wch: 38 }, { wch: 24 }, { wch: 10 }, { wch: 8 },
          { wch: 22 }, { wch: 20 }, { wch: 10 }, { wch: 22 }, { wch: 18 },
        ];

        // Merge header rows
        ws['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
          { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
          { s: { r: 3, c: 0 }, e: { r: 3, c: 9 } },
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan Stok');
        XLSX.writeFile(wb, `Laporan_Stok_PLN_${timestamp}.xlsx`);

        setStatus('done');
      } catch (err) {
        console.error('Download error:', err);
        setStatus('error');
      }
    };

    run();
  }, []);

  const isLoading = status === 'connecting' || status === 'fetching' || status === 'generating';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6">
        {/* PLN Logo / Branding */}
        <div className="space-y-3">
          <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #163C93, #1e50b5)' }}>
            <Zap className="h-10 w-10 text-[#FFE300]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#163C93]">PLN ULP TABING</h1>
            <p className="text-sm text-gray-500">Sistem Manajemen Gudang Digital</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-16 h-1 mx-auto rounded-full" style={{ background: '#FFE300' }} />

        {/* Status Area */}
        <div className="py-6 space-y-4">
          {isLoading && (
            <>
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-[#163C93]" />
              <div>
                <p className="font-medium text-[#163C93]">{STATUS_MESSAGES[status]}</p>
                {status === 'generating' && itemCount > 0 && (
                  <p className="text-sm text-gray-500 mt-1">Memproses {itemCount} item...</p>
                )}
              </div>
              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 pt-2">
                {['connecting', 'fetching', 'generating'].map((step, i) => (
                  <div
                    key={step}
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: status === step ? 24 : 8,
                      background: ['connecting', 'fetching', 'generating'].indexOf(status) >= i ? '#163C93' : '#e5e7eb',
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {status === 'done' && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-700 text-lg">Laporan Berhasil Diunduh!</p>
                <p className="text-sm text-gray-500 mt-2">
                  Silakan cek folder <strong>Download</strong> di HP Anda.
                </p>
                {itemCount > 0 && (
                  <p className="text-xs text-gray-400 mt-1">{itemCount} item • Format Excel (.xlsx)</p>
                )}
              </div>
            </>
          )}

          {status === 'empty' && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center">
                <FileSpreadsheet className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-yellow-700">Belum Ada Data</p>
                <p className="text-sm text-gray-500 mt-1">Inventaris masih kosong. Silakan input barang terlebih dahulu.</p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <p className="font-medium text-red-600">Gagal Mengunduh</p>
                <p className="text-sm text-gray-500 mt-1">Terjadi kesalahan. Silakan coba scan ulang QR Code.</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-6 py-2.5 rounded-lg text-white font-medium text-sm"
                style={{ background: '#163C93' }}
              >
                Coba Lagi
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-4 space-y-1">
          <p className="text-xs text-gray-400">PT PLN (Persero) - ULP Tabing</p>
          <p className="text-xs text-gray-300">Kota Padang, Sumatera Barat</p>
        </div>
      </div>
    </div>
  );
}