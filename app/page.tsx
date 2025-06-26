import { StoreContextInfo } from '@/components/storeContext';
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '20px' }}>
      <h1 className='bg-blend-color-dodge text-center border-2 pt-8'>Welcome to Your BigCommerce App</h1>
      <StoreContextInfo />
      {/* <Link href="/products" style={{ display: 'block', marginTop: 20 }}>
        Go to Product List →
      </Link> */}
      <Link href="/customers" style={{ display: 'block', marginTop: 20 }}>
        Go to Product List →
      </Link>
    </main>
  );
}
