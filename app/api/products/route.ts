import { NextResponse } from 'next/server';
import { getAllProducts } from '@/app/lib/bigcommerceService';

export async function GET() {
  const products = await getAllProducts();
  return NextResponse.json(products);
}
