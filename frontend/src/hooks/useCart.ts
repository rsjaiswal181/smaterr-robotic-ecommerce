import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services';
import { useAuth } from './useAuth';
import { toast } from '@/store/toastStore';

export const useCartQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['cart'],
    queryFn: cartService.get,
    enabled: isAuthenticated,
  });
};

export const useCartMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['cart'] });

  const add = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity?: number }) =>
      cartService.add(productId, quantity),
    onSuccess: () => {
      invalidate();
      toast.success('Added to cart');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not add to cart'),
  });

  const update = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartService.update(productId, quantity),
    onSuccess: invalidate,
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not update cart'),
  });

  const remove = useMutation({
    mutationFn: (productId: string) => cartService.remove(productId),
    onSuccess: () => {
      invalidate();
      toast.info('Item removed');
    },
  });

  const applyCoupon = useMutation({
    mutationFn: (code: string) => cartService.applyCoupon(code),
    onSuccess: () => {
      invalidate();
      toast.success('Coupon applied');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Invalid coupon'),
  });

  return { add, update, remove, applyCoupon };
};
