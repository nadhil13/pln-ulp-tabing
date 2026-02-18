import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  ArrowRight,
  FileSpreadsheet,
  Package,
  Loader2,
  TrendingUp,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePendingItems, useAllItems } from '@/hooks/useInventory';
import { JENIS_BARANG_LABELS, InventoryItem } from '@/types';
import { ApprovalRateCard } from './ApprovalRateCard';

const getItemDisplayName = (item: InventoryItem): string => {
  switch (item.jenisBarang) {
    case 'tiang':
      return `Tiang ${item.idTiang}`;
    case 'kwh_meter':
      return `KWH Meter ${item.idMeter}`;
    case 'kabel':
      return item.description.substring(0, 25) + (item.description.length > 25 ? '...' : '');
    case 'material_umum':
      return item.namaMaterial || 'Material';
    default:
      return 'Unknown Item';
  }
};

export function VerifikatorDashboard() {
  const { userData } = useAuth();
  const { items: pendingItems, loading: pendingLoading } = usePendingItems();
  const { items: allItems, loading: allLoading } = useAllItems();

  const approvedCount = allItems.filter(i => i.status === 'approved').length;
  const rejectedCount = allItems.filter(i => i.status === 'rejected').length;
  const totalProcessed = approvedCount + rejectedCount;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Hero */}
      <Card className="glass-card-hero bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground border-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAxOGMtMy4zMTQgMC02LTIuNjg2LTYtNnMyLjY4Ni02IDYtNiA2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
        <CardContent className="pt-6 pb-6 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-primary-foreground/80 text-sm mb-1">{greeting} 👋</p>
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                {userData?.name?.split(' ')[0] || 'Verifikator'}
              </h2>
              <p className="text-primary-foreground/70 text-sm md:text-base">
                {pendingItems.length > 0 
                  ? `Ada ${pendingItems.length} barang menunggu verifikasi`
                  : 'Semua barang sudah diverifikasi ✓'
                }
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="w-full md:w-auto shadow-lg">
              <Link to="/approval">
                <CheckCircle className="mr-2 h-5 w-5" />
                Buka Approval Center
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className={pendingItems.length > 0 ? 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20' : ''}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center">
              <div className="p-2 rounded-full bg-yellow-500/10 mb-2">
                {pendingItems.length > 5 ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <p className="text-2xl font-bold">
                {pendingLoading ? '-' : pendingItems.length}
              </p>
              <p className="text-xs text-muted-foreground">Menunggu</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover:shadow-xl transition-all">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center">
              <div className="p-2 rounded-full bg-green-500/10 sm:mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {allLoading ? '-' : approvedCount}
                </p>
                <p className="text-xs text-muted-foreground">Disetujui</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover:shadow-xl transition-all">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:text-center">
              <div className="p-2 rounded-full bg-primary/10 sm:mb-2">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {allLoading ? '-' : allItems.length}
                </p>
                <p className="text-xs text-muted-foreground">Total Barang</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <ApprovalRateCard approvedCount={approvedCount} totalCount={allItems.length} loading={allLoading} compact />
      </div>

      {/* Pending Preview + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Pending Items Preview */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Antrian Verifikasi
              </CardTitle>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/approval">
                Lihat Semua
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : pendingItems.length > 0 ? (
              <div className="space-y-3">
                {pendingItems.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt="Item"
                          className="w-10 h-10 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{getItemDisplayName(item)}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.createdByName} • {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {JENIS_BARANG_LABELS[item.jenisBarang]}
                    </Badge>
                  </div>
                ))}
                {pendingItems.length > 4 && (
                  <p className="text-center text-sm text-muted-foreground">
                    +{pendingItems.length - 4} barang lainnya
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="mx-auto h-10 w-10 mb-3 opacity-50" />
                <p className="font-medium">Semua sudah diverifikasi!</p>
                <p className="text-sm">Tidak ada barang pending</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-between h-auto py-3">
              <Link to="/approval">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Approval Center</p>
                    <p className="text-xs text-muted-foreground">
                      Verifikasi barang pending
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between h-auto py-3">
              <Link to="/reports">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <BarChart3 className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Laporan & Statistik</p>
                    <p className="text-xs text-muted-foreground">
                      Analisis data inventaris
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="text-2xl">📋</div>
            <div>
              <p className="font-medium text-sm">Panduan Verifikasi</p>
              <p className="text-sm text-muted-foreground">
                Periksa foto dan data barang dengan teliti. Berikan alasan yang jelas jika menolak barang.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
