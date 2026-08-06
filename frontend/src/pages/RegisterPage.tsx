import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { toast } from '@/store/toastStore';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'At least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export const RegisterPage = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await authService.register(data);
      setAuth(result.user, result.accessToken);
      toast.success('Account created!');
      navigate('/');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Create an account</h1>
      <p className="mt-1 text-sm text-ink/60">Join Smaterr Roboticz to track orders and save favorites.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <Label>Full name</Label>
          <Input {...register('name')} placeholder="Jane Doe" />
          <FieldError>{errors.name?.message}</FieldError>
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register('email')} placeholder="you@example.com" />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div>
          <Label>Phone (optional)</Label>
          <Input {...register('phone')} placeholder="+91 98765 43210" />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" {...register('password')} placeholder="At least 6 characters" />
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-forest hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};
