import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { brandService } from '@/services';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui';
import { toast } from '@/store/toastStore';
import type { Brand } from '@/types';

export const AdminBrandsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const qc = useQueryClient();

  const { data: brands = [], isLoading } = useQuery({ queryKey: ['brands'], queryFn: () => brandService.list() });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['brands'] });

  const createMutation = useMutation({
    mutationFn: () => brandService.create({ name }),
    onSuccess: () => { toast.success('Brand created'); invalidate(); setModalOpen(false); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not create brand'),
  });
  const updateMutation = useMutation({
    mutationFn: () => brandService.update(editing!._id, { name }),
    onSuccess: () => { toast.success('Brand updated'); invalidate(); setModalOpen(false); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => brandService.remove(id),
    onSuccess: () => { toast.success('Brand deleted'); invalidate(); },
  });

  const openCreate = () => { setEditing(null); setName(''); setModalOpen(true); };
  const openEdit = (b: Brand) => { setEditing(b); setName(b.name); setModalOpen(true); };

  return (
    <div>
      <AdminHeader
        title="Brands"
        subtitle={`${brands.length} brands`}
        action={<Button onClick={openCreate}><FiPlus className="h-4 w-4" /> Add brand</Button>}
      />
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((b) => (
              <div key={b._id} className="flex items-center justify-between rounded-md border border-ink/10 bg-white p-4">
                <p className="font-medium text-ink">{b.name}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(b)} className="text-ink/50 hover:text-forest"><FiEdit2 className="h-4 w-4" /></button>
                  <button onClick={() => confirm('Delete this brand?') && deleteMutation.mutate(b._id)} className="text-ink/50 hover:text-rust">
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit brand' : 'Add brand'}>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={() => (editing ? updateMutation.mutate() : createMutation.mutate())}>
            {editing ? 'Save changes' : 'Create'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
