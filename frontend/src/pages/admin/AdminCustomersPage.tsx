import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Badge, Spinner } from '@/components/ui';
import { toast } from '@/store/toastStore';

export const AdminCustomersPage = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-customers'], queryFn: () => userService.all({ limit: 100 }) });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => userService.toggleStatus(id),
    onSuccess: () => {
      toast.success('Customer status updated');
      qc.invalidateQueries({ queryKey: ['admin-customers'] });
    },
  });

  const customers = data?.data || [];

  return (
    <div>
      <AdminHeader title="Customers" subtitle={`${customers.length} customers`} />
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-ink/10 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-ink/10 bg-paper-dim text-left text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {customers.map((c: any) => (
                  <tr key={c._id}>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">{c.email}</td>
                    <td className="px-4 py-3">{c.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={c.isActive ? 'forest' : 'rust'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => toggleMutation.mutate(c._id)} className="text-xs text-forest hover:underline">
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
