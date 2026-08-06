import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { productService, categoryService, brandService, uploadService } from '@/services';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge, Spinner } from '@/components/ui';
import { formatCurrency } from '@/utils/cn';
import { toast } from '@/store/toastStore';
import type { Product } from '@/types';

const emptyForm = {
  name: '',
  sku: '',
  category: '',
  brand: '',
  price: '',
  salePrice: '',
  stock: '',
  minOrderQty: '1',
  description: '',
  images: [] as string[],
  imageUrl: '',
  isFeatured: false,
  isTrending: false,
  isNewArrival: false,
  isBestSeller: false,
  status: 'active',
};

export const AdminProductsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productService.list({ limit: 100 }),
  });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.list() });
  const { data: brands = [] } = useQuery({ queryKey: ['brands'], queryFn: () => brandService.list() });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-products'] });

  const createMutation = useMutation({
    mutationFn: (payload: any) => productService.create(payload),
    onSuccess: () => {
      toast.success('Product created');
      invalidate();
      closeModal();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not create product'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => productService.update(id, payload),
    onSuccess: () => {
      toast.success('Product updated');
      invalidate();
      closeModal();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => {
      toast.success('Product deleted');
      invalidate();
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku,
      category: typeof p.category === 'object' ? p.category._id : p.category,
      brand: typeof p.brand === 'object' ? p.brand?._id || '' : p.brand || '',
      price: String(p.price),
      salePrice: p.salePrice ? String(p.salePrice) : '',
      stock: String(p.stock),
      minOrderQty: String(p.minOrderQty),
      description: p.description,
      images: p.images || [],
      imageUrl: '',
      isFeatured: p.isFeatured,
      isTrending: p.isTrending,
      isNewArrival: p.isNewArrival,
      isBestSeller: p.isBestSeller,
      status: p.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const results = await uploadService.multiple(Array.from(files));
      setForm((f) => ({ ...f, images: [...f.images, ...results.map((r) => r.url)] }));
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    const payload = {
      ...form,
      images: form.imageUrl ? [...form.images, form.imageUrl] : form.images,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      stock: Number(form.stock),
      minOrderQty: Number(form.minOrderQty),
      brand: form.brand || undefined,
      imageUrl: undefined,
    };
    if (editing) updateMutation.mutate({ id: editing._id, payload });
    else createMutation.mutate(payload);
  };

  const products = data?.data || [];

  return (
    <div>
      <AdminHeader
        title="Products"
        subtitle={`${products.length} electronics components and project parts`}
        action={
          <Button onClick={openCreate}>
            <FiPlus className="h-4 w-4" /> Add product
          </Button>
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
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {products.map((p: Product) => (
                  <tr key={p._id}>
                    <td className="flex items-center gap-3 px-4 py-3">
                      <div className="h-10 w-10 overflow-hidden rounded-sm bg-paper-dim">
                        {p.images?.[0] && <img src={p.images[0]} className="h-full w-full object-cover" />}
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 text-ink/60">
                      {typeof p.category === 'object' ? p.category.name : '-'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink/60">{p.sku}</td>
                    <td className="px-4 py-3 font-mono">{formatCurrency(p.salePrice || p.price)}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status === 'active' ? 'forest' : 'default'}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="text-ink/50 hover:text-forest">
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => confirm('Delete this product?') && deleteMutation.mutate(p._id)}
                          className="text-ink/50 hover:text-rust"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit product' : 'Add product'} wide>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Product name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label>SKU</Label>
            <Input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Brand</Label>
            <Select value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}>
              <option value="">None</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Price (₹)</Label>
            <Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          </div>
          <div>
            <Label>Sale price (₹, optional)</Label>
            <Input type="number" value={form.salePrice} onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))} />
          </div>
          <div>
            <Label>Stock</Label>
            <Input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
          </div>
          <div>
            <Label>Min order qty</Label>
            <Input type="number" value={form.minOrderQty} onChange={(e) => setForm((f) => ({ ...f, minOrderQty: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="sm:col-span-2">
            <Label>Images</Label>
            <Input
              placeholder="Paste image URL"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              className="mb-3"
            />
            <div className="flex flex-wrap gap-2">
              {form.images.map((img) => (
                <div key={img} className="relative h-16 w-16 overflow-hidden rounded-sm border border-ink/10">
                  <img src={img} className="h-full w-full object-cover" />
                  <button
                    onClick={() => setForm((f) => ({ ...f, images: f.images.filter((i) => i !== img) }))}
                    className="absolute right-0 top-0 bg-ink/60 px-1 text-[10px] text-paper"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-sm border border-dashed border-ink/30 text-ink/40 hover:border-forest hover:text-forest">
                {uploading ? <Spinner className="h-4 w-4" /> : <FiUploadCloud className="h-5 w-5" />}
                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files)} />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 sm:col-span-2">
            {(['isFeatured', 'isTrending', 'isNewArrival', 'isBestSeller'] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                />
                {key.replace('is', '')}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
            {editing ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
