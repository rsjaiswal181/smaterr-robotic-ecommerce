import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiHeart, FiStar, FiMinus, FiPlus } from 'react-icons/fi';
import { productService, reviewService, userService } from '@/services';
import { formatCurrency, cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Badge, Spinner } from '@/components/ui';
import { Textarea } from '@/components/ui/Input';
import { ProductCard } from '@/components/common/ProductCard';
import { useCartMutations } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/store/toastStore';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const { add } = useCartMutations();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getBySlug(slug!),
    enabled: !!slug,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', data?.product._id],
    queryFn: () => reviewService.listForProduct(data!.product._id),
    enabled: !!data?.product._id,
  });

  const wishlistMutation = useMutation({
    mutationFn: () => userService.toggleWishlist(data!.product._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Wishlist updated');
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () => reviewService.create(data!.product._id, reviewForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', data?.product._id] });
      toast.success('Review submitted');
      setReviewForm({ rating: 5, title: '', comment: '' });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not submit review'),
  });

  if (isLoading) return <div className="flex justify-center py-32"><Spinner /></div>;
  if (!data) return null;

  const { product, related } = data;
  const price = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const onSale = product.salePrice && product.salePrice < product.price;
  const inWishlist = user?.wishlist?.includes(product._id);
  const category = typeof product.category === 'object' ? product.category?.name : '';
  const brand = typeof product.brand === 'object' ? product.brand?.name : '';

  const handleAddToCart = () => {
    if (!isAuthenticated) return navigate('/login');
    add.mutate({ productId: product._id, quantity });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 text-xs text-ink/50">
        Shop {category && `/ ${category}`} / <span className="text-ink">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-md bg-paper-dim">
            {product.images?.[activeImage] ? (
              <img src={product.images[activeImage]} alt={product.name} className="h-full w-full object-contain bg-white p-6" />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-ink/30">No image</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img: string, i: number) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'h-16 w-16 overflow-hidden rounded-sm border-2',
                    activeImage === i ? 'border-forest' : 'border-transparent'
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {brand && <p className="text-sm text-ink/50">{brand}</p>}
          <h1 className="mt-1 font-display text-3xl text-ink">{product.name}</h1>

          <div className="mt-2 flex items-center gap-2">
            <div className="flex text-amber">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar key={i} className={cn('h-4 w-4', i < Math.round(product.ratingsAverage) && 'fill-amber')} />
              ))}
            </div>
            <span className="text-sm text-ink/50">({product.ratingsCount} reviews)</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-mono text-2xl text-ink">{formatCurrency(price)}</span>
            {onSale && <span className="font-mono text-base text-ink/40 line-through">{formatCurrency(product.price)}</span>}
            {onSale && <Badge variant="rust">{Math.round((1 - price / product.price) * 100)}% off</Badge>}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-ink/70">{product.description}</p>

          {product.specifications?.length > 0 && (
            <div className="mt-5 space-y-1 border-t border-ink/10 pt-4">
              {product.specifications.map((s: { key: string; value: string }) => (
                <div key={s.key} className="flex text-sm">
                  <span className="w-32 text-ink/50">{s.key}</span>
                  <span className="text-ink">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-sm border border-ink/15">
              <button
                onClick={() => setQuantity((q) => Math.max(product.minOrderQty || 1, q - 1))}
                className="flex h-11 w-11 items-center justify-center hover:bg-ink/5"
              >
                <FiMinus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="flex h-11 w-11 items-center justify-center hover:bg-ink/5"
              >
                <FiPlus className="h-3.5 w-3.5" />
              </button>
            </div>

            <Button onClick={handleAddToCart} disabled={product.stock === 0 || add.isPending} className="flex-1">
              {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
            </Button>

            <button
              onClick={() => (isAuthenticated ? wishlistMutation.mutate() : navigate('/login'))}
              className="flex h-11 w-11 items-center justify-center rounded-sm border border-ink/15 hover:border-rust"
            >
              <FiHeart className={cn('h-4 w-4', inWishlist && 'fill-rust text-rust')} />
            </button>
          </div>

          <p className="mt-4 text-xs text-ink/50">
            SKU: {product.sku} · {product.stock > 0 ? `${product.stock} in stock` : 'Currently unavailable'}
          </p>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16 border-t border-ink/10 pt-10">
        <h2 className="font-display text-2xl text-ink">Customer reviews</h2>

        <div className="mt-6 space-y-6">
          {reviews.length === 0 && <p className="text-sm text-ink/50">No reviews yet. Be the first to review this product.</p>}
          {reviews.map((r) => (
            <div key={r._id} className="border-b border-ink/10 pb-5">
              <div className="flex items-center gap-2">
                <div className="flex text-amber">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar key={i} className={cn('h-3.5 w-3.5', i < r.rating && 'fill-amber')} />
                  ))}
                </div>
                <span className="text-sm font-medium text-ink">{r.user?.name}</span>
              </div>
              {r.title && <p className="mt-1 text-sm font-medium">{r.title}</p>}
              <p className="mt-1 text-sm text-ink/70">{r.comment}</p>
            </div>
          ))}
        </div>

        {isAuthenticated ? (
          <div className="mt-8 max-w-lg">
            <p className="mb-2 text-sm font-medium">Write a review</p>
            <div className="mb-3 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} onClick={() => setReviewForm((f) => ({ ...f, rating: i + 1 }))}>
                  <FiStar className={cn('h-5 w-5 text-amber', i < reviewForm.rating && 'fill-amber')} />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Share your experience with this product…"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
            />
            <Button
              className="mt-3"
              size="sm"
              disabled={!reviewForm.comment || reviewMutation.isPending}
              onClick={() => reviewMutation.mutate()}
            >
              Submit review
            </Button>
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink/50">
            <button onClick={() => navigate('/login')} className="text-forest underline">Log in</button> to write a review.
          </p>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-16 border-t border-ink/10 pt-10">
          <h2 className="mb-6 font-display text-2xl text-ink">You may also like</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {related.slice(0, 4).map((p: typeof product) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
