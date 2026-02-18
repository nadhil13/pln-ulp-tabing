import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Package,
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Filter,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMyItems } from '@/hooks/useInventory';
import { 
  InventoryItem, 
  JENIS_BARANG_LABELS, 
  JENIS_BARANG_OPTIONS,
  STATUS_LABELS,
  KONDISI_LABELS,
} from '@/types';

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

const getItemDetails = (item: InventoryItem): { label: string; value: string }[] => {
  const details: { label: string; value: string }[] = [
    { label: 'Jenis Barang', value: JENIS_BARANG_LABELS[item.jenisBarang] },
    { label: 'Lokasi', value: item.lokasi },
  ];

  switch (item.jenisBarang) {
    case 'tiang':
      details.push(
        { label: 'ID Tiang', value: item.idTiang },
        { label: 'Volume', value: `${item.volume} unit` },
        { label: 'Tinggi', value: `${item.tinggi} meter` },
        { label: 'Material', value: item.material },
      );
      break;
    case 'kwh_meter':
      details.push(
        { label: 'ID Meter', value: item.idMeter },
        { label: 'Merek', value: item.merek },
        { label: 'Nomor Segel', value: item.nomorSegel },
      );
      break;
    case 'kabel':
      details.push(
        { label: 'Deskripsi', value: item.description },
        { label: 'Panjang', value: `${item.length} meter` },
      );
      break;
    case 'material_umum':
      details.push(
        { label: 'Nama Material', value: item.namaMaterial },
        { label: 'Jumlah', value: `${item.jumlah} ${item.satuanMaterial || 'BH'}` },
        ...(item.serialNumber ? [{ label: 'Serial Number', value: item.serialNumber }] : []),
        ...(item.kategoriMaterial ? [{ label: 'Kategori', value: item.kategoriMaterial }] : []),
      );
      break;
  }

  return details;
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
    case 'approved':
      return '🟢';
    case 'rejected':
      return '🔴';
    default:
      return '🟡';
  }
};

export default function MyItems() {
  const { items, loading, error } = useMyItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [jenisFilter, setJenisFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const filteredItems = items.filter((item) => {
    const displayName = getItemDisplayName(item);
    const matchesSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesJenis = jenisFilter === 'all' || item.jenisBarang === jenisFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesJenis && matchesStatus;
  });

  const pendingCount = items.filter(i => i.status === 'pending').length;
  const approvedCount = items.filter(i => i.status === 'approved').length;
  const rejectedCount = items.filter(i => i.status === 'rejected').length;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const renderStatsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg hidden md:block" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-10 mx-auto md:mx-0" />
                <Skeleton className="h-3 w-16 mx-auto md:mx-0" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderItemsSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
          <Skeleton className="h-14 w-14 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-3 w-[40%]" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Inventaris Saya</h1>
          <p className="text-sm text-muted-foreground">
            Daftar barang yang Anda input ke sistem
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto h-12 min-h-[44px] text-base rounded-xl">
          <Link to="/input-barang">
            <Plus className="mr-2 h-5 w-5" />
            Input Barang Baru
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {loading ? renderStatsSkeleton() : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
          <Card className="border-yellow-200/50 dark:border-yellow-800/30">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                <div className="p-2 md:p-3 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xl md:text-2xl font-bold">{pendingCount}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200/50 dark:border-green-800/30">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                <div className="p-2 md:p-3 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xl md:text-2xl font-bold">{approvedCount}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Disetujui</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200/50 dark:border-red-800/30">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                <div className="p-2 md:p-3 rounded-lg bg-red-500/10">
                  <XCircle className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xl md:text-2xl font-bold">{rejectedCount}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Ditolak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-3 md:p-6">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari barang atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={jenisFilter} onValueChange={setJenisFilter}>
                <SelectTrigger className="h-11 text-sm">
                  <SelectValue placeholder="Semua Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  {JENIS_BARANG_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 text-sm">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Daftar Barang
            <Badge variant="secondary" className="ml-2">{filteredItems.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
          {loading ? (
            renderItemsSkeleton()
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>{error}</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Barang</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt="Item"
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <span className="font-medium">{getItemDisplayName(item)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{JENIS_BARANG_LABELS[item.jenisBarang]}</Badge>
                        </TableCell>
                        <TableCell>{item.lokasi}</TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClass(item.status)}>
                            {STATUS_LABELS[item.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDetailDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards - Fully redesigned */}
              <div className="md:hidden space-y-3">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full text-left rounded-xl border bg-card p-4 hover:bg-accent/50 active:scale-[0.98] transition-all"
                    onClick={() => {
                      setSelectedItem(item);
                      setShowDetailDialog(true);
                    }}
                  >
                    <div className="flex gap-3">
                      {/* Image */}
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt="Item"
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Row 1: Nama Barang (Bold) */}
                        <h3 className="font-semibold text-[15px] leading-tight truncate">
                          {getItemDisplayName(item)}
                        </h3>

                        {/* Row 2: Lokasi (Badge) • Jumlah */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-xs gap-1 px-2 py-0.5">
                            <MapPin className="h-3 w-3" />
                            {item.lokasi}
                          </Badge>
                          {item.jenisBarang === 'material_umum' && item.jumlah && (
                            <span className="text-xs text-muted-foreground">
                              {item.jumlah} {item.satuanMaterial || 'BH'}
                            </span>
                          )}
                        </div>

                        {/* Row 3: Status Badge */}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`text-xs ${getStatusBadgeClass(item.status)}`}>
                            {getStatusIcon(item.status)} {STATUS_LABELS[item.status]}
                          </Badge>
                        </div>

                        {/* Row 4: Tanggal */}
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {formatDate(item.createdAt)}
                        </p>

                        {/* Rejection note if rejected */}
                        {item.status === 'rejected' && item.rejectionNote && (
                          <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <p className="text-xs text-red-600 dark:text-red-400 line-clamp-2">
                              ❌ {item.rejectionNote}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Belum ada barang</p>
              <p className="text-sm mb-4">Mulai input barang pertama Anda</p>
              <Button asChild className="h-12 min-h-[44px] text-base rounded-xl">
                <Link to="/input-barang">
                  <Plus className="mr-2 h-5 w-5" />
                  Input Barang
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog - Mobile optimized */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto sm:rounded-xl">
          <DialogHeader>
            <DialogTitle>Detail Barang</DialogTitle>
            <DialogDescription>
              Informasi lengkap barang yang Anda input
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              {/* Show all uploaded photos */}
              {(selectedItem.imageUrls && selectedItem.imageUrls.length > 0) ? (
                <div className="space-y-2">
                  {selectedItem.imageUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Item ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  ))}
                </div>
              ) : selectedItem.imageUrl ? (
                <img
                  src={selectedItem.imageUrl}
                  alt="Item"
                  className="w-full h-48 object-cover rounded-xl"
                />
              ) : null}
              
              {/* Item name prominent */}
              <div className="text-center pb-2 border-b">
                <h3 className="text-lg font-bold">{getItemDisplayName(selectedItem)}</h3>
                <Badge className={`mt-2 ${getStatusBadgeClass(selectedItem.status)}`}>
                  {getStatusIcon(selectedItem.status)} {STATUS_LABELS[selectedItem.status]}
                </Badge>
              </div>

              <div className="space-y-3">
                {getItemDetails(selectedItem).map((detail, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">{detail.label}</span>
                    <span className="font-medium text-right max-w-[60%]">{detail.value}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">Tanggal Input</span>
                  <span className="font-medium">{formatDate(selectedItem.createdAt)}</span>
                </div>
                {selectedItem.kondisi && (
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">Kondisi</span>
                    <span className="font-medium">
                      {selectedItem.kondisi === 'andal' ? '🟢 Bekas Handal' : '🔴 Limbah'}
                    </span>
                  </div>
                )}
                {selectedItem.status === 'rejected' && selectedItem.rejectionNote && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">Alasan Penolakan:</p>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">{selectedItem.rejectionNote}</p>
                  </div>
                )}
                {selectedItem.status === 'approved' && selectedItem.verifiedByName && (
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">Diverifikasi oleh</span>
                    <span className="font-medium">{selectedItem.verifiedByName}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
