import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiMessageSquare } from 'react-icons/fi';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { inquiryService } from '@/services';
import { Badge, Spinner } from '@/components/ui';
import { Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/cn';
import { toast } from '@/store/toastStore';
import type { Inquiry } from '@/types';

const statusVariant: Record<Inquiry['status'], 'forest' | 'rust' | 'default'> = {
  new: 'rust',
  contacted: 'forest',
  quoted: 'forest',
  closed: 'default',
};

export const AdminInquiriesPage = () => {
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inquiries', status],
    queryFn: () => inquiryService.list({ limit: 100, status: status || undefined }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Inquiry> }) => inquiryService.update(id, payload),
    onSuccess: () => {
      toast.success('Request updated');
      qc.invalidateQueries({ queryKey: ['admin-inquiries'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: () => toast.error('Could not update request'),
  });

  const inquiries = data?.data || [];

  return (
    <div>
      <AdminHeader
        title="Product & Project Requests"
        subtitle={`${data?.pagination?.total ?? 0} customer requests`}
      />

      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-ink/60">
            <FiMessageSquare className="h-4 w-4 text-forest" />
            Track sourcing requests, build inquiries, and consulting leads.
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-48">
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="closed">Closed</option>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((item) => (
              <div key={item._id} className="rounded-md border border-ink/10 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                      <span className="text-xs uppercase tracking-wide text-ink/40">{item.requestType}</span>
                    </div>
                    <h2 className="mt-2 font-display text-xl text-ink">{item.subject}</h2>
                    <p className="mt-1 text-sm text-ink/60">{item.details}</p>
                  </div>
                  <div className="text-right text-xs text-ink/50">{formatDate(item.createdAt)}</div>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <p><span className="text-ink/40">Name:</span> {item.name}</p>
                  <p><span className="text-ink/40">Phone:</span> {item.phone}</p>
                  <p><span className="text-ink/40">Email:</span> {item.email || '-'}</p>
                  <p><span className="text-ink/40">Budget:</span> {item.budget || '-'}</p>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[180px_1fr_auto]">
                  <Select
                    value={item.status}
                    onChange={(e) => updateMutation.mutate({ id: item._id, payload: { status: e.target.value as Inquiry['status'] } })}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="closed">Closed</option>
                  </Select>
                  <Textarea
                    rows={2}
                    placeholder="Internal note"
                    defaultValue={item.adminNote || ''}
                    onChange={(e) => setNotes((current) => ({ ...current, [item._id]: e.target.value }))}
                  />
                  <Button
                    variant="outline"
                    onClick={() => updateMutation.mutate({ id: item._id, payload: { adminNote: notes[item._id] ?? item.adminNote ?? '' } })}
                    disabled={updateMutation.isPending}
                  >
                    Save note
                  </Button>
                </div>
              </div>
            ))}

            {inquiries.length === 0 && (
              <div className="rounded-md border border-ink/10 bg-white p-10 text-center text-sm text-ink/50">
                No requests found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
