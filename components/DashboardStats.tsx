'use client';

import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';

interface Stats {
  totalBills: number;
  totalSales: number;
  totalService: number;
  totalRepair: number;
  totalRevenue: number;
  gstBills: number;
  nonGstBills: number;
  recentBills: any[];
}

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalBills: 0,
    totalSales: 0,
    totalService: 0,
    totalRepair: 0,
    totalRevenue: 0,
    gstBills: 0,
    nonGstBills: 0,
    recentBills: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>(
    'week'
  );

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setIsLoading(true);

    try {
      // Get date range based on selected time range
      let startDate = new Date();

      if (timeRange === 'today') {
        startDate = new Date(startDate.setHours(0, 0, 0, 0));
      } else if (timeRange === 'week') {
        startDate = subDays(new Date(), 7);
      } else if (timeRange === 'month') {
        startDate = subDays(new Date(), 30);
      }

      const endDate = new Date();

      // Fetch all bills in the date range
      const response = await fetch(
        `/api/bills?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch bills');
      }

      const bills = await response.json();

      // Calculate stats
      const totalBills = bills.length;
      const totalSales = bills.filter(
        (bill: any) => bill.billCategory === 'Sales'
      ).length;
      const totalService = bills.filter(
        (bill: any) => bill.billCategory === 'Service'
      ).length;
      const totalRepair = bills.filter(
        (bill: any) => bill.billCategory === 'Repair'
      ).length;
      const totalRevenue = bills.reduce(
        (sum: number, bill: any) => sum + bill.total,
        0
      );
      const gstBills = bills.filter(
        (bill: any) => bill.billType === 'GST'
      ).length;
      const nonGstBills = bills.filter(
        (bill: any) => bill.billType === 'NON-GST'
      ).length;

      // Get recent bills (last 5)
      const recentBills = bills.slice(0, 5);

      setStats({
        totalBills,
        totalSales,
        totalService,
        totalRepair,
        totalRevenue,
        gstBills,
        nonGstBills,
        recentBills,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded shadow-md">
        <p className="text-center">Loading dashboard stats...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Dashboard</h2>

        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1 rounded ${
              timeRange === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Bills</h3>
          <p className="text-2xl font-bold">{stats.totalBills}</p>
        </div>

        <div className="bg-white p-4 rounded shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold">₹{stats.totalRevenue}</p>
        </div>

        <div className="bg-white p-4 rounded shadow-md">
          <h3 className="text-sm font-medium text-gray-500">GST vs Non-GST</h3>
          <p className="text-2xl font-bold">
            {stats.gstBills} / {stats.nonGstBills}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow-md">
          <h3 className="text-sm font-medium text-gray-500">
            Sales / Service / Repair
          </h3>
          <p className="text-2xl font-bold">
            {stats.totalSales} / {stats.totalService} / {stats.totalRepair}
          </p>
        </div>
      </div>

      {/* Recent bills */}
      <div className="bg-white p-4 rounded shadow-md">
        <h3 className="font-semibold mb-4">Recent Bills</h3>

        {stats.recentBills.length === 0 ? (
          <p className="text-gray-500">No recent bills found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left p-2">Bill Number</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-center p-2">Category</th>
                  <th className="text-right p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBills.map((bill) => (
                  <tr key={bill._id} className="border-b">
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
                    <td className="text-right p-2 font-medium">
                      ₹{bill.total}
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

export default DashboardStats;
