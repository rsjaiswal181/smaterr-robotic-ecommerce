import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiX } from 'react-icons/fi';
import { useCartQuery, useCartMutations } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState, Spinner } from '@/components/ui';

export const CartPage = () => {
  const { data: cart, isLoading } = useCartQuery();
  const { update, remove, applyCoupon } = useCartMutations();
  const [couponCode, setCouponCode] = useState('');
  const navigate = useNavigate();

  if (isLoading) return <div className="flex justify-center py-32"><Spinner /></div>;

  const items = cart?.items || [];
  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Looks like you haven't added anything yet."
        action={<Link to="/shop"><Button className="mt-2">Start shopping</Button></Link>}
      />
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  let discount = 0;
  if (cart?.coupon) {
    discount =
      cart.coupon.discountType === 'percentage' ? (subtotal * cart.coupon.discountValue) / 100 : cart.coupon.discountValue;
  }
  const shipping = subtotal - discount >= 999 ? 0 : 49;
  const tax = Math.round((subtotal - discount) * 0.05 * 100) / 100;
  const total = Math.max(0, subtotal - discount) + shipping + tax;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-3xl text-ink">Your cart</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-ink/10">
          {items.map((item) => (
            <div key={item.product._id} className="flex gap-4 py-5">
              <Link to={`/product/${item.product.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-paper-dim">
                {item.product.images?.[0] && (
                  <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                )}
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between">
                  <Link to={`/product/${item.product.slug}`} className="font-medium text-ink hover:text-forest">
                    {item.product.name}
                  </Link>
                  <button onClick={() => remove.mutate(item.product._id)} className="text-ink/40 hover:text-rust">
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-sm border border-ink/15">
                    <button
                      onClick={() => update.mutate({ productId: item.product._id, quantity: item.quantity - 1 })}
                      className="flex h-8 w-8 items-center justify-center hover:bg-ink/5"
                    >
                      <FiMinus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => update.mutate({ productId: item.product._id, quantity: item.quantity + 1 })}
                      className="flex h-8 w-8 items-center justify-center hover:bg-ink/5"
                    >
                      <FiPlus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="font-mono text-sm">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-md border border-ink/10 bg-white/50 p-6">
          <h2 className="font-display text-lg text-ink">Order summary</h2>

          <div className="mt-4 flex gap-2">
            <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
            <Button variant="outline" onClick={() => couponCode && applyCoupon.mutate(couponCode)}>
              Apply
            </Button>
          </div>
          {cart?.coupon && <p className="mt-2 text-xs text-forest">Coupon "{cart.coupon.code}" applied</p>}

          <div className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-forest">
                <span>Discount</span>
                <span className="font-mono">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink/70">
              <span>Shipping</span>
              <span className="font-mono">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Tax (5%)</span>
              <span className="font-mono">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-medium text-ink">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(total)}</span>
            </div>
          </div>

          <Button className="mt-6 w-full" onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </Button>
        </div>
      </div>
    </div>
  );
};
