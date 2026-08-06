import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiFilter, FiX } from 'react-icons/fi';
import { productService, categoryService, brandService } from '@/services';
import { ProductCard } from '@/components/common/ProductCard';
import { Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState, Spinner } from '@/components/ui';
import { cn } from '@/utils/cn';

export const ShopPage = () => {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = Number(params.get('page') || 1);
  const sort = params.get('sort') || 'newest';
  const category = params.get('category') || '';
  const brand = params.get('brand') || '';
  const search = params.get('search') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const flags = ['featured', 'bestSeller', 'newArrival', 'trending'].reduce((acc: any, key) => {
    if (params.get(key) === 'true') acc[key] = true;
    return acc;
  }, {});

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.list() });
  const { data: brands = [] } = useQuery({ queryKey: ['brands'], queryFn: () => brandService.list() });

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'shop', params.toString()],
    queryFn: () =>
      productService.list({
        page,
        limit: 12,
        sort: sort as any,
        category: category || undefined,
        brand: brand || undefined,
        search: search || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        ...flags,
      }),
  });

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const clearFilters = () => setParams({});

  const products = data?.data || [];
  const pagination = data?.pagination;

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/50">Category</p>
        <div className="space-y-1">
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => updateParam('category', category === c._id ? '' : c._id)}
              className={cn(
                'block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-ink/5',
                category === c._id && 'bg-forest/10 text-forest font-medium'
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/50">Brand</p>
        <div className="space-y-1">
          {brands.map((b) => (
            <button
              key={b._id}
              onClick={() => updateParam('brand', brand === b._id ? '' : b._id)}
              className={cn(
                'block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-ink/5',
                brand === b._id && 'bg-forest/10 text-forest font-medium'
              )}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/50">Price range</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={minPrice}
            onBlur={(e) => updateParam('minPrice', e.target.value)}
            className="h-9 w-full rounded-sm border border-ink/15 px-2 text-sm"
          />
          <span className="text-ink/40">–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice}
            onBlur={(e) => updateParam('maxPrice', e.target.value)}
            className="h-9 w-full rounded-sm border border-ink/15 px-2 text-sm"
          />
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
        Clear all filters
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">
            {search ? `Results for "${search}"` : 'Shop electronics components'}
          </h1>
          <p className="mt-1 text-sm text-ink/50">{pagination?.total ?? 0} products</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setFiltersOpen(true)} className="flex items-center gap-2 text-sm md:hidden">
            <FiFilter className="h-4 w-4" /> Filters
          </button>
          <Select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="w-auto">
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
            <option value="priceLowToHigh">Price: Low to High</option>
            <option value="priceHighToLow">Price: High to Low</option>
            <option value="rating">Top rated</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-md border border-ink/10 bg-white p-4 md:block">{FilterPanel}</aside>

        {filtersOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
            <div className="relative ml-auto h-full w-72 overflow-y-auto bg-paper p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display text-lg">Filters</p>
                <button onClick={() => setFiltersOpen(false)}><FiX className="h-5 w-5" /></button>
              </div>
              {FilterPanel}
            </div>
          </div>
        )}

        <div>
          {isLoading ? (
            <div className="flex justify-center py-24"><Spinner /></div>
          ) : products.length === 0 ? (
            <EmptyState title="No products found" description="Try adjusting your filters or search terms." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((p: import('@/types').Product) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        const next = new URLSearchParams(params);
                        next.set('page', String(p));
                        setParams(next);
                      }}
                      className={cn(
                        'h-9 w-9 rounded-sm text-sm',
                        p === page ? 'bg-forest text-paper' : 'border border-ink/15 hover:bg-ink/5'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
