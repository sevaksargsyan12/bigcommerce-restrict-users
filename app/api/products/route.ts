import { NextResponse } from 'next/server';
import { getAllProducts } from '@/app/lib/bigcommerceService';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword') || '';
  const limit = parseInt(searchParams.get('limit') || '5');

  const products = await getAllProducts(keyword, limit);
  return NextResponse.json(products);
}
