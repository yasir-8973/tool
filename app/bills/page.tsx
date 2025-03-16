import React from 'react';
import Link from 'next/link';
import BillsList from '@/components/BillsList';

export default function BillsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Bills</h1>
        <Link
          href="/entry"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Create New Bill
        </Link>
      </div>

      <BillsList />
    </div>
  );
}
