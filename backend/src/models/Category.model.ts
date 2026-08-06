import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  parent: Types.ObjectId | null;
  image?: string;
  banner?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    image: { type: String },
    banner: { type: String },
    description: { type: String },
    seoTitle: { type: String },
    seoDescription: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>('Category', categorySchema);
