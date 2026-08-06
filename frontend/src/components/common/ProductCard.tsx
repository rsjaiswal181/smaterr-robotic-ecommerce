import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import type { Product } from '@/types';
import { formatCurrency, cn } from '@/utils/cn';
import { Badge } from '@/components/ui';
import { useCartMutations } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/store/toastStore';

export const ProductCard = ({ product }: { product: Product }) => {
  const { add } = useCartMutations();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const wishlistMutation = useMutation({
    mutationFn: () => userService.toggleWishlist(product._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Wishlist updated');
    },
  });

  const inWishlist = user?.wishlist?.includes(product._id);
  const price = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const onSale = product.salePrice && product.salePrice < product.price;
  const categoryName = typeof product.category === 'object' ? product.category?.name : '';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');
    add.mutate({ productId: product._id, quantity: 1 });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');
    wishlistMutation.mutate();
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-md border border-ink/10 bg-white">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-sm text-ink/30">
            No image
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {onSale && <Badge variant="rust">Sale</Badge>}
          {product.isNewArrival && <Badge variant="forest">New</Badge>}
          {product.stock === 0 && <Badge variant="default">Out of stock</Badge>}
        </div>

        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink/60 opacity-0 transition-opacity group-hover:opacity-100 hover:text-rust"
        >
          <FiHeart className={cn('h-4 w-4', inWishlist && 'fill-rust text-rust')} />
        </button>

        <button
          onClick={handleAdd}
          disabled={product.stock === 0 || add.isPending}
          className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-sm bg-ink/90 py-2.5 text-xs font-medium uppercase tracking-wide text-paper opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-0"
        >
          <FiShoppingBag className="h-3.5 w-3.5" /> Add to cart
        </button>
      </div>

      <div className="mt-3">
        <p className="text-xs text-forest">{categoryName}</p>
        <h3 className="mt-0.5 truncate font-medium text-ink">{product.name}</h3>
        <p className="mt-0.5 truncate text-xs text-ink/45">{typeof product.brand === 'object' ? product.brand?.name : ''}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-mono text-sm text-ink">{formatCurrency(price)}</span>
          {onSale && <span className="font-mono text-xs text-ink/40 line-through">{formatCurrency(product.price)}</span>}
        </div>
        <p className={cn('mt-1 text-xs', product.stock > 0 ? 'text-forest' : 'text-rust')}>
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
      </div>
    </Link>
  );
};
