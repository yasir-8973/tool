"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

interface BillDetailPageProps {
  params: {
    id: string;
  };
}

export default function BillDetailPage({ params }: BillDetailPageProps) {
  const router = useRouter();
  const [bill, setBill] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const response = await fetch(`/api/bills/${params.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch bill");
        }

        const data = await response.json();
        setBill(data);
      } catch (error) {
        console.error("Error fetching bill:", error);
        setError("Failed to load bill details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBill();
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this bill?")) return;

    try {
      const response = await fetch(`/api/bills/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete bill");
      }

      alert("Bill deleted successfully");
      router.push("/bills");
    } catch (error) {
      console.error("Error deleting bill:", error);
      alert("Failed to delete bill");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white p-8 rounded shadow-md">
          <p className="text-center">Loading bill details...</p>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white p-8 rounded shadow-md">
          <p className="text-red-500">{error || "Bill not found"}</p>
          <Link href="/bills" className="text-blue-500 mt-4 inline-block">
            Back to Bills
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white p-8 rounded shadow-md">
        <div className="print:hidden flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bill Details</h1>

          <div className="flex space-x-2">
            <Link
              href="/bills"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded"
            >
              Back to List
            </Link>
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Print Bill
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Bill header */}
        <div className="mb-8 border-b pb-8">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-bold">Power Tools Billing</h2>
              <p className="text-gray-600">123 Main Street, Bangalore</p>
              <p className="text-gray-600">Phone: 9876543210</p>
              {bill.billType === "GST" && (
                <p className="text-gray-600">GSTIN: 29AABCT123456789</p>
              )}
            </div>

            <div className="text-right">
              <p className="font-bold">
                {bill.billType === "GST" ? "GST Invoice" : "Invoice"}
              </p>
              <p>
                Bill Number:{" "}
                <span className="font-medium">{bill.billNumber}</span>
              </p>
              <p>
                Date:{" "}
                <span className="font-medium">
                  {format(new Date(bill.createdAt), "dd/MM/yyyy")}
                </span>
              </p>
              <p>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    bill.billCategory === "Sales"
                      ? "bg-green-100 text-green-800"
                      : bill.billCategory === "Service"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {bill.billCategory}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Customer details */}
        <div className="mb-8">
          <h3 className="font-semibold mb-2">Customer Details</h3>
          {bill.customer && (
            <div className="pl-4 border-l-4 border-gray-200">
              <p>
                <span className="font-medium">Name:</span> {bill.customer.name}
              </p>
              <p>
                <span className="font-medium">Aadhar:</span>{" "}
                {bill.customer.aadharNo}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {bill.customer.phoneNo}
              </p>
              <p>
                <span className="font-medium">Address:</span>{" "}
                {bill.customer.address}
              </p>
            </div>
          )}
        </div>

        {/* Bill items */}
        <div className="mb-8">
          <h3 className="font-semibold mb-2">Bill Items</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border text-left p-2">S.No</th>
                  <th className="border text-left p-2">Product</th>
                  <th className="border text-right p-2">Price</th>
                  <th className="border text-right p-2">Quantity</th>
                  <th className="border text-right p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{item.productName}</td>
                    <td className="border text-right p-2">₹{item.price}</td>
                    <td className="border text-right p-2">{item.stock}</td>
                    <td className="border text-right p-2">₹{item.amount}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="border text-right p-2 font-medium">
                    Subtotal
                  </td>
                  <td className="border text-right p-2 font-medium">
                    ₹{bill.subtotal}
                  </td>
                </tr>

                {bill.billType === "GST" && (
                  <tr className="bg-gray-50">
                    <td
                      colSpan={4}
                      className="border text-right p-2 font-medium"
                    >
                      GST ({bill.gstPercentage}%)
                    </td>
                    <td className="border text-right p-2 font-medium">
                      ₹{bill.gstAmount}
                    </td>
                  </tr>
                )}

                <tr className="bg-gray-100">
                  <td colSpan={4} className="border text-right p-2 font-bold">
                    Total
                  </td>
                  <td className="border text-right p-2 font-bold">
                    ₹{bill.total}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment details */}
        <div className="mb-8 flex justify-between">
          <div>
            <h3 className="font-semibold mb-2">Payment Details</h3>
            <p>
              <span className="font-medium">Payment Status:</span>{" "}
              {bill.paymentStatus}
            </p>
            <p>
              <span className="font-medium">Payment Method:</span>{" "}
              {bill.paymentMethod}
            </p>
          </div>

          <div className="text-right">
            <p className="text-gray-500 text-sm">
              Thank you for your business!
            </p>
            <p className="text-gray-500 text-sm mt-4">
              This is a computer-generated invoice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
