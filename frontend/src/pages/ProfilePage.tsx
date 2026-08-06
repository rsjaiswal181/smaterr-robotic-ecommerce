import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService, userService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatDate, cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { Badge, EmptyState, Spinner } from '@/components/ui';
import { toast } from '@/store/toastStore';
import type { OrderStatus } from '@/types';

const statusVariant: Record<OrderStatus, 'default' | 'forest' | 'amber' | 'rust'> = {
  pending: 'amber',
  confirmed: 'forest',
  packed: 'forest',
  shipped: 'forest',
  delivered: 'forest',
  cancelled: 'rust',
  returned: 'rust',
  refunded: 'rust',
};

const OrdersTab = () => {
  const { data: orders = [], isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: orderService.myOrders });
  const qc = useQueryClient();
  const cancelMutation = useMutation({
    mutationFn: (id: string) => orderService.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Order cancelled');
    },
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (orders.length === 0) return <EmptyState title="No orders yet" description="Your placed orders will show up here." />;

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order._id} className="rounded-md border border-ink/10 bg-white/50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-mono text-sm text-ink">{order.orderNumber}</p>
              <p className="text-xs text-ink/50">{formatDate(order.createdAt)}</p>
            </div>
            <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
          </div>
          <div className="mt-3 space-y-1 text-sm text-ink/70">
            {order.items.map((i) => (
              <p key={i.product}>{i.name} × {i.quantity}</p>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
            <span className="font-mono font-medium">{formatCurrency(order.totalPrice)}</span>
            {['pending', 'confirmed'].includes(order.status) && (
              <Button variant="outline" size="sm" onClick={() => cancelMutation.mutate(order._id)}>
                Cancel order
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const AddressesTab = () => {
  const { user, setUser } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const addMutation = useMutation({
    mutationFn: () => userService.addAddress(form),
    onSuccess: (addresses) => {
      if (user) setUser({ ...user, addresses } as any);
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Address added');
      setForm({ fullName: '', phone: '', addressLine1: '', city: '', state: '', postalCode: '', country: 'India' });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => userService.removeAddress(id),
    onSuccess: (addresses) => {
      if (user) setUser({ ...user, addresses } as any);
      toast.info('Address removed');
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });

  return (
    <div>
      <div className="space-y-3">
        {(user?.addresses || []).map((a) => (
          <div key={a._id} className="flex items-start justify-between rounded-md border border-ink/10 bg-white/50 p-4">
            <div className="text-sm">
              <p className="font-medium">{a.fullName} · {a.phone}</p>
              <p className="text-ink/60">{a.addressLine1}, {a.city}, {a.state} {a.postalCode}, {a.country}</p>
            </div>
            <button onClick={() => a._id && removeMutation.mutate(a._id)} className="text-xs text-rust hover:underline">
              Remove
            </button>
          </div>
        ))}
        {(!user?.addresses || user.addresses.length === 0) && <p className="text-sm text-ink/50">No saved addresses.</p>}
      </div>

      <div className="mt-6 rounded-md border border-ink/10 bg-white/50 p-5">
        <p className="mb-3 text-sm font-medium">Add new address</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input placeholder="Full name" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
          <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input
            placeholder="Address line 1"
            className="sm:col-span-2"
            value={form.addressLine1}
            onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))}
          />
          <Input placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          <Input placeholder="State" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
          <Input placeholder="Postal code" value={form.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} />
          <Input placeholder="Country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
        </div>
        <Button size="sm" className="mt-3" onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
          Save address
        </Button>
      </div>
    </div>
  );
};

const AccountTab = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const updateMutation = useMutation({
    mutationFn: () => userService.updateProfile({ name, phone }),
    onSuccess: (updated) => {
      toast.success('Profile updated');
      setUser(updated);
    },
  });

  return (
    <div className="max-w-md space-y-4">
      <div>
        <Label>Full name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label>Email</Label>
        <Input value={user?.email} disabled />
      </div>
      <div>
        <Label>Phone</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
        Save changes
      </Button>
    </div>
  );
};

export const ProfilePage = () => {
  const [tab, setTab] = useState<'orders' | 'addresses' | 'account'>('orders');
  const { user, isAdmin } = useAuth();

  const tabs = [
    { key: 'orders', label: 'Orders' },
    { key: 'addresses', label: 'Addresses' },
    { key: 'account', label: 'Account' },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Hi, {user?.name?.split(' ')[0]}</h1>
      {isAdmin && (
        <Link to="/admin" className="mt-2 inline-block text-sm text-forest hover:underline">
          Go to admin panel →
        </Link>
      )}

      <div className="mt-8 flex gap-6 border-b border-ink/10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'border-b-2 pb-3 text-sm font-medium',
              tab === t.key ? 'border-forest text-forest' : 'border-transparent text-ink/50 hover:text-ink'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'orders' && <OrdersTab />}
        {tab === 'addresses' && <AddressesTab />}
        {tab === 'account' && <AccountTab />}
      </div>
    </div>
  );
};
