import mongoose, { Schema, Document } from 'mongoose';

export interface IInquiry extends Document {
  requestType: 'product' | 'project' | 'consulting';
  name: string;
  phone: string;
  email?: string;
  company?: string;
  subject: string;
  budget?: string;
  details: string;
  status: 'new' | 'contacted' | 'quoted' | 'closed';
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const inquirySchema = new Schema<IInquiry>(
  {
    requestType: {
      type: String,
      enum: ['product', 'project', 'consulting'],
      default: 'product',
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    company: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    budget: { type: String, trim: true },
    details: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['new', 'contacted', 'quoted', 'closed'],
      default: 'new',
      index: true,
    },
    adminNote: { type: String, trim: true },
  },
  { timestamps: true }
);

inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ name: 'text', phone: 'text', email: 'text', subject: 'text', details: 'text' });

export default mongoose.model<IInquiry>('Inquiry', inquirySchema);
