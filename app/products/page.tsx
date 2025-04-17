'use client';

import { useEffect, useState } from 'react';
import { isHtml } from '../lib/helpers/isHtml';
import { CustomersList, ICustomer } from '@/components/customers/customersList';
import clsx from 'clsx';

export default function ProductListPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMeta, setNewMeta] = useState<Record<number, { key: string; value: string }>>({});
  const [selectedCustomers, setSelectedCustomers] = useState<Record<number | string, any[]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [activeProduct, setActiveProduct] = useState();

  useEffect(() => {
    setSearchTerm('');
  },[activeProduct]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
      data?.length && setActiveProduct(data[0].id);
      setLoading(false);
    };

    const fetchCustomers = async () => {
      const res = await fetch('/api/customers');
      const data = await res.json();
      console.log('Customers-->',data);
      setCustomers(data);
    };

    fetchCustomers();
    fetchProducts();
  }, []);

  const filteredCustomers = customers
  .filter((c) => {
    const currentCustumer = c;
    if (`${c.first_name} ${c.last_name} ${c.company}`.toLowerCase().includes(searchTerm.toLowerCase()) ) {
      if(!activeProduct) {
          return true;
      } else {
        return !selectedCustomers[activeProduct]?.map((c) => c.id).includes(currentCustumer.id)
      }
    } 
  })

  console.log('kokos', filteredCustomers, searchTerm.toLowerCase());

  const handleAddMetafield = async (productId: number) => {
    const selected = selectedCustomers[productId] || [];
    const customerIds = selected.map((c) => c.id).join(',');
  
    const res = await fetch('/api/metafield', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        key: 'related_customers',
        value: customerIds,
      }),
    });
  
    const result = await res.json();
    alert(result.success ? 'Metafield added' : 'Failed to add metafield');
  };
  
  const handleCustomerSelect = (customer: ICustomer, productId: string) => {
    setSelectedCustomers((prev) => ({
      ...prev,
      [productId]: [...(prev[productId] || []),{id: customer.id, company: customer.company}]
    }))
    // alert(customer.first_name + ' attached to product ' + productId);
  }

  const handleCustomerRemove = (customer: ICustomer, productId: string) => {
    console.error({customer}, selectedCustomers[productId]);
    setSelectedCustomers((prev) => ({
      ...prev,
      [productId]: [(prev[productId] || []).filter(c => c.id !== customer.id)]
    }))
    // alert(customer.first_name + ' attached to product ' + productId);
  }

  if (loading) return <p>Loading...</p>;

  return (
    <main style={{ padding: 20 }}>
      <h1 className="text-4xl font-bold text-blue-800 pt">Product List {customers.length}</h1>
      {products.map((product) => (

        <div 
         key={product.id}
         className={clsx(
          'product-wrapper p-6 m-2 rounded-2xl border-blue-300 border-2 relative',
          activeProduct === product.id && 'bg-green-100',
          activeProduct !== product.id && 'opacity-60',
        )}
          >
                    <pre style={{color:'red'}}>
          {JSON.stringify(selectedCustomers[product.id])}
         {selectedCustomers[product.id] && 
                  <CustomersList customers={selectedCustomers[product.id] || []} onRemove={(customer: ICustomer) => handleCustomerRemove(customer, product.id)} />
        } 
        </pre>
          <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl p-1 m-1 cursor-pointer absolute top-2 right-4 text-[14px]" onClick={() => setActiveProduct(product.id)}>Set</button>
  
          <h3 className='text-3xl font-bold text-blue-800'>{product.name} – ${product.price}</h3>
          {activeProduct === product.id && 
          (<div className='restrict-customers-wrapper'>
            <input
                type="text"
                placeholder="Search customers..."
                className="border px-2 py-1 mb-2"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            <CustomersList customers={filteredCustomers} onSelect={(customer: ICustomer) => handleCustomerSelect(customer, product.id)} />
            <div className="flex flex-wrap mt-2 gap-2">
              {(selectedCustomers[product.id] || []).map((c) => (
                <span key={c.id} className="bg-green-100 px-2 py-1 rounded text-sm">
                  {c.first_name} {c.last_name}
                </span>
              ))}
            </div>
          </div>)}
        </div>
      ))}
    </main>
  );
}
