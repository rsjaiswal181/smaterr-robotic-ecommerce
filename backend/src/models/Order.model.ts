import mongoose, { Schema, Document, Types } from 'mongoose';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'cod' | 'razorpay' | 'stripe';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  discount: number;
  couponCode?: string;
  totalPrice: number;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; date: Date; note?: string }[];
  deliveredAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        image: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ['cod', 'razorpay', 'stripe'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: { type: String },
        date: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', orderSchema);
