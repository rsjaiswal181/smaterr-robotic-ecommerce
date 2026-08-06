import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import { ProductCard } from '@/components/common/ProductCard';
import { EmptyState, Spinner } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/types';

export const WishlistPage = () => {
  const { isAuthenticated } = useAuth();
  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: userService.getWishlist,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Log in to see your wishlist"
        action={<Link to="/login"><Button className="mt-2">Log in</Button></Link>}
      />
    );
  }

  if (isLoading) return <div className="flex justify-center py-32"><Spinner /></div>;

  const products = wishlist as Product[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-3xl text-ink">Your wishlist</h1>
      {products.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Save items you love for later."
          action={<Link to="/shop"><Button className="mt-2">Browse products</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};
