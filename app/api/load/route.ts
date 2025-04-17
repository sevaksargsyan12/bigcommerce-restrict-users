import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const signedJwt = searchParams.get('signed_payload_jwt');

  try {
    const decoded: any = jwt.verify(signedJwt as string, process.env.CLIENT_SECRET!);
    const storeHash = decoded.context;
    return NextResponse.redirect(`${process.env.APP_URL}/?store=${storeHash}`);
  } catch (err) {
    console.error('JWT verification failed:', err);
    return new NextResponse('Unauthorized', { status: 401 });
  }
}
