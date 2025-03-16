import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Bill from "@/models/Bill";
import Product from "@/models/Product";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const bill = await Bill.findById(params.id).populate(
      "customer",
      "name aadharNo address phoneNo"
    );

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json(bill);
  } catch (error) {
    console.error("Error fetching bill:", error);
    return NextResponse.json(
      { error: "Failed to fetch bill" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();

    // Get original bill to calculate stock changes
    const originalBill = await Bill.findById(params.id);
    if (!originalBill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // Calculate amounts for each item
    const items = body.items.map((item: any) => ({
      ...item,
      amount: item.stock * item.price,
    }));

    // Calculate subtotal
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.amount,
      0
    );

    // Calculate GST amount (ensure correct type conversion)
    const gstPercentage = Number(body.gstPercentage || 0);
    const gstAmount =
      body.billType === "GST" ? (subtotal * gstPercentage) / 100 : 0;

    // Calculate total
    const total = subtotal + gstAmount;

    // Set paidAmount based on payment status
    let paidAmount = body.paidAmount || 0;
    if (body.paymentStatus === "Paid") {
      paidAmount = total;
    } else if (body.paymentStatus === "Unpaid") {
      paidAmount = 0;
    }

    // Update stock for products
    // First return stock for all original bill items
    for (const oldItem of originalBill.items) {
      await Product.findByIdAndUpdate(
        oldItem.product,
        { $inc: { stock: oldItem.stock } },
        { new: true }
      );
    }

    // Then subtract stock for new bill items
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.stock } },
        { new: true }
      );
    }

    const updatedBill = await Bill.findByIdAndUpdate(
      params.id,
      {
        ...body,
        items,
        subtotal,
        gstAmount,
        total,
        paidAmount,
        balanceAmount: total - paidAmount,
      },
      { new: true, runValidators: true }
    );

    if (!updatedBill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBill);
  } catch (error) {
    console.error("Error updating bill:", error);
    return NextResponse.json(
      { error: "Failed to update bill" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Get the bill to restore product stock before deletion
    const bill = await Bill.findById(params.id);
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // Restore product stock
    for (const item of bill.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.stock } },
        { new: true }
      );
    }

    const deletedBill = await Bill.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Bill deleted successfully" });
  } catch (error) {
    console.error("Error deleting bill:", error);
    return NextResponse.json(
      { error: "Failed to delete bill" },
      { status: 500 }
    );
  }
}
