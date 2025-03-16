import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function GET() {
  console.log('Customer API GET called');
  try {
    console.log('Attempting to connect to MongoDB...');
    await connectDB();
    console.log('MongoDB connection successful, now fetching customers...');
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    console.log(`Found ${customers.length} customers`);
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Check if customer with same Aadhar already exists
    const existingCustomer = await Customer.findOne({
      aadharNo: body.aadharNo,
    });
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this Aadhar number already exists' },
        { status: 400 }
      );
    }

    const customer = await Customer.create(body);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
