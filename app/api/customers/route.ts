import { NextResponse } from 'next/server';
import { getAllCustomers } from '@/app/lib/bigcommerceService';

export async function GET() {
  const customers = await getAllCustomers();
  return NextResponse.json(customers);
}
