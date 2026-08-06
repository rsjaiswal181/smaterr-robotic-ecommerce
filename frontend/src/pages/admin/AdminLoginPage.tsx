import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { toast } from '@/store/toastStore';
import { Toaster } from '@/components/common/Toaster';

export const AdminLoginPage = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authService.adminLogin({ email, password });
      setAuth(result.user, result.accessToken);
      navigate('/admin');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-md bg-paper p-8">
        <p className="font-display text-2xl text-ink">Smaterr Roboticz</p>
        <p className="text-sm text-ink/50">Admin Panel</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-4 text-xs text-ink/40">
          Default seeded credentials: admin@example.com / Admin@123 (change ADMIN_EMAIL / ADMIN_PASSWORD in backend .env before seeding)
        </p>
      </div>
      <Toaster />
    </div>
  );
};
