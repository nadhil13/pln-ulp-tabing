import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  CalendarDays,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAllItems } from '@/hooks/useInventory';
import { useAuth } from '@/contexts/AuthContext';
import { InventoryItem, MaterialUmumItem } from '@/types';
import { exportToExcel, exportToPDF, exportSummaryToPDF } from '@/lib/export-utils';
import { MATERIAL_CATEGORIES } from '@/lib/constants/materials';

const CHART_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500',
  'bg-pink-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-red-500',
  'bg-indigo-500', 'bg-teal-500', 'bg-lime-500', 'bg-amber-500',
  'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-sky-500', 'bg-slate-500',
];

export default function Reports() {
  const { isRole } = useAuth();
  const { items, loading } = useAllItems();
  const [dateRange, setDateRange] = useState<string>('all');
  const [kategoriFilter, setKategoriFilter] = useState<string>('all');

  const getFilteredItems = () => {
    let filtered = items;
    
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      switch (dateRange) {
        case 'today': startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
        case 'week': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
        case 'month': startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
        case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
        default: startDate = new Date(0);
      }
      filtered = filtered.filter(item => item.createdAt >= startDate);
    }
    
    if (kategoriFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.jenisBarang === 'material_umum' && (item as MaterialUmumItem).kategoriMaterial === kategoriFilter
      );
    }
    
    return filtered;
  };

  const filteredItems = getFilteredItems();
  const totalItems = filteredItems.length;
  const pendingCount = filteredItems.filter(i => i.status === 'pending').length;
  const approvedCount = filteredItems.filter(i => i.status === 'approved').length;
  const rejectedCount = filteredItems.filter(i => i.status === 'rejected').length;
  const approvalRate = totalItems > 0 ? Math.round((approvedCount / totalItems) * 100) : 0;

  // Aggregate by kategori from material_data.json categories
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    MATERIAL_CATEGORIES.forEach(cat => { counts[cat] = 0; });
    filteredItems.forEach(item => {
      if (item.jenisBarang === 'material_umum') {
        const kat = (item as MaterialUmumItem).kategoriMaterial || 'Material Umum';
        counts[kat] = (counts[kat] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [filteredItems]);

  // Export Handlers
  const handleExportExcel = () => {
    if (filteredItems.length === 0) { toast.error('Tidak ada data untuk diexport'); return; }
    exportToExcel(filteredItems);
    toast.success('File Excel berhasil diunduh');
  };

  const handleExportPDF = () => {
    if (filteredItems.length === 0) { toast.error('Tidak ada data untuk diexport'); return; }
    exportToPDF(filteredItems);
    toast.success('File PDF berhasil diunduh');
  };

  const handleExportSummary = () => {
    exportSummaryToPDF(totalItems, pendingCount, approvedCount, rejectedCount);
    toast.success('Ringkasan PDF berhasil diunduh');
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Laporan & Statistik</h1>
          <p className="text-sm text-muted-foreground">Analisis data inventaris gudang PLN</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 md:p-6 md:pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <CalendarDays className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Waktu</SelectItem>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="week">7 Hari Terakhir</SelectItem>
                <SelectItem value="month">Bulan Ini</SelectItem>
                <SelectItem value="year">Tahun Ini</SelectItem>
              </SelectContent>
            </Select>
            <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Kategori Material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {MATERIAL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardContent className="p-4 md:pt-6 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 md:p-3 rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold">{totalItems}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Total Barang</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 md:pt-6 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 md:p-3 rounded-lg bg-yellow-500/10">
                    <Clock className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold">{pendingCount}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 md:pt-6 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 md:p-3 rounded-lg bg-green-500/10">
                    <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold">{approvedCount}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Disetujui</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 md:pt-6 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 md:p-3 rounded-lg bg-red-500/10">
                    <XCircle className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold">{rejectedCount}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Ditolak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* By Kategori Material */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PieChart className="h-5 w-5" />
                  Berdasarkan Kategori Material
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryStats.length > 0 ? categoryStats.map(([cat, count], idx) => (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${CHART_COLORS[idx % CHART_COLORS.length]}`}></div>
                        <span className="text-sm truncate max-w-[150px] sm:max-w-[180px]">{cat}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{count}</span>
                        <Badge variant="secondary" className="text-xs">
                          {totalItems > 0 ? Math.round((count / totalItems) * 100) : 0}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`${CHART_COLORS[idx % CHART_COLORS.length]} h-2 rounded-full transition-all`}
                        style={{ width: `${totalItems > 0 ? (count / totalItems) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">Belum ada data material</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approval Rate */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Tingkat Persetujuan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                  <div className="relative w-32 h-32 md:w-40 md:h-40">
                    <svg viewBox="0 0 128 128" className="w-full h-full">
                      <circle className="text-muted" strokeWidth="12" stroke="currentColor" fill="transparent" r="56" cx="64" cy="64" style={{ transform: 'rotate(-90deg)', transformOrigin: '64px 64px' }} />
                      <circle className="text-primary" strokeWidth="12" strokeDasharray={`${approvalRate * 3.51} 351`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="56" cx="64" cy="64" style={{ transform: 'rotate(-90deg)', transformOrigin: '64px 64px' }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl md:text-4xl font-bold">{approvalRate}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    {approvedCount} dari {totalItems} barang disetujui
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Download className="h-5 w-5" />
                Export Laporan
              </CardTitle>
              <CardDescription>Unduh data inventaris dalam berbagai format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleExportExcel}>
                  <FileSpreadsheet className="h-6 w-6 text-green-600" />
                  <div className="text-center">
                    <p className="font-medium">Export Excel</p>
                    <p className="text-xs text-muted-foreground">Data lengkap .xlsx</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleExportPDF}>
                  <FileText className="h-6 w-6 text-red-600" />
                  <div className="text-center">
                    <p className="font-medium">Export PDF</p>
                    <p className="text-xs text-muted-foreground">Dokumen resmi .pdf</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleExportSummary}>
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  <div className="text-center">
                    <p className="font-medium">Ringkasan PDF</p>
                    <p className="text-xs text-muted-foreground">Statistik ringkas</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
