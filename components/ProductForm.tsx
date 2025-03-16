"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

interface ProductFormProps {
  onAddProduct: (product: any) => void;
  availableProducts?: any[]; // Prop to receive filtered products
}

interface ProductFormData {
  product: string;
  stock: number;
}

const ProductForm: React.FC<ProductFormProps> = ({
  onAddProduct,
  availableProducts = [],
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>();

  const watchedProduct = watch("product");
  const watchedQuantity = watch("stock");

  useEffect(() => {
    // If availableProducts prop is provided, use it
    if (availableProducts && availableProducts.length > 0) {
      setProducts(availableProducts);
      setIsLoading(false);
      return;
    }

    // Otherwise fetch products when component mounts
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        if (data.length > 0) setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [availableProducts]);

  // Update selected product when product selection changes
  useEffect(() => {
    if (watchedProduct) {
      const product = products.find((p) => p._id === watchedProduct);
      setSelectedProduct(product);

      // Reset stock if it's more than available stock
      if (product) {
        // Use availableStock if it exists, otherwise use stock
        const maxStock =
          product.availableStock !== undefined
            ? product.availableStock
            : product.stock;
        if (watchedQuantity > maxStock) {
          setValue("stock", maxStock);
        }
      }
    } else {
      setSelectedProduct(null);
    }
  }, [watchedProduct, products, setValue, watchedQuantity]);

  // Ensure the input is always within valid range
  useEffect(() => {
    if (selectedProduct && watchedQuantity) {
      const maxStock =
        selectedProduct.availableStock !== undefined
          ? selectedProduct.availableStock
          : selectedProduct.stock;

      if (Number(watchedQuantity) > maxStock) {
        setValue("stock", maxStock);
      }

      if (Number(watchedQuantity) < 1) {
        setValue("stock", 1);
      }
    }
  }, [watchedQuantity, selectedProduct, setValue]);

  // Hide success message after 3 seconds
  useEffect(() => {
    if (addSuccess) {
      const timer = setTimeout(() => {
        setAddSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [addSuccess]);

  const onSubmit = (data: ProductFormData) => {
    if (!selectedProduct) return;

    // Get the maximum available stock
    const maxAvailableStock =
      selectedProduct.availableStock !== undefined
        ? selectedProduct.availableStock
        : selectedProduct.stock;

    // Validate quantity again to ensure it doesn't exceed available stock
    if (Number(data.stock) > maxAvailableStock) {
      alert(
        `Cannot add more than ${maxAvailableStock} units. Please adjust quantity.`
      );
      return;
    }

    const productData = {
      product: selectedProduct._id,
      productName: selectedProduct.name,
      price: selectedProduct.price,
      stock: Number(data.stock),
      amount: selectedProduct.price * Number(data.stock),
    };

    onAddProduct(productData);
    setAddSuccess(true);
    reset();
    setSelectedProduct(null);
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {addSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Product added to bill successfully!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Product</label>
          <select
            {...register("product", { required: "Please select a product" })}
            className="w-full border p-3 rounded text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Select a product --</option>
            {products.map((product) => {
              // Use availableStock if it exists, otherwise use stock
              const availableStock =
                product.availableStock !== undefined
                  ? product.availableStock
                  : product.stock;

              // Skip products with no available stock
              if (availableStock <= 0) return null;

              return (
                <option key={product._id} value={product._id}>
                  {product.name} - ₹{product.price} (Available: {availableStock}
                  )
                </option>
              );
            })}
          </select>
          {errors.product && (
            <p className="text-red-500 text-sm mt-1">
              {errors.product.message}
            </p>
          )}
        </div>

        {selectedProduct && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <input
              type="number"
              {...register("stock", {
                required: "Quantity is required",
                min: {
                  value: 1,
                  message: "Quantity must be at least 1",
                },
                max: {
                  value:
                    selectedProduct.availableStock !== undefined
                      ? selectedProduct.availableStock
                      : selectedProduct.stock,
                  message: `Cannot exceed available stock (${
                    selectedProduct.availableStock !== undefined
                      ? selectedProduct.availableStock
                      : selectedProduct.stock
                  })`,
                },
                validate: (value) =>
                  value <=
                    (selectedProduct.availableStock !== undefined
                      ? selectedProduct.availableStock
                      : selectedProduct.stock) ||
                  `Cannot exceed available stock (${
                    selectedProduct.availableStock !== undefined
                      ? selectedProduct.availableStock
                      : selectedProduct.stock
                  })`,
              })}
              className="w-full border p-3 rounded text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              max={
                selectedProduct.availableStock !== undefined
                  ? selectedProduct.availableStock
                  : selectedProduct.stock
              }
            />
            {errors.stock && (
              <p className="text-red-500 text-sm mt-1">
                {errors.stock.message}
              </p>
            )}

            <div className="mt-3 p-3 bg-gray-100 rounded-md">
              <p className="mb-1">
                <span className="font-medium">Unit Price:</span> ₹
                {selectedProduct.price}
              </p>
              <p className="mb-1">
                <span className="font-medium">Available:</span>{" "}
                {selectedProduct.availableStock !== undefined
                  ? selectedProduct.availableStock
                  : selectedProduct.stock}{" "}
                units
              </p>
              {watchedQuantity && (
                <p className="text-lg font-medium text-blue-700">
                  Total: ₹{selectedProduct.price * Number(watchedQuantity || 0)}
                </p>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedProduct}
          className="bg-blue-600 text-white px-4 py-3 rounded-md w-full text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 transition-colors"
        >
          Add to Bill
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
