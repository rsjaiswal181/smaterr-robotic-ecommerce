import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiCheckCircle } from 'react-icons/fi';
import { orderService } from '@/services';
import { formatCurrency } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui';

export const OrderSuccessPage = () => {
  const { id } = useParams();
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="flex justify-center py-32"><Spinner /></div>;
  if (!order) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <FiCheckCircle className="mx-auto h-14 w-14 text-forest" />
      <h1 className="mt-5 font-display text-3xl text-ink">Order placed!</h1>
      <p className="mt-2 text-sm text-ink/60">
        Order <span className="font-mono">{order.orderNumber}</span> has been confirmed. You'll pay{' '}
        <span className="font-medium">{formatCurrency(order.totalPrice)}</span> on delivery.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link to="/profile"><Button variant="outline">View orders</Button></Link>
        <Link to="/shop"><Button>Continue shopping</Button></Link>
      </div>
    </div>
  );
};
