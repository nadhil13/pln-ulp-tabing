import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Plus,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMyItems } from '@/hooks/useInventory';
import { ApprovalRateCard } from './ApprovalRateCard';
import { STATUS_LABELS, type InventoryItem } from '@/types';

const getItemDisplayName = (item: InventoryItem): string => {
  switch (item.jenisBarang) {
    case 'tiang':
      return `Tiang ${item.idTiang}`;
    case 'kwh_meter':
      return `KWH Meter ${item.idMeter}`;
    case 'kabel':
      return item.description.substring(0, 30) + (item.description.length > 30 ? '...' : '');
    case 'material_umum':
      return item.namaMaterial || 'Material';
    default:
      return 'Unknown Item';
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved': return '🟢';
    case 'rejected': return '🔴';
    default: return '🟡';
  }
};

export function StaffDashboard() {
  const { userData } = useAuth();
  const { items, loading } = useMyItems();

  const pendingCount = items.filter(i => i.status === 'pending').length;
  const approvedCount = items.filter(i => i.status === 'approved').length;
  const rejectedCount = items.filter(i => i.status === 'rejected').length;
  const totalCount = items.length;

  // Recent items (last 5)
  const recentItems = [...items]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';

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
                {userData?.name?.split(' ')[0] || 'Staff'}
              </h2>
              <p className="text-primary-foreground/70 text-sm md:text-base">
                Selamat datang di PLN Warehouse Management System
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="w-full md:w-auto shadow-lg h-14 min-h-[44px] text-base">
              <Link to="/input-barang">
                <Plus className="mr-2 h-5 w-5" />
                Input Barang Baru
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats - 3 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card className="glass-card hover:shadow-xl transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '-' : totalCount}</p>
                <p className="text-xs text-muted-foreground">Total Input Saya</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover:shadow-xl transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? '-' : pendingCount}</p>
                <p className="text-xs text-muted-foreground">Menunggu Verifikasi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card hover:shadow-xl transition-all border-red-200/50 dark:border-red-800/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{loading ? '-' : rejectedCount}</p>
                <p className="text-xs text-muted-foreground">Ditolak / Revisi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance + Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <ApprovalRateCard approvedCount={approvedCount} totalCount={totalCount} loading={loading} />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-between h-auto py-3 min-h-[48px]">
              <Link to="/input-barang">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <span>Input Barang Baru</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between h-auto py-3 min-h-[48px]">
              <Link to="/my-items">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <span>Lihat Inventaris Saya</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Riwayat Input Terbaru */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Riwayat Input Terbaru
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs min-h-[36px]">
              <Link to="/my-items">Lihat Semua <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">Belum ada barang yang diinput</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Barang</th>
                      <th className="pb-2 font-medium">Lokasi</th>
                      <th className="pb-2 font-medium">Tanggal</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentItems.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-3 font-medium">{getItemDisplayName(item)}</td>
                        <td className="py-3 text-muted-foreground">{item.lokasi}</td>
                        <td className="py-3 text-muted-foreground">{formatDate(item.createdAt)}</td>
                        <td className="py-3">
                          <Badge className={getStatusBadgeClass(item.status)}>
                            {getStatusIcon(item.status)} {STATUS_LABELS[item.status]}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-2.5">
                {recentItems.map((item) => (
                  <Link
                    key={item.id}
                    to="/my-items"
                    className="block rounded-xl border bg-card p-3.5 hover:bg-accent/50 active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-[15px] truncate">{getItemDisplayName(item)}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span>{item.lokasi}</span>
                          <span>•</span>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                      <Badge className={`text-[11px] flex-shrink-0 ${getStatusBadgeClass(item.status)}`}>
                        {getStatusIcon(item.status)} {STATUS_LABELS[item.status]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="font-medium text-sm">Tips</p>
              <p className="text-sm text-muted-foreground">
                Pastikan foto barang jelas dan informasi lengkap untuk mempercepat proses verifikasi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
