import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  UserPlus,
  Users,
  Shield,
  Loader2,
  ToggleLeft,
  ToggleRight,
  KeyRound,
  Search,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS, UserRole, User } from '@/types';
import { EditUserDialog } from '@/components/dashboard/EditUserDialog';

const createUserSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  role: z.enum(['staff', 'verifikator', 'admin_gudang'] as const),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

type CreateUserForm = z.infer<typeof createUserSchema>;

export default function UserManagement() {
  const { isRole } = useAuth();
  const { users, loading, createUser, toggleUserStatus, resetPassword } = useUsers();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      role: 'staff',
    },
  });

  // Only admin_gudang can access this page
  if (!isRole('admin_gudang')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold">Akses Ditolak</h2>
            <p className="text-muted-foreground">
              Halaman ini hanya dapat diakses oleh Admin Gudang
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const onSubmit = async (data: CreateUserForm) => {
    setActionLoading(true);
    
    const result = await createUser(data.email, data.password, data.name, data.role);
    
    if (result.success) {
      toast.success('Akun berhasil dibuat!', {
        description: `${data.name} (${ROLE_LABELS[data.role]}) sudah dapat login.`,
      });
      form.reset();
      setShowCreateDialog(false);
    } else {
      toast.error('Gagal membuat akun', {
        description: result.error,
      });
    }
    
    setActionLoading(false);
  };

  const handleToggleStatus = async (uid: string, currentActive: boolean) => {
    setActionLoading(true);
    
    const result = await toggleUserStatus(uid, !currentActive);
    
    if (result.success) {
      toast.success(currentActive ? 'Akun dinonaktifkan' : 'Akun diaktifkan kembali');
    } else {
      toast.error('Gagal mengubah status akun');
    }
    
    setActionLoading(false);
  };

  const handleResetPassword = async (email: string, name: string) => {
    setActionLoading(true);
    
    const result = await resetPassword(email);
    
    if (result.success) {
      toast.success('Email reset password terkirim!', {
        description: `Link reset password sudah dikirim ke ${email}`,
      });
    } else {
      toast.error('Gagal mengirim email reset password', {
        description: result.error,
      });
    }
    
    setActionLoading(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin_gudang':
        return 'default';
      case 'verifikator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">
            Kelola akun pengguna sistem WMS
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Pengguna</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <ToggleRight className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.active).length}</p>
                <p className="text-sm text-muted-foreground">Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <ToggleLeft className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => !u.active).length}</p>
                <p className="text-sm text-muted-foreground">Nonaktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 md:p-6 pt-4 md:pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="verifikator">Verifikator</SelectItem>
                <SelectItem value="admin_gudang">Admin Gudang</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
            {filteredUsers.length} pengguna ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Terdaftar</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.uid}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {ROLE_LABELS[user.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.active ? 'default' : 'destructive'}>
                            {user.active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditUser(user)}
                              disabled={actionLoading}
                            >
                              <Pencil className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(user.uid, user.active)}
                              disabled={actionLoading}
                            >
                              {user.active ? (
                                <>
                                  <ToggleLeft className="mr-1 h-4 w-4" />
                                  Nonaktifkan
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="mr-1 h-4 w-4" />
                                  Aktifkan
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleResetPassword(user.email, user.name)}
                              disabled={actionLoading}
                            >
                              <KeyRound className="mr-1 h-4 w-4" />
                              Reset Pass
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredUsers.map((user) => (
                  <div key={user.uid} className="w-full rounded-xl border bg-card p-4 shadow-sm overflow-hidden">
                      <div className="flex items-start gap-3 min-w-0 mb-3">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium truncate">{user.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Badge variant={user.active ? 'default' : 'destructive'} className="shrink-0">
                          {user.active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {ROLE_LABELS[user.role]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          • {formatDate(user.createdAt)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[44px] w-full"
                          onClick={() => setEditUser(user)}
                          disabled={actionLoading}
                        >
                          <Pencil className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[44px] w-full"
                          onClick={() => handleToggleStatus(user.uid, user.active)}
                          disabled={actionLoading}
                        >
                          {user.active ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="min-h-[44px] w-full"
                          onClick={() => handleResetPassword(user.email, user.name)}
                          disabled={actionLoading}
                        >
                          Reset Pass
                        </Button>
                      </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Belum ada pengguna</p>
              <p className="text-sm">Klik "Tambah Pengguna" untuk membuat akun baru</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            <DialogDescription>
              Buat akun baru untuk staff atau verifikator
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Budi Santoso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="nama@pln.co.id" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="verifikator">Verifikator</SelectItem>
                        <SelectItem value="admin_gudang">Admin Gudang</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Minimal 6 karakter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Ulangi password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={actionLoading}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={actionLoading}>
                  {actionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Membuat...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Buat Akun
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <EditUserDialog user={editUser} open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)} />
    </div>
  );
}
