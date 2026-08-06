import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { toast } from '@/store/toastStore';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export const LoginPage = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await authService.login(data);
      setAuth(result.user, result.accessToken);
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate((location.state as any)?.from?.pathname || '/');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-ink/60">Log in to continue to your account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <Label>Email</Label>
          <Input type="email" {...register('email')} placeholder="you@example.com" />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" {...register('password')} placeholder="••••••••" />
          <FieldError>{errors.password?.message}</FieldError>
          <Link to="/forgot-password" className="mt-1 inline-block text-xs text-forest hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        New here?{' '}
        <Link to="/register" className="font-medium text-forest hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
};
