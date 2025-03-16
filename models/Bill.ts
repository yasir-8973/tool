import mongoose, { Schema, Document } from "mongoose";

export interface IBillItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  stock: number;
  price: number;
  amount: number;
}

export interface IBill extends Document {
  billNumber: string;
  customer: mongoose.Types.ObjectId;
  billType: "GST" | "NON-GST";
  billCategory: "Sales" | "Service" | "Repair";
  items: IBillItem[];
  subtotal: number;
  gstPercentage: number;
  gstAmount: number;
  total: number;
  paymentStatus: "Paid" | "Unpaid" | "Partial";
  paymentMethod: "Cash" | "Card" | "UPI" | "Other";
  paidAmount: number;
  balanceAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BillItemSchema: Schema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  stock: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
});

const BillSchema: Schema = new Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    billType: { type: String, required: true, enum: ["GST", "NON-GST"] },
    billCategory: {
      type: String,
      required: true,
      enum: ["Sales", "Service", "Repair"],
    },
    items: [BillItemSchema],
    subtotal: { type: Number, required: true },
    gstPercentage: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Paid", "Unpaid", "Partial"],
      default: "Unpaid",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Cash", "Card", "UPI", "Other"],
      default: "Cash",
    },
    paidAmount: { type: Number, default: 0 },
    balanceAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Remove the pre-save hook since we're handling bill number generation in the API

export default mongoose.models.Bill ||
  mongoose.model<IBill>("Bill", BillSchema);
