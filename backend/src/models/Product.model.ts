import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  category: Types.ObjectId;
  subCategory?: Types.ObjectId | null;
  brand?: Types.ObjectId | null;
  images: string[];
  video?: string;
  description: string;
  specifications: { key: string; value: string }[];
  price: number;
  salePrice?: number;
  stock: number;
  minOrderQty: number;
  weight?: number;
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  returnPolicy?: string;
  warranty?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  status: 'active' | 'inactive' | 'draft';
  ratingsAverage: number;
  ratingsCount: number;
  soldCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    sku: { type: String, required: true, unique: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand', default: null },
    images: [{ type: String }],
    video: { type: String },
    description: { type: String, required: true },
    specifications: [{ key: String, value: String }],
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    minOrderQty: { type: Number, default: 1 },
    weight: { type: Number },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    returnPolicy: { type: String },
    warranty: { type: String },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });

productSchema.virtual('effectivePrice').get(function (this: IProduct) {
  return this.salePrice && this.salePrice < this.price ? this.salePrice : this.price;
});
productSchema.set('toJSON', { virtuals: true });

export default mongoose.model<IProduct>('Product', productSchema);
