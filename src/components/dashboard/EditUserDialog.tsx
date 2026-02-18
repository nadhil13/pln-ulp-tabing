import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { User, UserRole, ROLE_LABELS } from '@/types';
import { useUsers } from '@/hooks/useUsers';
import { z } from 'zod';

const emailSchema = z.string().trim().email('Format email tidak valid').max(255, 'Email terlalu panjang');

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const { updateUser } = useUsers();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setActive(user.active);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user || !name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }
    setSaving(true);
    const result = await updateUser(user.uid, { name: name.trim(), email: emailResult.data, role, active });
    if (result.success) {
      toast.success('Data pengguna berhasil diperbarui');
      onOpenChange(false);
    } else {
      toast.error('Gagal memperbarui data pengguna');
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Pengguna</DialogTitle>
          <DialogDescription>Perbarui informasi akun pengguna</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Lengkap</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <p className="text-xs text-muted-foreground">Perubahan email hanya berlaku di Firestore</p>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="verifikator">Verifikator</SelectItem>
                <SelectItem value="admin_gudang">Admin Gudang</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Status Akun</Label>
              <p className="text-xs text-muted-foreground">{active ? 'Akun aktif' : 'Akun nonaktif'}</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
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
