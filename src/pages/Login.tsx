import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, getRedirectPath } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error('Mohon isi email dan password');
      return;
    }

    setLoading(true);

    const result = await signIn(email, password);
    
    if (result.success) {
      toast.success('Login berhasil!', {
        description: 'Selamat datang di PLN Smart Warehouse',
      });
      const redirect = result.redirectPath ?? getRedirectPath();
      navigate(redirect === '/login' ? '/dashboard' : redirect, { replace: true });
    } else {
      toast.error('Login Gagal', {
        description: result.error,
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-svh flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-pln-yellow/5 p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 mb-4">
            <Zap className="h-12 w-12 text-pln-yellow" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">PLN ULP TABING</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Warehouse Management System - Kota Padang</p>
        </div>

        <Card className="border-0 shadow-2xl shadow-primary/10">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl sm:text-2xl text-center font-semibold">Masuk ke Akun</CardTitle>
            <CardDescription className="text-center text-sm">
              Gunakan email dan password yang terdaftar
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="nama@pln.co.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 pl-10 bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 pl-10 pr-12 bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  Lupa password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 font-semibold text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk'
                )}
              </Button>
            </CardContent>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Belum punya akun? Hubungi Admin Gudang
          </p>
          <p className="text-xs text-muted-foreground/60">
            © 2026 PLN ULP TABING - Kota Padang
          </p>
        </div>
      </div>
    </div>
  );
}
