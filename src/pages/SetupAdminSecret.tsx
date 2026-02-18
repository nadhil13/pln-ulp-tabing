import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SetupAdminSecret() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate inputs
      if (!email || !password || !name) {
        throw new Error('Semua field harus diisi');
      }

      if (password.length < 6) {
        throw new Error('Password minimal 6 karakter');
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Create user document in Firestore with admin role
      await setDoc(doc(db, 'users', uid), {
        uid,
        email,
        name,
        role: 'admin_gudang',
        active: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      setSuccess(true);
      toast.success('Admin berhasil dibuat! Silakan login.');
      
    } catch (err: any) {
      console.error('Error creating admin:', err);
      
      const errorMessages: Record<string, string> = {
        'auth/email-already-in-use': 'Email sudah terdaftar.',
        'auth/invalid-email': 'Format email tidak valid.',
        'auth/weak-password': 'Password terlalu lemah.',
        'auth/operation-not-allowed': 'Operasi tidak diizinkan.',
      };

      setError(errorMessages[err.code] || err.message || 'Gagal membuat admin.');
      toast.error('Gagal membuat admin');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-primary">Admin Berhasil Dibuat!</h2>
              <p className="text-muted-foreground">
                Akun admin telah berhasil dibuat. Silakan login menggunakan kredensial yang baru dibuat.
              </p>
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Role:</strong> Admin Gudang</p>
              </div>
              <Button asChild className="w-full">
                <a href="/login">Ke Halaman Login</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">Setup Admin Awal</CardTitle>
          <CardDescription>
            Buat akun Super Admin pertama untuk sistem PLN Inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                placeholder="Super Admin PLN"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@pln.co.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat Admin...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Buat Akun Admin
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              ⚠️ Halaman ini hanya untuk setup awal. Hapus route ini setelah admin dibuat.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
