import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { InventoryItem, LOCATIONS } from '@/types';

interface EditItemDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (itemId: string, data: Partial<InventoryItem>) => Promise<void>;
}

export function EditItemDialog({ item, open, onOpenChange, onSave }: EditItemDialogProps) {
  const [jumlah, setJumlah] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      const vol = item.jenisBarang === 'material_umum' ? (item as any).jumlah
        : item.jenisBarang === 'kabel' ? (item as any).length
        : item.jenisBarang === 'tiang' ? (item as any).volume
        : (item as any).jumlah || '';
      setJumlah(String(vol || ''));
      setLokasi(item.lokasi || '');
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    if (!jumlah || Number(jumlah) < 0) {
      toast.error('Jumlah tidak valid');
      return;
    }
    if (!lokasi) {
      toast.error('Pilih lokasi');
      return;
    }

    setSaving(true);
    try {
      const updateData: any = { lokasi };
      if (item.jenisBarang === 'material_umum') updateData.jumlah = Number(jumlah);
      else if (item.jenisBarang === 'kabel') updateData.length = Number(jumlah);
      else if (item.jenisBarang === 'tiang') updateData.volume = Number(jumlah);
      else updateData.jumlah = Number(jumlah);

      await onSave(item.id, updateData);
      toast.success('Data berhasil diperbarui');
      onOpenChange(false);
    } catch {
      toast.error('Gagal memperbarui data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Barang</DialogTitle>
          <DialogDescription>Ubah jumlah atau lokasi penyimpanan</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Jumlah</Label>
            <Input type="number" min="0" value={jumlah} onChange={(e) => setJumlah(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Lokasi</Label>
            <Select value={lokasi} onValueChange={setLokasi}>
              <SelectTrigger><SelectValue placeholder="Pilih lokasi" /></SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Batal</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : <><Save className="mr-2 h-4 w-4" />Simpan</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
