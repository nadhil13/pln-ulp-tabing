import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useAllItems } from '@/hooks/useInventory';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, Users, CheckCircle, Clock, Plus, ArrowRight, Loader2,
  Bell, Send, XCircle, TrendingUp, BarChart3, Shield, ShieldCheck, Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { JENIS_BARANG_LABELS, InventoryItem, ROLE_LABELS, UserRole, KONDISI_LABELS } from '@/types';
import { toast } from 'sonner';
import { ApprovalRateCard } from './ApprovalRateCard';
import { ExcelDownloadCard } from './QRDownloadCard';

const getItemDisplayName = (item: InventoryItem): string => {
  switch (item.jenisBarang) {
    case 'tiang': return `Tiang ${item.idTiang}`;
    case 'kwh_meter': return `KWH Meter ${item.idMeter}`;
    case 'kabel': return item.description.substring(0, 25) + (item.description.length > 25 ? '...' : '');
    case 'material_umum': return item.namaMaterial || 'Material';
    default: return 'Unknown Item';
  }
};

export function AdminDashboard() {
  const { userData } = useAuth();
  const { items, loading: itemsLoading } = useAllItems();
  const { users, loading: usersLoading } = useUsers();
  const { sendNotification } = useNotifications();

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<UserRole | 'all'>('all');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const pendingCount = items.filter(i => i.status === 'pending').length;
  const approvedCount = items.filter(i => i.status === 'approved').length;
  const rejectedCount = items.filter(i => i.status === 'rejected').length;
  const andalCount = items.filter(i => i.kondisi === 'andal').length;
  const limbahCount = items.filter(i => i.kondisi === 'limbah').length;
  const activeUsers = users.filter(u => u.active).length;
  const approvalRate = items.length > 0 ? Math.round((approvedCount / items.length) * 100) : 0;
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayCount = items.filter(i => i.createdAt >= todayStart).length;

  // Low stock items (jumlah < 10)
  const lowStockItems = items.filter(i => {
    const jumlah = (i as any).jumlah;
    return typeof jumlah === 'number' && jumlah < 10 && jumlah > 0;
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date);

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error('Judul dan pesan harus diisi');
      return;
    }
    setSendingBroadcast(true);
    const success = await sendNotification({ title: broadcastTitle, message: broadcastMessage, targetRole: broadcastTarget });
    if (success) {
      toast.success('Notifikasi berhasil dikirim!');
      setBroadcastOpen(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setBroadcastTarget('all');
    } else {
      toast.error('Gagal mengirim notifikasi');
    }
    setSendingBroadcast(false);
  };

  const renderStatSkeleton = () => (
    <div className="flex flex-col items-center gap-2 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-6 w-12" />
      <Skeleton className="h-3 w-16" />
    </div>
  );

  return (
    <div className="flex-1 space-y-4 p-0 animate-fade-in">
      {/* Welcome Hero */}
      <Card className="glass-card-hero bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground border-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAxOGMtMy4zMTQgMC02LTIuNjg2LTYtNnMyLjY4Ni02IDYtNiA2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            <Shield className="h-3 w-3 mr-1" />
            Admin Gudang
          </Badge>
        </div>
        <CardContent className="pt-6 pb-6 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-primary-foreground/80 text-sm mb-1">{greeting} 👋</p>
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                {userData?.name?.split(' ')[0] || 'Admin'}
              </h2>
              <p className="text-primary-foreground/70 text-sm md:text-base">
                Anda memiliki akses penuh ke sistem WMS
              </p>
            </div>
            <div className="flex flex-wrap gap-2 min-w-0">
              <Button asChild variant="secondary" className="shadow-lg flex-1 md:flex-none">
                <Link to="/input-barang">
                  <Plus className="mr-2 h-4 w-4" />
                  Input Barang
                </Link>
              </Button>
              <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="shadow-lg flex-1 md:flex-none">
                    <Bell className="mr-2 h-4 w-4" />
                    Broadcast
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Kirim Notifikasi Broadcast</DialogTitle>
                    <DialogDescription>Kirim pesan ke seluruh pengguna atau role tertentu</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="broadcast-title">Judul</Label>
                      <Input id="broadcast-title" placeholder="Judul notifikasi..." value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="broadcast-message">Pesan</Label>
                      <Textarea id="broadcast-message" placeholder="Isi pesan notifikasi..." rows={4} value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Penerima</Label>
                      <Select value={broadcastTarget} onValueChange={(v) => setBroadcastTarget(v as UserRole | 'all')}>
                        <SelectTrigger><SelectValue placeholder="Pilih target" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Pengguna</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="verifikator">Verifikator</SelectItem>
                          <SelectItem value="admin_gudang">Admin Gudang</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBroadcastOpen(false)}>Batal</Button>
                    <Button onClick={handleSendBroadcast} disabled={sendingBroadcast}>
                      {sendingBroadcast ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengirim...</> : <><Send className="mr-2 h-4 w-4" />Kirim</>}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid - 4 Key Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Aset', count: items.length, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Masuk Hari Ini', count: todayCount, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Bekas Handal', count: andalCount, icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'User Aktif', count: activeUsers, icon: Users, color: 'text-secondary-foreground', bg: 'bg-secondary', usersLoading: true },
        ].map((stat) => (
          <Card key={stat.label} className="glass-card hover:shadow-xl transition-all">
            <CardContent className="p-4">
              {(stat.usersLoading ? usersLoading : itemsLoading) ? renderStatSkeleton() : (
                <div className="flex flex-col items-center text-center">
                  <div className={`p-2 rounded-full ${stat.bg} mb-2`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-xl md:text-2xl font-bold">{stat.count}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kondisi Aset Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card className="glass-card border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all">
          <CardContent className="p-4">
            {itemsLoading ? renderStatSkeleton() : (
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-blue-600">{andalCount}</p>
                  <p className="text-xs text-muted-foreground">🟢 Material Bekas Handal</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="glass-card border-orange-200 dark:border-orange-800 hover:shadow-xl transition-all">
          <CardContent className="p-4">
            {itemsLoading ? renderStatSkeleton() : (
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <Trash2 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-orange-600">{limbahCount}</p>
                  <p className="text-xs text-muted-foreground">🔴 Material Limbah</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="col-span-1">
          <ApprovalRateCard approvedCount={approvedCount} totalCount={items.length} loading={itemsLoading} />
        </div>

        {/* Recent Activity */}
        <Card className="glass-card h-full col-span-1">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/inventory">Lihat Semua<ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-[140px]" />
                      <Skeleton className="h-3 w-[80px]" />
                    </div>
                    <Skeleton className="h-5 w-[60px] rounded-full" />
                  </div>
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="space-y-3">
                {items.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="Item" className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{getItemDisplayName(item)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.kondisi && (
                        <Badge className={item.kondisi === 'andal' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'} variant="secondary">
                          {item.kondisi === 'andal' ? '🟢' : '🔴'}
                        </Badge>
                      )}
                      <Badge variant={item.status === 'approved' ? 'default' : item.status === 'rejected' ? 'destructive' : 'secondary'} className="text-xs">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Belum ada data barang</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & QR */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/input-barang">
                  <Plus className="h-5 w-5 text-primary" />
                  <span className="text-xs">Input Barang</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/approval">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-xs">Approval</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/users">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-xs">Kelola User</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/reports">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  <span className="text-xs">Laporan</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <ExcelDownloadCard />
      </div>
    </div>
  );
}
