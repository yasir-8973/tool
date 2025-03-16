'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

const BillsList: React.FC = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [billType, setBillType] = useState<string>('');
  const [billCategory, setBillCategory] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async (filters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      if (billType) params.append('billType', billType);
      if (billCategory) params.append('billCategory', billCategory);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/bills${queryString}`);

      if (!response.ok) {
        throw new Error('Failed to fetch bills');
      }

      const data = await response.json();
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setError('Failed to load bills. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    fetchBills({ billType, billCategory, startDate, endDate });
  };

  const handleClearFilters = () => {
    setBillType('');
    setBillCategory('');
    setStartDate('');
    setEndDate('');
    fetchBills();
  };

  const getTotalAmount = () => {
    return bills.reduce((sum, bill) => sum + bill.total, 0);
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded shadow-md">
        <p className="text-center">Loading bills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded shadow-md">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => fetchBills()}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Bills</h2>

      {/* Filters */}
      <div className="mb-4 p-4 bg-gray-50 rounded">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bill Type</label>
            <select
              value={billType}
              onChange={(e) => setBillType(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">All Types</option>
              <option value="GST">GST</option>
              <option value="NON-GST">NON-GST</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={billCategory}
              onChange={(e) => setBillCategory(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">All Categories</option>
              <option value="Sales">Sales</option>
              <option value="Service">Service</option>
              <option value="Repair">Repair</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 border rounded bg-gray-100"
          >
            Clear Filters
          </button>
          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Bills count and total */}
      <div className="mb-4 flex justify-between">
        <p>Total Bills: {bills.length}</p>
        <p className="font-bold">Total Amount: ₹{getTotalAmount()}</p>
      </div>

      {/* Bills list */}
      {bills.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No bills found.</p>
          <Link href="/entry" className="text-blue-500 mt-2 inline-block">
            Create New Bill
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left p-2">Bill Number</th>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Customer</th>
                <th className="text-center p-2">Type</th>
                <th className="text-center p-2">Category</th>
                <th className="text-right p-2">Total</th>
                <th className="text-center p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill._id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{bill.billNumber}</td>
                  <td className="p-2">
                    {format(new Date(bill.createdAt), 'dd/MM/yyyy')}
                  </td>
                  <td className="p-2">
                    {bill.customer && typeof bill.customer === 'object'
                      ? bill.customer.name
                      : 'Unknown Customer'}
                  </td>
                  <td className="text-center p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        bill.billType === 'GST'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {bill.billType}
                    </span>
                  </td>
                  <td className="text-center p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        bill.billCategory === 'Sales'
                          ? 'bg-green-100 text-green-800'
                          : bill.billCategory === 'Service'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {bill.billCategory}
                    </span>
                  </td>
                  <td className="text-right p-2 font-medium">₹{bill.total}</td>
                  <td className="text-center p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        bill.paymentStatus === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : bill.paymentStatus === 'Unpaid'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {bill.paymentStatus}
                    </span>
                  </td>
                  <td className="p-2">
                    <Link
                      href={`/bills/${bill._id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BillsList;
