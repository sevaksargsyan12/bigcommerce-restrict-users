import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log('App uninstalled:', req.url);
  return new NextResponse('Uninstall complete');
}
