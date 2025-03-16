"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For filtering/searching
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      // Remove the deleted product from the list
      setProducts(products.filter((product) => product._id !== productId));
      alert("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white p-4 rounded shadow-md">
          <p className="text-center">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white p-4 rounded shadow-md">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/products/create"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add New Product
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3 text-gray-500"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Products count */}
        <div className="mb-4">
          <p>Total Products: {filteredProducts.length}</p>
        </div>

        {/* Products list */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            {searchTerm ? (
              <p className="text-gray-500">No products match your search.</p>
            ) : (
              <p className="text-gray-500">No products found.</p>
            )}
            <Link
              href="/products/create"
              className="text-blue-500 mt-2 inline-block"
            >
              Add New Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-right p-2">Price</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-center p-2">Stock</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{product.name}</td>
                    <td className="text-right p-2">₹{product.price}</td>
                    <td className="p-2">{product.category || "-"}</td>
                    <td className="text-center p-2">{product.stock || "-"}</td>
                    <td className="p-2">
                      <div className="flex space-x-2 justify-center">
                        <Link
                          href={`/products/${product._id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
