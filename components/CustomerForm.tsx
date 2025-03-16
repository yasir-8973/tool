"use client";

import React, { useState, useEffect } from "react";

interface CustomerFormProps {
  onCustomerSelect: (customer: any) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onCustomerSelect }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");

  useEffect(() => {
    // Fetch customers when component mounts
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customers");
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);

    if (customerId) {
      const customer = customers.find((c) => c._id === customerId);
      if (customer) {
        onCustomerSelect(customer);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select Customer
        </label>
        <select
          value={selectedCustomer}
          onChange={handleSelectChange}
          className="w-full border p-3 rounded text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- Select a customer --</option>
          {customers.map((customer) => (
            <option key={customer._id} value={customer._id}>
              {customer.name} | {customer.phoneNo}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CustomerForm;
