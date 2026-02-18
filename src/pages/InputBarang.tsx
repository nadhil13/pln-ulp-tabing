import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useInventory } from '@/hooks/useInventory';
import { useMaterials, type Material } from '@/hooks/useMaterials';
import { uploadMultipleToCloudinary } from '@/lib/cloudinary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { ArrowLeft, Upload, X, Loader2, CheckCircle, ImageIcon, Package, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { LOCATIONS, KONDISI_LABELS } from '@/types';
import { SmartMaterialSelect } from '@/components/SmartMaterialSelect';

const SATUAN_OPTIONS = ['BH', 'M', 'SET', 'LTR', 'KG', 'ROL', 'BTG', 'U', 'KLG', 'PSG', 'TBE', 'CEL'] as const;

export default function InputBarang() {
  const { userData, isRole } = useAuth();
  const navigate = useNavigate();
  const { addItem } = useInventory();
  const { materials, categories, addMaterial } = useMaterials();

  // Selection state
  const [selectedNoMaterial, setSelectedNoMaterial] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | undefined>();
  const isNewItem = selectedNoMaterial === 'NEW_ITEM_MANUAL';

  // New material manual fields
  const [newNama, setNewNama] = useState('');
  const [newNo, setNewNo] = useState('');
  const [newSatuan, setNewSatuan] = useState('BH');
  const [newKategori, setNewKategori] = useState('');

  // Common fields
  const [jumlah, setJumlah] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [kondisi, setKondisi] = useState<'andal' | 'limbah'>('andal');
  const [catatan, setCatatan] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const jumlahInputRef = useRef<HTMLInputElement>(null);

  // Check access
  useEffect(() => {
    if (!isRole(['staff', 'verifikator', 'admin_gudang'])) {
      toast.error('Anda tidak memiliki akses ke halaman ini');
      navigate('/dashboard');
    }
  }, [isRole, navigate]);

  const handleMaterialSelect = (value: string, material?: Material) => {
    setSelectedNoMaterial(value);
    setSelectedMaterial(material);
    if (value !== 'NEW_ITEM_MANUAL') {
      // Reset new material fields
      setNewNama('');
      setNewNo('');
      setNewSatuan('BH');
      setNewKategori('');
      // Auto-focus jumlah
      setTimeout(() => jumlahInputRef.current?.focus(), 200);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    const validFiles = newFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} melebihi 5MB`);
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) return;

    setImageFiles(prev => [...prev, ...validFiles]);
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Resolve the final material info
  const getFinalMaterial = (): Material | null => {
    if (isNewItem) {
      if (!newNama.trim() || !newNo.trim()) return null;
      return { noMaterial: newNo.trim(), namaMaterial: newNama.trim(), satuan: newSatuan, kategori: newKategori || 'Material Umum' };
    }
    return selectedMaterial || null;
  };

  const validateForm = (): boolean => {
    if (!selectedNoMaterial) { toast.error('Pilih material'); return false; }
    if (isNewItem) {
      if (!newNama.trim()) { toast.error('Isi Nama Material Baru'); return false; }
      if (!newNo.trim()) { toast.error('Isi No. Material Baru'); return false; }
    }
    if (!jumlah || Number(jumlah) < 1) { toast.error('Jumlah minimal 1'); return false; }
    if (!lokasi) { toast.error('Pilih lokasi gudang'); return false; }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    try {
      const mat = getFinalMaterial()!;
      let imageUrl: string | undefined;
      let imageUrls: string[] = [];

      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadMultipleToCloudinary(imageFiles);
        if (uploadedUrls.length > 0) {
          imageUrl = uploadedUrls[0];
          imageUrls = uploadedUrls;
        } else {
          toast.error('Gagal upload foto. Data tetap disimpan.');
        }
      }

      const itemData: any = {
        jenisBarang: 'material_umum',
        namaMaterial: mat.namaMaterial,
        noMaterial: mat.noMaterial,
        satuanMaterial: mat.satuan,
        kategoriMaterial: mat.kategori,
        jumlah: Number(jumlah),
        lokasi,
        kondisi,
        catatan: catatan || '',
        imageUrl,
        imageUrls,
      };

      // Double Action Save: if new material, save to both collections
      if (isNewItem) {
        await Promise.all([
          addItem(itemData),
          addMaterial(mat),
        ]);
        toast.success('Barang & Master Material baru berhasil disimpan!', {
          description: 'Material baru langsung tersedia di Combobox untuk semua staff.',
        });
      } else {
        await addItem(itemData);
        toast.success('Barang berhasil diinput!', {
          description: 'Data sedang menunggu verifikasi.',
        });
      }

      navigate('/my-items');
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const finalMat = getFinalMaterial();
  const confirmationDetails = [
    { label: 'Nama Material', value: finalMat?.namaMaterial || '-' },
    { label: 'No Material', value: finalMat?.noMaterial?.slice(-8) || '-' },
    { label: 'Kategori', value: finalMat?.kategori || '-' },
    { label: 'Satuan', value: finalMat?.satuan || '-' },
    { label: 'Jumlah', value: `${jumlah} ${finalMat?.satuan || 'BH'}` },
    { label: 'Lokasi', value: lokasi },
    { label: 'Kondisi', value: KONDISI_LABELS[kondisi] },
    ...(catatan ? [{ label: 'Catatan', value: catatan }] : []),
    ...(imageFiles.length > 0 ? [{ label: 'Foto', value: `${imageFiles.length} file` }] : []),
  ];

  return (
    <div className="w-full max-w-[100vw] md:max-w-4xl mx-auto animate-fade-in pb-24 md:pb-8 px-3 md:px-0 overflow-x-hidden box-border">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link to="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Input Barang Baru</h1>
          <p className="text-sm text-muted-foreground">
            Masukkan data material ke inventaris gudang
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Form Input Material
          </CardTitle>
          <CardDescription>
            Cari material dari database PLN atau tambah material baru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6 w-full min-w-0">
            {/* 1. Smart Material Select */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Nama Material *</Label>
              <SmartMaterialSelect
                materials={materials}
                categories={categories}
                value={selectedNoMaterial}
                onSelect={handleMaterialSelect}
              />
              {selectedMaterial && !isNewItem && (
                <div className="flex gap-2 flex-wrap mt-1 max-w-full overflow-hidden">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary truncate max-w-[200px]">
                    {selectedMaterial.kategori}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    Satuan: {selectedMaterial.satuan}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground break-all">
                    No: ...{selectedMaterial.noMaterial.slice(-8)}
                  </span>
                </div>
              )}
            </div>

            {/* 2. New Material Fields (Collapsible) */}
            <Collapsible open={isNewItem}>
              <CollapsibleContent className="space-y-4 border-l-4 border-primary/30 pl-4 py-3 bg-primary/5 rounded-r-lg transition-all">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <PlusCircle className="h-4 w-4" />
                  Data Material Baru
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nama Material Baru *</Label>
                  <Input
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    placeholder="Contoh: Kabel NYY 4x95mm2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">No. Material Baru *</Label>
                  <Input
                    value={newNo}
                    onChange={(e) => setNewNo(e.target.value)}
                    placeholder="Contoh: 000000000003110099"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Satuan *</Label>
                    <Select value={newSatuan} onValueChange={setNewSatuan}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SATUAN_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Kategori *</Label>
                    <Select value={newKategori} onValueChange={setNewKategori}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Desktop 2-Column Layout: Left=Info, Right=Photo & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 w-full min-w-0">
              {/* LEFT COLUMN: Info Barang */}
              <div className="space-y-5 min-w-0 w-full">
                {/* 3. Jumlah */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Jumlah ({(isNewItem ? newSatuan : selectedMaterial?.satuan) || 'Unit'}) *
                  </Label>
                  <Input
                    ref={jumlahInputRef}
                    type="number"
                    min="1"
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value)}
                    placeholder="0"
                    className="h-12 text-base"
                  />
                </div>

                {/* 4. Kondisi */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Kondisi Barang *</Label>
                  <RadioGroup
                    value={kondisi}
                    onValueChange={(v) => setKondisi(v as 'andal' | 'limbah')}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <label
                      htmlFor="kondisi-andal"
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        kondisi === 'andal'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-muted hover:border-green-300'
                      }`}
                    >
                      <RadioGroupItem value="andal" id="kondisi-andal" />
                      <div>
                        <p className="font-medium text-sm">🟢 Material Bekas Handal</p>
                        <p className="text-xs text-muted-foreground">Layak pakai / baru</p>
                      </div>
                    </label>
                    <label
                      htmlFor="kondisi-limbah"
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        kondisi === 'limbah'
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-muted hover:border-red-300'
                      }`}
                    >
                      <RadioGroupItem value="limbah" id="kondisi-limbah" />
                      <div>
                        <p className="font-medium text-sm">🔴 Material Limbah</p>
                        <p className="text-xs text-muted-foreground">Rusak / afkir / bekas</p>
                      </div>
                    </label>
                  </RadioGroup>
                </div>

                {/* 6. Catatan */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Catatan (Opsional)</Label>
                  <Textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Catatan tambahan, misal: kondisi fisik, spesifikasi khusus..."
                    rows={3}
                    className="text-base min-h-[48px]"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: Photo & Location */}
              <div className="space-y-5 min-w-0 w-full">
                {/* 5. Lokasi */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Lokasi Gudang *</Label>
                  <Select value={lokasi} onValueChange={setLokasi}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Pilih lokasi gudang" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 7. Multi Image Upload */}
                <div className="space-y-3 w-full min-w-0">
                  <Label className="text-sm font-semibold">Bukti Foto</Label>
                  <p className="text-xs text-muted-foreground">Upload foto barang (bisa lebih dari 1)</p>

                  <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer w-full">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                      key={`upload-${imageFiles.length}`}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer block">
                      <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground mb-1" />
                      <p className="text-sm text-muted-foreground">
                        {imageFiles.length === 0 ? 'Klik untuk upload foto' : `Tambah foto lagi (${imageFiles.length} terpilih)`}
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG maksimal 5MB per file</p>
                    </label>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-3 max-w-full">
                      {imagePreviews.map((src, index) => (
                        <div key={index} className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                          <img src={src} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shadow-md"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit - Desktop */}
            <div className="hidden md:flex gap-3 pt-4">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/dashboard">Batal</Link>
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                <Upload className="mr-2 h-4 w-4" />
                Simpan Barang
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Sticky Bottom Button - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t shadow-[0_-4px_12px_rgba(0,0,0,0.1)] md:hidden z-40">
        <Button
          onClick={handleSubmit as any}
          className="w-full h-14 text-base font-semibold rounded-xl"
          disabled={loading}
        >
          <Upload className="mr-2 h-5 w-5" />
          Simpan Barang
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Input Barang</DialogTitle>
            <DialogDescription>
              Pastikan data yang Anda masukkan sudah benar.
              {isNewItem && (
                <span className="block mt-1 text-primary font-medium">
                  ⚡ Material baru akan otomatis tersimpan ke database master.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {confirmationDetails.map((detail, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-muted-foreground">{detail.label}:</span>
                <span className="font-medium text-right max-w-[60%] truncate">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={loading}
            >
              Kembali
            </Button>
            <Button onClick={confirmSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Konfirmasi
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
