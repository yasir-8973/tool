"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";

interface CustomerFormData {
  name: string;
  aadharNo: string;
  address: string;
  phoneNo: string;
}

const CreateCustomerPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>();

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create customer");
      }

      alert("Customer created successfully!");
      router.push("/customers");
    } catch (error) {
      console.error("Error creating customer:", error);
      alert(
        `Failed to create customer: ${
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
        <Link href="/customers" className="text-blue-600 hover:text-blue-800">
          ← Back to Customers
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Add New Customer</h1>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="name">
              Name*
            </label>
            <input
              id="name"
              type="text"
              {...register("name", { required: "Name is required" })}
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="aadharNo"
            >
              Aadhar Number*
            </label>
            <input
              id="aadharNo"
              type="text"
              {...register("aadharNo", {
                required: "Aadhar number is required",
                pattern: {
                  value: /^\d{12}$/,
                  message: "Aadhar must be 12 digits",
                },
              })}
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.aadharNo && (
              <p className="text-red-500 text-sm mt-1">
                {errors.aadharNo.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="phoneNo">
              Phone Number*
            </label>
            <input
              id="phoneNo"
              type="text"
              {...register("phoneNo", {
                required: "Phone number is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Phone must be 10 digits",
                },
              })}
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.phoneNo && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phoneNo.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="address">
              Address*
            </label>
            <textarea
              id="address"
              {...register("address", { required: "Address is required" })}
              rows={3}
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-5 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create Customer"}
            </button>

            <Link
              href="/customers"
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

export default CreateCustomerPage;
