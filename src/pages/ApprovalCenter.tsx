import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  XCircle,
  Eye,
  Search,
  FileSpreadsheet,
  FileText,
  Clock,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePendingItems } from '@/hooks/useInventory';
import { 
  InventoryItem, 
  JENIS_BARANG_LABELS,
  JENIS_BARANG_OPTIONS,
} from '@/types';
import * as XLSX from 'xlsx';
import { MATERIAL_CATEGORIES } from '@/lib/constants/materials';

// Helper to get item display name
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

// Helper to get item details for display
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

export default function ApprovalCenter() {
  const { isRole } = useAuth();
  const { items, loading: itemsLoading, updateItemStatus } = usePendingItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [jenisFilter, setJenisFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const isVerifikator = isRole('verifikator');

  const filteredItems = items.filter((item) => {
    const displayName = getItemDisplayName(item);
    const matchesSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.createdByName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesJenis = jenisFilter === 'all' || 
      (item.jenisBarang === 'material_umum' && (item as any).kategoriMaterial === jenisFilter) ||
      item.jenisBarang === jenisFilter;
    return matchesSearch && matchesJenis;
  });

  const handleApprove = async (item: InventoryItem) => {
    setActionLoading(true);
    try {
      await updateItemStatus(item.id, 'approved');
      toast.success(`${getItemDisplayName(item)} berhasil disetujui!`);
      setShowDetailDialog(false);
    } catch (error) {
      toast.error('Gagal menyetujui barang');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    if (!rejectionNote.trim()) {
      toast.error('Mohon isi alasan penolakan');
      return;
    }

    setActionLoading(true);
    try {
      await updateItemStatus(selectedItem.id, 'rejected', rejectionNote);
      toast.success(`${getItemDisplayName(selectedItem)} ditolak`);
      setRejectionNote('');
      setShowRejectDialog(false);
      setShowDetailDialog(false);
    } catch (error) {
      toast.error('Gagal menolak barang');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowRejectDialog(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const handleExportExcel = () => {
    if (filteredItems.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const exportData = filteredItems.map((item) => ({
      'Jenis Barang': JENIS_BARANG_LABELS[item.jenisBarang],
      'Nama/ID': getItemDisplayName(item),
      'Lokasi': item.lokasi,
      'Diinput Oleh': item.createdByName,
      'Tanggal': formatDate(item.createdAt),
      'Status': 'Pending',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pending Items');
    XLSX.writeFile(wb, `PLN_Pending_Items_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success('Data berhasil diekspor ke Excel');
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Approval Center</h1>
          <p className="text-muted-foreground">
            Verifikasi dan kelola barang masuk dari Staff
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export</span> Excel
          </Button>
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export</span> PDF
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-3 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari barang atau staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 text-base w-full"
              />
            </div>
            <Select value={jenisFilter} onValueChange={setJenisFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter kategori" />
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

      {/* Pending Items */}
      <Card className="overflow-hidden">
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-2xl">
            <Clock className="h-5 w-5 text-warning flex-shrink-0" />
            <span className="truncate">Barang Menunggu Verifikasi</span>
            <Badge variant="secondary" className="ml-auto flex-shrink-0">{filteredItems.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
          {itemsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredItems.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Nama/ID</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {JENIS_BARANG_LABELS[item.jenisBarang]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {getItemDisplayName(item)}
                        </TableCell>
                        <TableCell>{item.lokasi}</TableCell>
                        <TableCell>{item.createdByName}</TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
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
                            {isVerifikator && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApprove(item)}
                                  disabled={actionLoading}
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Setuju
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openRejectDialog(item)}
                                  disabled={actionLoading}
                                >
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Tolak
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredItems.map((item) => (
                  <div key={item.id} className="w-full rounded-xl border bg-card p-3 shadow-sm overflow-hidden">
                    <div className="flex gap-3 min-w-0 w-full">
                      {/* Thumbnail */}
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt="Item"
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Clock className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm leading-tight truncate max-w-full">{getItemDisplayName(item)}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.lokasi}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.createdByName} • {formatDate(item.createdAt)}
                        </p>
                        <Badge variant="outline" className="text-[10px] mt-1.5">
                          {JENIS_BARANG_LABELS[item.jenisBarang]}
                        </Badge>
                      </div>
                    </div>

                    {/* Action buttons - stacked for mobile */}
                    <div className="mt-3 space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-10 min-h-[44px]"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowDetailDialog(true);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </Button>
                      {isVerifikator && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-11 min-h-[44px]"
                            onClick={() => openRejectDialog(item)}
                            disabled={actionLoading}
                          >
                            <XCircle className="mr-1.5 h-4 w-4" />
                            Tolak
                          </Button>
                          <Button
                            size="sm"
                            className="h-11 min-h-[44px] bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90 text-[hsl(var(--success-foreground))]"
                            onClick={() => handleApprove(item)}
                            disabled={actionLoading}
                          >
                            <CheckCircle className="mr-1.5 h-4 w-4" />
                            Setuju
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Semua barang sudah diverifikasi</p>
              <p className="text-sm">Tidak ada barang yang menunggu approval</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Detail Barang</DialogTitle>
            <DialogDescription>
              Informasi lengkap barang yang akan diverifikasi
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.imageUrl && (
                <img
                  src={selectedItem.imageUrl}
                  alt="Item"
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div className="grid gap-3">
                {getItemDetails(selectedItem).map((detail, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-muted-foreground">{detail.label}:</span>
                    <span className="font-medium text-right max-w-[60%]">{detail.value}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diinput oleh:</span>
                  <span className="font-medium">{selectedItem.createdByName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal:</span>
                  <span className="font-medium">{formatDate(selectedItem.createdAt)}</span>
                </div>
              </div>

              {isVerifikator && (
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openRejectDialog(selectedItem)}
                    disabled={actionLoading}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Tolak
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedItem)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Setujui
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Barang</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk {selectedItem && getItemDisplayName(selectedItem)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Masukkan alasan penolakan..."
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionNote('');
              }}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Tolak Barang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
