import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
 } from '@/components/ui/alert-dialog';
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
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Trash2,
  Pencil,
  Filter,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAllItems } from '@/hooks/useInventory';
import { useAuth } from '@/contexts/AuthContext';
import { useMaterials } from '@/hooks/useMaterials';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  InventoryItem, 
  KondisiBarang,
  JENIS_BARANG_LABELS, 
  JENIS_BARANG_OPTIONS,
  STATUS_LABELS,
  KONDISI_LABELS,
} from '@/types';
import { exportToExcel, exportToPDF } from '@/lib/export-utils';
import { EditItemDialog } from '@/components/dashboard/EditItemDialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';

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
    { label: 'Kondisi', value: KONDISI_LABELS[item.kondisi] || '-' },
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
        { label: 'Jumlah', value: `${item.jumlah || '-'} unit` },
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
        ...(item.catatan ? [{ label: 'Catatan', value: item.catatan }] : []),
      );
      break;
  }

  return details;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-yellow-500" />;
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

const getKondisiBadge = (kondisi?: KondisiBarang) => {
  if (!kondisi) return <Badge variant="outline">-</Badge>;
  if (kondisi === 'andal') {
    return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">🟢 Bekas Handal</Badge>;
  }
  return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">🔴 Limbah</Badge>;
};

export default function Inventory() {
  const { isRole } = useAuth();
  const { items, loading, error, updateItem, deleteItem } = useAllItems();
  const { categories: dynamicCategories } = useMaterials();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [jenisFilter, setJenisFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kondisiTab, setKondisiTab] = useState<string>('semua');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Only admin can access this page
  if (!isRole('admin_gudang')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold">Akses Ditolak</h2>
            <p className="text-muted-foreground">
              Halaman ini hanya dapat diakses oleh Admin Gudang
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter by kondisi tab first
  const tabFilteredItems = kondisiTab === 'semua' 
    ? items 
    : items.filter(i => i.kondisi === kondisiTab);

  const filteredItems = tabFilteredItems.filter((item) => {
    const displayName = getItemDisplayName(item);
    const matchesSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.createdByName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesJenis = jenisFilter === 'all' || 
      (item.jenisBarang === 'material_umum' && (item as any).kategoriMaterial === jenisFilter) ||
      item.jenisBarang === jenisFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesJenis && matchesStatus;
  });

  const andalCount = items.filter(i => i.kondisi === 'andal').length;
  const limbahCount = items.filter(i => i.kondisi === 'limbah').length;
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

  const handleExportExcel = () => {
    if (filteredItems.length === 0) {
      toast.error('Tidak ada data untuk diexport');
      return;
    }
    exportToExcel(filteredItems);
    toast.success('File Excel berhasil diunduh');
  };

  const handleExportPDF = () => {
    if (filteredItems.length === 0) {
      toast.error('Tidak ada data untuk diexport');
      return;
    }
    exportToPDF(filteredItems);
    toast.success('File PDF berhasil diunduh');
  };

  const renderSkeletonTable = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[120px]" />
          </div>
          <Skeleton className="h-6 w-[80px] rounded-full" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Semua Inventaris</h1>
          <p className="text-sm text-muted-foreground">
            Kelola seluruh barang dalam gudang
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export</span> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export</span> PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
        <Card>
          <CardContent className="p-3 md:pt-6 md:p-6">
            <div className="text-center">
              <p className="text-lg md:text-2xl font-bold">{loading ? '-' : items.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-3 md:pt-6 md:p-6">
            <div className="text-center">
              <p className="text-lg md:text-2xl font-bold text-blue-600">{loading ? '-' : andalCount}</p>
              <p className="text-xs text-muted-foreground">🟢 Bekas Handal</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="p-3 md:pt-6 md:p-6">
            <div className="text-center">
              <p className="text-lg md:text-2xl font-bold text-orange-600">{loading ? '-' : limbahCount}</p>
              <p className="text-xs text-muted-foreground">🔴 Limbah</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:pt-6 md:p-6">
            <div className="text-center">
              <p className="text-lg md:text-2xl font-bold text-yellow-600">{loading ? '-' : pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 md:col-span-1">
          <CardContent className="p-3 md:pt-6 md:p-6">
            <div className="text-center">
              <p className="text-lg md:text-2xl font-bold text-green-600">{loading ? '-' : approvedCount}</p>
              <p className="text-xs text-muted-foreground">Disetujui</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kondisi Tabs */}
      <Tabs value={kondisiTab} onValueChange={setKondisiTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="semua" className="text-xs md:text-sm">
            <Package className="mr-1.5 h-4 w-4" />
            Semua Data
          </TabsTrigger>
          <TabsTrigger value="andal" className="text-xs md:text-sm">
            <ShieldCheck className="mr-1.5 h-4 w-4" />
            Stok Bekas Handal
          </TabsTrigger>
          <TabsTrigger value="limbah" className="text-xs md:text-sm">
            <Trash2 className="mr-1.5 h-4 w-4" />
            Gudang Limbah
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 md:pt-6 md:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari barang, lokasi, atau staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              {/* Mobile: Filter button opens Sheet */}
              <div className="md:hidden">
                <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-12 w-12 relative">
                      <Filter className="h-5 w-5" />
                      {(jenisFilter !== 'all' || statusFilter !== 'all') && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-2xl">
                    <SheetHeader>
                      <SheetTitle>Filter Inventaris</SheetTitle>
                      <SheetDescription>Pilih kategori dan status untuk menyaring data</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 pt-4 pb-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Kategori Material</Label>
                        <Select value={jenisFilter} onValueChange={(v) => { setJenisFilter(v); }}>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Semua Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {dynamicCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Status</Label>
                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); }}>
                          <SelectTrigger className="h-12 text-base">
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
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" className="flex-1 h-12" onClick={() => { setJenisFilter('all'); setStatusFilter('all'); }}>
                          Reset
                        </Button>
                        <Button className="flex-1 h-12" onClick={() => setShowFilterSheet(false)}>
                          Terapkan
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            {/* Desktop: inline filter dropdowns */}
            <div className="hidden md:grid md:grid-cols-2 gap-2">
              <Select value={jenisFilter} onValueChange={setJenisFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {dynamicCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Status" />
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
            Daftar Inventaris
            <Badge variant="secondary" className="ml-2">{filteredItems.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
          {loading ? (
            renderSkeletonTable()
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>{error}</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <>
              {/* Desktop Table with horizontal scroll */}
              <div className="hidden lg:block overflow-x-auto -mx-3 md:-mx-6">
                <div className="min-w-[900px] px-3 md:px-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#163C93] hover:bg-[#163C93]">
                        <TableHead className="text-white font-semibold">Barang</TableHead>
                        <TableHead className="text-white font-semibold">Jenis</TableHead>
                        <TableHead className="text-white font-semibold">Kondisi</TableHead>
                        <TableHead className="text-white font-semibold">Lokasi</TableHead>
                        <TableHead className="text-white font-semibold">Staff</TableHead>
                        <TableHead className="text-white font-semibold">Tanggal</TableHead>
                        <TableHead className="text-white font-semibold">Status</TableHead>
                        <TableHead className="text-right text-white font-semibold">Aksi</TableHead>
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
                          <TableCell>{getKondisiBadge(item.kondisi)}</TableCell>
                          <TableCell>{item.lokasi}</TableCell>
                          <TableCell>{item.createdByName}</TableCell>
                          <TableCell>{formatDate(item.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(item.status)}
                              <Badge className={getStatusBadgeClass(item.status)}>
                                {STATUS_LABELS[item.status]}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowDetailDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditItem(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteTarget(item)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-3">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt="Item"
                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-medium text-sm truncate">{getItemDisplayName(item)}</h3>
                              <p className="text-xs text-muted-foreground truncate">{item.lokasi}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-11 w-11 min-h-[44px] min-w-[44px] flex-shrink-0"
                              onClick={() => {
                                setSelectedItem(item);
                                setShowDetailDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {JENIS_BARANG_LABELS[item.jenisBarang]}
                            </Badge>
                            {getKondisiBadge(item.kondisi)}
                            <Badge className={`text-xs ${getStatusBadgeClass(item.status)}`}>
                              {STATUS_LABELS[item.status]}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground">
                              {item.createdByName} • {formatDate(item.createdAt)}
                            </p>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-11 w-11 min-h-[44px] min-w-[44px]" onClick={() => setEditItem(item)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-11 w-11 min-h-[44px] min-w-[44px] text-destructive hover:text-destructive" onClick={() => setDeleteTarget(item)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Tidak ada data</p>
              <p className="text-sm">
                {kondisiTab !== 'semua' 
                  ? `Belum ada barang dengan kondisi ${kondisiTab === 'andal' ? 'Material Bekas Handal' : 'Material Limbah'}`
                  : 'Belum ada barang yang diinput ke sistem'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Barang</DialogTitle>
            <DialogDescription>
              Informasi lengkap inventaris
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
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              ) : selectedItem.imageUrl ? (
                <img
                  src={selectedItem.imageUrl}
                  alt="Item"
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : null}
              
              <div className="space-y-3">
                {getItemDetails(selectedItem).map((detail, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{detail.label}:</span>
                    <span className="font-medium text-right max-w-[60%]">{detail.value}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Diinput oleh:</span>
                  <span className="font-medium">{selectedItem.createdByName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tanggal:</span>
                  <span className="font-medium">{formatDate(selectedItem.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kondisi:</span>
                  {getKondisiBadge(selectedItem.kondisi)}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getStatusBadgeClass(selectedItem.status)}>
                    {STATUS_LABELS[selectedItem.status]}
                  </Badge>
                </div>
                {selectedItem.status === 'approved' && selectedItem.verifiedByName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Diverifikasi oleh:</span>
                    <span className="font-medium">{selectedItem.verifiedByName}</span>
                  </div>
                )}
                {selectedItem.status === 'rejected' && selectedItem.rejectionNote && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">Alasan Penolakan:</p>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">{selectedItem.rejectionNote}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <EditItemDialog
        item={editItem}
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        onSave={async (itemId, data) => {
          await updateItem(itemId, data);
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Barang?</AlertDialogTitle>
            <AlertDialogDescription>
              Data "{deleteTarget ? getItemDisplayName(deleteTarget) : ''}" akan dihapus permanen dari sistem. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteTarget) {
                  try {
                    await deleteItem(deleteTarget.id);
                    toast.success('Barang berhasil dihapus');
                  } catch {
                    toast.error('Gagal menghapus barang');
                  }
                  setDeleteTarget(null);
                }
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
