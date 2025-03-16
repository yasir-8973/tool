import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  aadharNo: string;
  address: string;
  phoneNo: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    aadharNo: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phoneNo: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Customer ||
  mongoose.model<ICustomer>('Customer', CustomerSchema);
