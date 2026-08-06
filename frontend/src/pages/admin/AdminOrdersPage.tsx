import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Select } from '@/components/ui/Input';
import { Badge, Spinner } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/utils/cn';
import { toast } from '@/store/toastStore';
import type { Order, OrderStatus } from '@/types';

const statuses: OrderStatus[] = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'];

const statusVariant: Record<OrderStatus, 'default' | 'forest' | 'amber' | 'rust'> = {
  pending: 'amber', confirmed: 'forest', packed: 'forest', shipped: 'forest',
  delivered: 'forest', cancelled: 'rust', returned: 'rust', refunded: 'rust',
};

export const AdminOrdersPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => orderService.all({ status: statusFilter || undefined, limit: 100 }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => orderService.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelected(null);
    },
  });

  const orders = data?.data || [];

  return (
    <div>
      <AdminHeader
        title="Orders"
        subtitle={`${orders.length} orders`}
        action={
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto">
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        }
      />
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-ink/10 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-ink/10 bg-paper-dim text-left text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                    <td className="px-4 py-3">{typeof o.user === 'object' ? o.user.name : ''}</td>
                    <td className="px-4 py-3 text-xs text-ink/60">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3 font-mono">{formatCurrency(o.totalPrice)}</td>
                    <td className="px-4 py-3 uppercase text-xs">{o.paymentMethod}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant[o.status]}>{o.status}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelected(o)} className="text-xs text-forest hover:underline">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `Order ${selected.orderNumber}` : ''} wide>
        {selected && (
          <div>
            <div className="mb-4 space-y-1 text-sm text-ink/70">
              <p><strong>Customer:</strong> {typeof selected.user === 'object' ? `${selected.user.name} (${selected.user.email})` : ''}</p>
              <p><strong>Address:</strong> {selected.shippingAddress.addressLine1}, {selected.shippingAddress.city}, {selected.shippingAddress.state} {selected.shippingAddress.postalCode}</p>
              <p><strong>Phone:</strong> {selected.shippingAddress.phone}</p>
            </div>
            <div className="mb-4 divide-y divide-ink/10 border-y border-ink/10">
              {selected.items.map((i) => (
                <div key={i.product} className="flex justify-between py-2 text-sm">
                  <span>{i.name} × {i.quantity}</span>
                  <span className="font-mono">{formatCurrency(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(selected.totalPrice)}</span>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">Update status</p>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={selected.status === s ? 'primary' : 'outline'}
                    onClick={() => updateStatus.mutate({ id: selected._id, status: s })}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
