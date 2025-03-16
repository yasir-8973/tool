import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: number;
  category: "power-tool" | "accessory" | "spare-part" | "other";
  stock: number; // Added this field
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: ["power-tool", "accessory", "spare-part", "other"],
      default: "power-tool",
    },
    stock: { type: Number, default: 0 }, // Add this field to the schema
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
