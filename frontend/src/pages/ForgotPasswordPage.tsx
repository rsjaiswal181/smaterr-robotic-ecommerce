import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { toast } from '@/store/toastStore';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Reset your password</h1>
      {sent ? (
        <p className="mt-4 text-sm text-ink/70">
          If an account exists for <strong>{email}</strong>, a reset link has been sent (in dev mode, check the backend
          server console — emails are logged there when SMTP isn't configured).
        </p>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-ink/60">
        <Link to="/login" className="font-medium text-forest hover:underline">Back to login</Link>
      </p>
    </div>
  );
};
