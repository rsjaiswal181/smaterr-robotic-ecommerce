import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  FiArrowRight,
  FiCpu,
  FiSearch,
  FiTool,
  FiTruck,
  FiWifi,
  FiZap,
} from 'react-icons/fi';
import { productService, categoryService, inquiryService } from '@/services';
import { ProductCard } from '@/components/common/ProductCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { toast } from '@/store/toastStore';

const categoryIcons = [FiCpu, FiWifi, FiZap, FiTool];

const ProductSection = ({ title, subtitle, queryKey, params, viewAllHref }: any) => {
  const { data, isLoading } = useQuery({
    queryKey: ['products', queryKey],
    queryFn: () => productService.list(params),
  });

  const products = data?.data || [];
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink sm:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-ink/60">{subtitle}</p>
        </div>
        <Link to={viewAllHref} className="hidden items-center gap-1 text-sm font-medium text-forest hover:underline sm:flex">
          View all <FiArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.slice(0, 10).map((p: any) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
};

const RequestPanel = () => {
  const [form, setForm] = useState({
    requestType: 'product',
    name: '',
    phone: '',
    email: '',
    company: '',
    subject: '',
    budget: '',
    details: '',
  });

  const mutation = useMutation({
    mutationFn: () => inquiryService.create(form as any),
    onSuccess: () => {
      toast.success('Request submitted');
      setForm({
        requestType: 'product',
        name: '',
        phone: '',
        email: '',
        company: '',
        subject: '',
        budget: '',
        details: '',
      });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not submit request'),
  });

  return (
    <section className="bg-paper-dim">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-rust">Can’t find a component?</p>
          <h2 className="mt-2 font-display text-3xl text-ink">Request new products or complete project support.</h2>
          <p className="mt-3 text-sm leading-6 text-ink/65">
            Tell us what you are building. We can source parts, recommend compatible modules, or help plan a robotics,
            IoT, automation, or student project bill of materials.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-ink/70 sm:grid-cols-3">
            {['Product sourcing', 'Project consulting', 'Bulk quotation'].map((item) => (
              <div key={item} className="rounded-md border border-ink/10 bg-white/70 px-4 py-3 font-medium">
                {item}
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="grid gap-3 rounded-md border border-ink/10 bg-white p-4 sm:grid-cols-2"
        >
          <Select value={form.requestType} onChange={(e) => setForm((f) => ({ ...f, requestType: e.target.value }))}>
            <option value="product">Request Product</option>
            <option value="project">Build Project With Us</option>
            <option value="consulting">Project Consulting</option>
          </Select>
          <Input required placeholder="Subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
          <Input required placeholder="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input required placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input placeholder="Company / Institution" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
          <Input placeholder="Estimated budget" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} />
          <Textarea
            required
            placeholder="Tell us part numbers, quantity, deadline, or project details"
            value={form.details}
            onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
            className="sm:col-span-2"
          />
          <div className="sm:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>
              Submit request
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export const HomePage = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.list() });
  const { data: featured } = useQuery({
    queryKey: ['products', 'hero-featured'],
    queryFn: () => productService.list({ featured: true, limit: 4 }),
  });

  const heroProducts = featured?.data || [];

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div>
      <section className="contour-lines bg-ink text-paper">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">Electronics • Robotics • IoT</p>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              Build faster with tested components and project guidance.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-paper/70 sm:text-base">
              Shop Arduino, Raspberry Pi, sensors, modules, cables, tools, and automation essentials for students,
              engineers, institutions, and makers.
            </p>
            <form onSubmit={submitSearch} className="mt-7 flex max-w-2xl rounded-md border border-paper/15 bg-white p-1">
              <div className="flex flex-1 items-center px-3 text-ink">
                <FiSearch className="h-5 w-5 text-ink/35" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Arduino, sensors, relay, soldering iron..."
                  className="h-12 w-full bg-transparent px-3 text-sm outline-none"
                />
              </div>
              <Button type="submit" variant="accent">Search</Button>
            </form>
            <div className="mt-6 flex flex-wrap gap-3 text-xs">
              {['Fast delivery', 'Expert guidance', 'Cash on delivery', 'Bulk sourcing'].map((item) => (
                <span key={item} className="rounded-full border border-paper/15 px-3 py-1.5 text-paper/75">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {heroProducts.map((product: any) => (
              <Link key={product._id} to={`/product/${product.slug}`} className="group overflow-hidden rounded-md bg-paper text-ink">
                <div className="aspect-square bg-white">
                  <img src={product.images?.[0]} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-ink/50">{typeof product.category === 'object' ? product.category.name : 'Electronics'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-paper">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-ink/10 px-4 py-8 sm:px-6 md:grid-cols-4">
          {categories.slice(0, 8).map((category, index) => {
            const Icon = categoryIcons[index % categoryIcons.length];
            return (
              <Link
                key={category._id}
                to={`/shop?category=${category._id}`}
                className="group flex items-center gap-3 bg-paper px-4 py-4 hover:bg-paper-dim"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-forest/10 text-forest group-hover:bg-forest group-hover:text-paper">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-ink">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3">
        {[
          { icon: FiCpu, title: 'Everything for your next build', desc: 'Boards, sensors, modules, tools, and robotics parts.' },
          { icon: FiTruck, title: 'Reliable dispatch', desc: 'Prepared for fast local delivery and COD checkout.' },
          { icon: FiTool, title: 'Need help choosing?', desc: 'Ask for part compatibility and project BOM support.' },
        ].map((item) => (
          <div key={item.title} className="flex gap-4 rounded-md border border-ink/10 bg-white p-5">
            <item.icon className="mt-1 h-6 w-6 shrink-0 text-forest" />
            <div>
              <h2 className="font-medium text-ink">{item.title}</h2>
              <p className="mt-1 text-sm text-ink/60">{item.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <ProductSection
        title="New arrivals"
        subtitle="Fresh electronics and maker essentials"
        queryKey="new"
        params={{ newArrival: true, limit: 10 }}
        viewAllHref="/shop?newArrival=true"
      />
      <ProductSection
        title="Featured components"
        subtitle="Recommended boards, modules, and tools"
        queryKey="featured"
        params={{ featured: true, limit: 10 }}
        viewAllHref="/shop?featured=true"
      />
      <ProductSection
        title="Best selling"
        subtitle="Popular parts makers keep reordering"
        queryKey="bestseller"
        params={{ bestSeller: true, limit: 10 }}
        viewAllHref="/shop?bestSeller=true"
      />

      <RequestPanel />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="rounded-md bg-forest px-6 py-8 text-paper sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber">Trusted by makers</p>
          <h2 className="mt-2 font-display text-3xl">Electronics, robotics, IoT, and automation in one place.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-paper/75">
            From classroom prototypes to industrial automation, this store is shaped for quick product discovery,
            practical technical support, and repeat purchasing of small components.
          </p>
        </div>
      </section>
    </div>
  );
};
