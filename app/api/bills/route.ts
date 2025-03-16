import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Bill from "@/models/Bill";
import Product from "@/models/Product";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const url = new URL(request.url);
    const billType = url.searchParams.get("billType");
    const billCategory = url.searchParams.get("billCategory");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Build query
    const query: any = {};

    if (billType) {
      query.billType = billType;
    }

    if (billCategory) {
      query.billCategory = billCategory;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const bills = await Bill.find(query)
      .populate("customer", "name phoneNo")
      .sort({ createdAt: -1 });

    return NextResponse.json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    return NextResponse.json(
      { error: "Failed to fetch bills" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

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
    let paidAmount = 0;
    if (body.paymentStatus === "Paid") {
      paidAmount = total;
    } else if (body.paymentStatus === "Partial") {
      paidAmount = body.paidAmount || 0;
    }

    try {
      // Manually generate bill number instead of relying on pre-save hook
      const count = await Bill.countDocuments();
      const prefix = body.billType === "GST" ? "GST" : "NON";
      const date = new Date();
      const year = date.getFullYear().toString().substr(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const billNumber = `${prefix}${year}${month}-${(count + 1)
        .toString()
        .padStart(4, "0")}`;

      // Update stock for each product
      for (const item of body.items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return NextResponse.json(
            { error: `Product not found: ${item.productName}` },
            { status: 404 }
          );
        }

        if (product.stock < item.stock) {
          return NextResponse.json(
            {
              error: `Insufficient stock for ${item.productName}. Available: ${product.stock}, Requested: ${item.stock}`,
            },
            { status: 400 }
          );
        }

        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.stock } },
          { new: true }
        );
      }

      // Create the bill with manually generated bill number
      const bill = await Bill.create({
        ...body,
        billNumber,
        items,
        subtotal,
        gstAmount,
        total,
        paidAmount,
        balanceAmount: total - paidAmount,
      });

      return NextResponse.json(bill, { status: 201 });
    } catch (error) {
      // If there's an error, log it
      console.error("Error during bill creation:", error);
      throw error; // Re-throw to be caught by the outer try-catch
    }
  } catch (error: any) {
    console.error("Error creating bill:", error);
    return NextResponse.json(
      { error: `Failed to create bill: ${error.message}` },
      { status: 500 }
    );
  }
}
