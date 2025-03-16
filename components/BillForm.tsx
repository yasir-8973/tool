"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CustomerForm from "./CustomerForm";
import ProductForm from "./ProductForm";

const BillForm: React.FC = () => {
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [billItems, setBillItems] = useState<any[]>([]);
  const [billType, setBillType] = useState<"GST" | "NON-GST">("NON-GST");
  const [billCategory, setBillCategory] = useState<
    "Sales" | "Service" | "Repair"
  >("Sales");
  const [gstPercentage, setGstPercentage] = useState<number>(18);
  const [paymentStatus, setPaymentStatus] = useState<
    "Paid" | "Unpaid" | "Partial"
  >("Unpaid");
  const [paymentMethod, setPaymentMethod] = useState<
    "Cash" | "Card" | "UPI" | "Other"
  >("Cash");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Track products with available stock
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);

  // Fetch available products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        setAvailableProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Update available products when bill items change
  useEffect(() => {
    if (!availableProducts.length) return;

    const updatedAvailableProducts = availableProducts.map((product) => {
      // Find if product is in bill items
      const billItem = billItems.find((item) => item.product === product._id);

      // Calculate remaining stock
      const remainingStock = billItem
        ? Math.max(0, product.stock - billItem.stock)
        : product.stock;

      return {
        ...product,
        availableStock: remainingStock,
      };
    });

    setAvailableProducts(updatedAvailableProducts);
  }, [billItems, availableProducts.length]);

  const calculateSubtotal = () => {
    return billItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateGSTAmount = () => {
    if (billType === "GST") {
      return (calculateSubtotal() * gstPercentage) / 100;
    }
    return 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGSTAmount();
  };

  const handleAddProduct = (product: any) => {
    // Check if product already exists in bill
    const existingIndex = billItems.findIndex(
      (item) => item.product === product.product
    );

    let updatedItems;
    if (existingIndex >= 0) {
      // Update stock and amount of existing item
      updatedItems = [...billItems];
      updatedItems[existingIndex].stock += product.stock;
      updatedItems[existingIndex].amount += product.amount;
      setBillItems(updatedItems);
    } else {
      // Add new product to bill
      updatedItems = [...billItems, product];
      setBillItems(updatedItems);
    }

    // If payment status is Paid, update the paid amount to match the new total
    if (paymentStatus === "Paid") {
      // Calculate new total based on updated items
      const newSubtotal = updatedItems.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const newGSTAmount =
        billType === "GST" ? (newSubtotal * gstPercentage) / 100 : 0;
      const newTotal = newSubtotal + newGSTAmount;
      setPaidAmount(newTotal);
    }
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = billItems.filter((_, i) => i !== index);
    setBillItems(updatedItems);

    // If payment status is Paid, update the paid amount to match total
    if (paymentStatus === "Paid") {
      const updatedSubtotal = updatedItems.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const updatedGST =
        billType === "GST" ? (updatedSubtotal * gstPercentage) / 100 : 0;
      setPaidAmount(updatedSubtotal + updatedGST);
    }
  };

  // Handle payment status change
  const handlePaymentStatusChange = (status: "Paid" | "Unpaid" | "Partial") => {
    setPaymentStatus(status);

    if (status === "Paid") {
      setPaidAmount(calculateTotal());
    } else if (status === "Unpaid") {
      setPaidAmount(0);
    }
    // For Partial, keep the current paidAmount or set to 0 if it exceeds the total
    else if (status === "Partial") {
      const total = calculateTotal();
      if (paidAmount > total) {
        setPaidAmount(total);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }

    if (billItems.length === 0) {
      alert("Please add at least one product");
      return;
    }

    // Validate paid amount for partial payment
    if (paymentStatus === "Partial") {
      const total = calculateTotal();
      if (paidAmount <= 0) {
        alert("Paid amount must be greater than 0 for partial payment");
        return;
      }
      if (paidAmount >= total) {
        alert(
          "For partial payment, paid amount must be less than the total amount"
        );
        return;
      }
    }

    const billData = {
      customer: selectedCustomer._id,
      billType,
      billCategory,
      items: billItems,
      gstPercentage: billType === "GST" ? gstPercentage : 0,
      paymentStatus,
      paymentMethod,
      paidAmount,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billData),
      });

      if (response.ok) {
        const bill = await response.json();
        alert("Bill created successfully!");
        router.push(`/bills/${bill._id}`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error creating bill:", error);
      alert("Failed to create bill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create New Bill</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="bg-white p-4 rounded shadow-md mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Customer Information</h2>
              <Link
                href="/customers/create"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add New Customer
              </Link>
            </div>

            <CustomerForm onCustomerSelect={setSelectedCustomer} />
          </div>

          {selectedCustomer && (
            <div className="bg-green-50 p-4 rounded border border-green-200 mb-4">
              <h3 className="font-semibold text-green-800">
                Selected Customer
              </h3>
              <div>
                <div>
                  <span className="font-medium">Name:</span>{" "}
                  {selectedCustomer.name}
                </div>
                <div>
                  <span className="font-medium">Phone:</span>{" "}
                  {selectedCustomer.phoneNo}{" "}
                </div>
              </div>
              <p>
                <span className="font-medium">Aadhar:</span>{" "}
                {selectedCustomer.aadharNo}
              </p>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-sm text-red-600 mt-2"
              >
                Change Customer
              </button>
            </div>
          )}

          <div className="bg-white p-4 rounded shadow-md mb-4">
            <h2 className="text-lg font-semibold mb-4">Bill Settings</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Bill Type
              </label>
              <select
                value={billType}
                onChange={(e) =>
                  setBillType(e.target.value as "GST" | "NON-GST")
                }
                className="w-full border p-2 rounded"
              >
                <option value="NON-GST">Non-GST Bill</option>
                <option value="GST">GST Bill</option>
              </select>
            </div>

            {billType === "GST" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  GST Percentage
                </label>
                <select
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(Number(e.target.value))}
                  className="w-full border p-2 rounded"
                >
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Bill Category
              </label>
              <select
                value={billCategory}
                onChange={(e) =>
                  setBillCategory(
                    e.target.value as "Sales" | "Service" | "Repair"
                  )
                }
                className="w-full border p-2 rounded"
              >
                <option value="Sales">Sales</option>
                <option value="Service">Service</option>
                <option value="Repair">Repair</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) =>
                  handlePaymentStatusChange(
                    e.target.value as "Paid" | "Unpaid" | "Partial"
                  )
                }
                className="w-full border p-2 rounded"
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
              </select>
            </div>

            {/* Removed partial payment input from here */}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value as "Cash" | "Card" | "UPI" | "Other"
                  )
                }
                className="w-full border p-2 rounded"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white p-4 rounded shadow-md mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Product</h2>
              <Link
                href="/products/create"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add New Product
              </Link>
            </div>

            <ProductForm
              onAddProduct={handleAddProduct}
              availableProducts={availableProducts}
            />
          </div>

          <div className="bg-white p-4 rounded shadow-md">
            <h2 className="text-lg font-semibold mb-4">Bill Items</h2>

            {billItems.length === 0 ? (
              <p className="text-gray-500">No items added yet.</p>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="text-left p-2">Product</th>
                        <th className="text-right p-2">Price</th>
                        <th className="text-right p-2">Qty</th>
                        <th className="text-right p-2">Amount</th>
                        <th className="p-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {billItems.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.productName}</td>
                          <td className="text-right p-2">₹{item.price}</td>
                          <td className="text-right p-2">{item.stock}</td>
                          <td className="text-right p-2">₹{item.amount}</td>
                          <td className="p-2">
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>₹{calculateSubtotal()}</span>
                  </div>

                  {billType === "GST" && (
                    <div className="flex justify-between mb-2">
                      <span>GST ({gstPercentage}%):</span>
                      <span>₹{calculateGSTAmount()}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>

                  {paymentStatus === "Partial" && (
                    <>
                      <div className="flex justify-between mt-2">
                        <span>Paid Amount:</span>
                        <div className="flex items-center">
                          <span className="mr-2">₹</span>
                          <input
                            type="number"
                            value={paidAmount}
                            onChange={(e) =>
                              setPaidAmount(Number(e.target.value))
                            }
                            min="0"
                            max={calculateTotal()}
                            step="0.01"
                            className="w-24 border p-1 rounded text-right"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Balance Due:</span>
                        <span>₹{calculateTotal() - paidAmount}</span>
                      </div>
                      {paidAmount > calculateTotal() && (
                        <p className="text-red-500 text-sm mt-1 text-right">
                          Paid amount cannot exceed total amount
                        </p>
                      )}
                      {paidAmount <= 0 && paymentStatus === "Partial" && (
                        <p className="text-red-500 text-sm mt-1 text-right">
                          Paid amount must be greater than 0
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  billItems.length === 0 ||
                  !selectedCustomer ||
                  (paymentStatus === "Partial" &&
                    (paidAmount <= 0 || paidAmount >= calculateTotal()))
                }
                className="bg-green-600 text-white px-4 py-2 rounded w-full disabled:bg-gray-400"
              >
                {isSubmitting ? "Creating Bill..." : "Create Bill"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillForm;
