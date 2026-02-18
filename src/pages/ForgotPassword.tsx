import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email) {
        throw new Error('Email harus diisi');
      }

      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      toast.success('Link reset password telah dikirim ke email Anda.');
      
    } catch (err: any) {
      console.error('Error sending reset email:', err);
      
      const errorMessages: Record<string, string> = {
        'auth/invalid-email': 'Format email tidak valid.',
        'auth/user-not-found': 'Email tidak terdaftar dalam sistem.',
        'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
      };

      const errorMessage = errorMessages[err.code] || err.message || 'Gagal mengirim email reset.';
      setError(errorMessage);
      toast.error(errorMessage);
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
              <h2 className="text-xl font-semibold text-primary">Email Terkirim!</h2>
              <p className="text-muted-foreground">
                Link reset password telah dikirim ke <strong className="text-foreground">{email}</strong>. 
                Silakan cek inbox dan folder spam Anda.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Login
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                >
                  Kirim Ulang
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">Lupa Password</CardTitle>
          <CardDescription>
            Masukkan email Anda untuk menerima link reset password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@pln.co.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Kirim Link Reset
                </>
              )}
            </Button>

            <div className="text-center">
              <Link 
                to="/login" 
                className="text-sm text-primary hover:underline inline-flex items-center"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                Kembali ke Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
