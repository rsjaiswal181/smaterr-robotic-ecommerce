import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartQuery } from '@/hooks/useCart';
import { orderService } from '@/services';
import { formatCurrency } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { Spinner } from '@/components/ui';
import { toast } from '@/store/toastStore';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(8, 'Valid phone number required'),
  addressLine1: z.string().min(3, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

type AddressForm = z.infer<typeof addressSchema>;

export const CheckoutPage = () => {
  const { data: cart, isLoading } = useCartQuery();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [placing, setPlacing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: 'India' },
  });

  const placeOrder = useMutation({
    mutationFn: (shippingAddress: AddressForm) => orderService.place({ shippingAddress, paymentMethod: 'cod' }),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Order placed successfully!');
      navigate(`/order-success/${order._id}`);
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || 'Could not place order');
      setPlacing(false);
    },
  });

  if (isLoading) return <div className="flex justify-center py-32"><Spinner /></div>;

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  let discount = 0;
  if (cart?.coupon) {
    discount =
      cart.coupon.discountType === 'percentage' ? (subtotal * cart.coupon.discountValue) / 100 : cart.coupon.discountValue;
  }
  const shipping = subtotal - discount >= 999 ? 0 : 49;
  const tax = Math.round((subtotal - discount) * 0.05 * 100) / 100;
  const total = Math.max(0, subtotal - discount) + shipping + tax;

  const onSubmit = (data: AddressForm) => {
    setPlacing(true);
    placeOrder.mutate(data);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-3xl text-ink">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-md border border-ink/10 bg-white/50 p-6">
            <h2 className="mb-4 font-display text-lg text-ink">Shipping address</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Full name</Label>
                <Input {...register('fullName')} placeholder="Jane Doe" />
                <FieldError>{errors.fullName?.message}</FieldError>
              </div>
              <div>
                <Label>Phone</Label>
                <Input {...register('phone')} placeholder="+91 98765 43210" />
                <FieldError>{errors.phone?.message}</FieldError>
              </div>
              <div className="sm:col-span-2">
                <Label>Address line 1</Label>
                <Input {...register('addressLine1')} placeholder="House no, street" />
                <FieldError>{errors.addressLine1?.message}</FieldError>
              </div>
              <div className="sm:col-span-2">
                <Label>Address line 2 (optional)</Label>
                <Input {...register('addressLine2')} placeholder="Landmark, area" />
              </div>
              <div>
                <Label>City</Label>
                <Input {...register('city')} />
                <FieldError>{errors.city?.message}</FieldError>
              </div>
              <div>
                <Label>State</Label>
                <Input {...register('state')} />
                <FieldError>{errors.state?.message}</FieldError>
              </div>
              <div>
                <Label>Postal code</Label>
                <Input {...register('postalCode')} />
                <FieldError>{errors.postalCode?.message}</FieldError>
              </div>
              <div>
                <Label>Country</Label>
                <Input {...register('country')} />
                <FieldError>{errors.country?.message}</FieldError>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-ink/10 bg-white/50 p-6">
            <h2 className="mb-3 font-display text-lg text-ink">Payment method</h2>
            <div className="flex items-center gap-3 rounded-sm border border-forest bg-forest/5 p-4">
              <input type="radio" checked readOnly />
              <div>
                <p className="text-sm font-medium text-ink">Cash on Delivery</p>
                <p className="text-xs text-ink/50">Pay with cash when your order arrives</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-fit rounded-md border border-ink/10 bg-white/50 p-6">
          <h2 className="font-display text-lg text-ink">Order summary</h2>
          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product._id} className="flex justify-between text-sm">
                <span className="text-ink/70">{item.product.name} × {item.quantity}</span>
                <span className="font-mono">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm">
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
              <span>Tax</span>
              <span className="font-mono">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-medium text-ink">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(total)}</span>
            </div>
          </div>
          <Button type="submit" className="mt-6 w-full" disabled={placing || items.length === 0}>
            {placing ? 'Placing order…' : 'Place order'}
          </Button>
        </div>
      </form>
    </div>
  );
};
