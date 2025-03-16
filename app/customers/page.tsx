"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For filtering/searching
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/customers");

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError("Failed to load customers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      // Remove the deleted customer from the list
      setCustomers(customers.filter((customer) => customer._id !== customerId));
      alert("Customer deleted successfully");
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer");
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNo.includes(searchTerm) ||
      customer.aadharNo.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white p-4 rounded shadow-md">
          <p className="text-center">Loading customers...</p>
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
            onClick={fetchCustomers}
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
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link
          href="/customers/create"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add New Customer
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, phone or Aadhar no."
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

        {/* Customers count */}
        <div className="mb-4">
          <p>Total Customers: {filteredCustomers.length}</p>
        </div>

        {/* Customers list */}
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8">
            {searchTerm ? (
              <p className="text-gray-500">No customers match your search.</p>
            ) : (
              <p className="text-gray-500">No customers found.</p>
            )}
            <Link
              href="/customers/create"
              className="text-blue-500 mt-2 inline-block"
            >
              Add New Customer
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-left p-2">Aadhar</th>
                  <th className="text-left p-2">Address</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{customer.name}</td>
                    <td className="p-2">{customer.phoneNo}</td>
                    <td className="p-2">{customer.aadharNo}</td>
                    <td className="p-2 truncate max-w-xs">
                      {customer.address}
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2 justify-center">
                        <Link
                          href={`/customers/${customer._id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteCustomer(customer._id)}
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

export default CustomersPage;
