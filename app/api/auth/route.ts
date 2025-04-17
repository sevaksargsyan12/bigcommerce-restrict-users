import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const context = searchParams.get('context');
  const scope = searchParams.get('scope');

  try {
    console.log('DDDD--->',process.env.CLIENT_ID,process.env.CLIENT_SECRET,process.env.APP_URL);
    const result = await axios.post('https://login.bigcommerce.com/oauth2/token', {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: `${process.env.APP_URL}/api/auth`,
      grant_type: 'authorization_code',
      code,
      scope,
      context,
    });

    const storeHash = result.data.context;

    const html = `
      <html>
        <body>
          <script>
            localStorage.setItem('millpress_store_hash', '${storeHash}');
            window.location.href = '/';
          </script>
          <p>Redirecting...</p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('OAuth error:', error);
    return new NextResponse('OAuth failed', { status: 500 });
  }
}
