import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileSpreadsheet, Loader2, CheckCircle, QrCode, Smartphone } from 'lucide-react';
import { useAllItems } from '@/hooks/useInventory';
import { InventoryItem, JENIS_BARANG_LABELS, KONDISI_LABELS, MaterialUmumItem } from '@/types';
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

function generateExcel(items: InventoryItem[]) {
  const now = new Date();
  const timestamp = format(now, 'yyyy-MM-dd_HH-mm', { locale: id });

  const headerRows = [
    ['PT PLN (PERSERO) - UID SUMATERA BARAT'],
    ['ULP TABING - GUDANG MATERIAL'],
    ['LAPORAN STOK MATERIAL REALTIME'],
    [`Dicetak pada: ${format(now, 'd MMMM yyyy, HH:mm \'WIB\'', { locale: id })}`],
    [],
    ['No', 'Nama Material', 'Kategori', 'Jumlah', 'Satuan', 'Kondisi', 'Status', 'Lokasi', 'Diinput Oleh', 'Tanggal Input'],
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
    item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Menunggu',
    item.lokasi || '-',
    item.createdByName || '-',
    format(item.createdAt, 'd MMM yyyy', { locale: id }),
  ]);

  const allRows = [...headerRows, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(allRows);
  ws['!cols'] = [
    { wch: 5 }, { wch: 38 }, { wch: 24 }, { wch: 10 }, { wch: 8 },
    { wch: 22 }, { wch: 12 }, { wch: 10 }, { wch: 22 }, { wch: 18 },
  ];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 9 } },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Stok');
  XLSX.writeFile(wb, `Laporan_Stok_PLN_${timestamp}.xlsx`);
}

export function ExcelDownloadCard() {
  const { items, loading } = useAllItems();
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle');
  const [qrOpen, setQrOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    setDownloadUrl(`${origin}/mobile-download`);
  }, []);

  const handleDownload = () => {
    if (loading || items.length === 0) return;
    setStatus('generating');
    try {
      generateExcel(items);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('idle');
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileSpreadsheet className="h-5 w-5" />
          Download Laporan Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground text-center">
          Unduh laporan stok realtime dalam format Excel resmi PLN
        </p>

        {/* Direct Download Button */}
        <Button
          onClick={handleDownload}
          disabled={loading || items.length === 0 || status === 'generating'}
          className="w-full"
          size="lg"
        >
          {status === 'generating' ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyiapkan...</>
          ) : status === 'done' ? (
            <><CheckCircle className="mr-2 h-4 w-4" />Berhasil Diunduh!</>
          ) : (
            <><FileSpreadsheet className="mr-2 h-4 w-4" />Download Excel ({items.length} item)</>
          )}
        </Button>

        {/* QR Code for Mobile Staff */}
        <Dialog open={qrOpen} onOpenChange={setQrOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full" size="sm">
              <QrCode className="mr-2 h-4 w-4" />
              Tampilkan QR untuk Staff HP
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center flex items-center justify-center gap-2">
                <Smartphone className="h-5 w-5" />
                QR Download Laporan
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-5 py-4">
              {/* QR with PLN-style border */}
              <div className="p-1 rounded-xl" style={{ border: '4px solid #163C93' }}>
                <div className="p-1 rounded-lg" style={{ border: '2px solid #FFE300' }}>
                  <div className="bg-white p-4 rounded-md">
                    <QRCode value={downloadUrl} size={200} level="H" fgColor="#163C93" />
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="font-medium text-sm" style={{ color: '#163C93' }}>
                  Scan menggunakan Kamera HP
                </p>
                <p className="text-xs text-muted-foreground">
                  untuk unduh Laporan Excel Resmi secara otomatis
                </p>
              </div>

              <div className="w-full bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground text-center break-all font-mono">
                  {downloadUrl}
                </p>
              </div>

              <p className="text-[10px] text-muted-foreground/50 text-center">
                PT PLN (Persero) — Internal System • Tanpa layanan pihak ketiga
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <p className="text-xs text-muted-foreground/60 text-center">
          Data realtime • Format resmi PT PLN (Persero)
        </p>
        {/* <p className="text-[10px] text-yellow-600 dark:text-yellow-400 text-center leading-relaxed bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-2">
          ⚠️ Jika testing di HP via Localhost, buka website menggunakan IP Address laptop (misal 192.168.x.x:8080)
        </p> */}
      </CardContent>
    </Card>
  );
}