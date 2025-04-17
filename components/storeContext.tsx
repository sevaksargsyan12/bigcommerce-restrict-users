'use client';

import { useEffect, useState } from 'react';

export function StoreContextInfo() {
  const [storeHash, setStoreHash] = useState<string | null>(null);

  useEffect(() => {
    const hash = localStorage.getItem('millpress_store_hash');
    if (hash) setStoreHash(hash);
  }, []);

  return (
    <>
      {storeHash ? (
        <p className=''>Store context: {storeHash}</p>
      ) : (
        <p>No store loaded</p>
      )}
    </>
  );
}
