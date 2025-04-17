import { NextRequest, NextResponse } from 'next/server';
import { createMetafield } from '@/lib/bigcommerceService';

export async function POST(req: NextRequest) {
  const { productId, key, value } = await req.json();
  const result = await createMetafield(productId, { key, value });

  return NextResponse.json({ success: !!result });
}
