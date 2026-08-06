import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { categoryService } from '@/services';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui';
import { toast } from '@/store/toastStore';
import type { Category } from '@/types';

export const AdminCategoriesPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', parent: '', description: '' });
  const qc = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.list() });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['categories'] });

  const createMutation = useMutation({
    mutationFn: () => categoryService.create({ name: form.name, parent: form.parent || null, description: form.description }),
    onSuccess: () => { toast.success('Category created'); invalidate(); setModalOpen(false); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not create category'),
  });

  const updateMutation = useMutation({
    mutationFn: () => categoryService.update(editing!._id, { name: form.name, parent: form.parent || null, description: form.description }),
    onSuccess: () => { toast.success('Category updated'); invalidate(); setModalOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => { toast.success('Category deleted'); invalidate(); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not delete — it may have products linked'),
  });

  const openCreate = () => { setEditing(null); setForm({ name: '', parent: '', description: '' }); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, parent: c.parent || '', description: c.description || '' }); setModalOpen(true); };

  return (
    <div>
      <AdminHeader
        title="Categories"
        subtitle={`${categories.length} categories`}
        action={<Button onClick={openCreate}><FiPlus className="h-4 w-4" /> Add category</Button>}
      />
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <div key={c._id} className="flex items-center justify-between rounded-md border border-ink/10 bg-white p-4">
                <div>
                  <p className="font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-ink/40">/{c.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="text-ink/50 hover:text-forest"><FiEdit2 className="h-4 w-4" /></button>
                  <button onClick={() => confirm('Delete this category?') && deleteMutation.mutate(c._id)} className="text-ink/50 hover:text-rust">
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit category' : 'Add category'}>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label>Parent category (optional)</Label>
            <Select value={form.parent} onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}>
              <option value="">None (top level)</option>
              {categories.filter((c) => c._id !== editing?._id).map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
        </div>
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
