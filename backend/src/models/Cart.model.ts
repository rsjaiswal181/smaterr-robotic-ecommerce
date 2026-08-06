import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
  coupon?: {
    code: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
    coupon: {
      code: { type: String },
      discountType: { type: String, enum: ['percentage', 'flat'] },
      discountValue: { type: Number },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICart>('Cart', cartSchema);
