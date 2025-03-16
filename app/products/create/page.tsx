"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";

interface ProductFormData {
  name: string;
  price: number;
  category: "power-tool" | "accessory" | "spare-part" | "other";
  stock: number;
  description?: string;
}

const CreateProductPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>();

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);

    try {
      const productData = {
        ...data,
        price: typeof data.price === "string" ? Number(data.price) : data.price,
        stock: typeof data.stock === "string" ? Number(data.stock) : data.stock,
      };
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      alert("Product created successfully!");
      router.push("/products");
    } catch (error) {
      console.error("Error creating product:", error);
      alert(
        `Failed to create product: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/products" className="text-blue-600 hover:text-blue-800">
          ← Back to Products
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="name">
              Product Name*
            </label>
            <input
              id="name"
              type="text"
              {...register("name", { required: "Product name is required" })}
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="price">
              Price (₹)*
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              {...register("price", {
                required: "Price is required",
                min: {
                  value: 0,
                  message: "Price must be greater than or equal to 0",
                },
              })}
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">
                {errors.price.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="category"
            >
              Category*
            </label>
            <select
              id="category"
              {...register("category", { required: "Category is required" })}
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="power-tool">Power Tool</option>
              <option value="accessory">Accessory</option>
              <option value="spare-part">Spare Part</option>
              <option value="other">Other</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="stock">
              Quantity*
            </label>
            <input
              id="stock"
              type="number"
              {...register("stock", {
                required: "Quantity is required",
                min: { value: 0, message: "Quantity cannot be negative" },
              })}
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.stock && (
              <p className="text-red-500 text-sm mt-1">
                {errors.stock.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              {...register("description")}
              rows={3}
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-5 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create Product"}
            </button>

            <Link
              href="/products"
              className="bg-gray-500 text-white px-5 py-3 rounded hover:bg-gray-600 font-medium transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductPage;
