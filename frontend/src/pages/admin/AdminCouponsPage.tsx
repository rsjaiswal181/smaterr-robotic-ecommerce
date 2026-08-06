import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { couponService } from '@/services';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge, Spinner } from '@/components/ui';
import { formatDate } from '@/utils/cn';
import { toast } from '@/store/toastStore';

const emptyForm = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minPurchase: '0',
  maxDiscount: '',
  expiresAt: '',
  usageLimit: '0',
};

export const AdminCouponsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const qc = useQueryClient();

  const { data: coupons = [], isLoading } = useQuery({ queryKey: ['coupons'], queryFn: couponService.list });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['coupons'] });

  const createMutation = useMutation({
    mutationFn: () =>
      couponService.create({
        code: form.code,
        discountType: form.discountType as 'percentage' | 'flat',
        discountValue: Number(form.discountValue),
        minPurchase: Number(form.minPurchase),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        expiresAt: form.expiresAt,
        usageLimit: Number(form.usageLimit),
      }),
    onSuccess: () => { toast.success('Coupon created'); invalidate(); setModalOpen(false); setForm(emptyForm); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not create coupon'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponService.remove(id),
    onSuccess: () => { toast.success('Coupon deleted'); invalidate(); },
  });

  return (
    <div>
      <AdminHeader
        title="Coupons"
        subtitle={`${coupons.length} coupons`}
        action={<Button onClick={() => setModalOpen(true)}><FiPlus className="h-4 w-4" /> Add coupon</Button>}
      />
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-ink/10 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-ink/10 bg-paper-dim text-left text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Min purchase</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Used</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {coupons.map((c) => (
                  <tr key={c._id}>
                    <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                    <td className="px-4 py-3">{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                    <td className="px-4 py-3">₹{c.minPurchase}</td>
                    <td className="px-4 py-3">
                      <Badge variant={new Date(c.expiresAt) < new Date() ? 'rust' : 'forest'}>{formatDate(c.expiresAt)}</Badge>
                    </td>
                    <td className="px-4 py-3">{c.usedCount}{c.usageLimit > 0 ? ` / ${c.usageLimit}` : ''}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => confirm('Delete this coupon?') && deleteMutation.mutate(c._id)} className="text-ink/50 hover:text-rust">
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add coupon">
        <div className="space-y-4">
          <div>
            <Label>Code</Label>
            <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}>
                <option value="percentage">Percentage</option>
                <option value="flat">Flat amount</option>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input type="number" value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min purchase (₹)</Label>
              <Input type="number" value={form.minPurchase} onChange={(e) => setForm((f) => ({ ...f, minPurchase: e.target.value }))} />
            </div>
            <div>
              <Label>Max discount (₹, optional)</Label>
              <Input type="number" value={form.maxDiscount} onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Expires on</Label>
              <Input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
            </div>
            <div>
              <Label>Usage limit (0 = unlimited)</Label>
              <Input type="number" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={() => createMutation.mutate()}>Create coupon</Button>
        </div>
      </Modal>
    </div>
  );
};
