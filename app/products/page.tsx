'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { CustomersList,ICustomer } from '@/components/customers/customersList';

interface IProduct {
  id: string;
  name: string;
  price: number;
  custom_fields: Array<{ id?: number; name: string; value: string }>;
}

interface ICustomField {
  id?: number;
  name: string;
  value: string;
}

export default function ProductListPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomers, setSelectedCustomers] = useState<Record<string, ICustomer[]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  useEffect(() => {
    setSearchTerm('');
  }, [activeProductId]);

  useEffect(() => {
    const fetchProducts = async (customers: ICustomer[]) => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
        if (data?.length) setActiveProductId(data[0].id);

        // Initialize selected customers from custom fields
        const initialSelected: Record<string, ICustomer[]> = {};
        for (const product of data) {
          const restrictUsersField = product.custom_fields.find(
            (field: ICustomField) => field.name === 'restrict_users'
          );

          if (restrictUsersField && restrictUsersField.value) {
            const customerIds = restrictUsersField.value.split(',');
            initialSelected[product.id] = customers.filter((c) =>
              customerIds.includes(c.id.toString())
            );
          }
        }
        console.log({initialSelected});

        setSelectedCustomers(initialSelected);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const fetchCustomers = async () => {
      try {
        const res = await fetch('/api/customers');
        const data = await res.json();
        setCustomers(data);
        return data;
      } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
      }
    };

    const initializeData = async () => {
      const customers :ICustomer[] = await fetchCustomers();
      await fetchProducts(customers);
      setLoading(false);
    };

    initializeData();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const searchString = `${customer.first_name} ${customer.last_name} ${customer.company}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    if (!activeProductId) return matchesSearch;
    return matchesSearch && !selectedCustomers[activeProductId]?.some((c) => c.id === customer.id);
  });

  const handleAddCustomField = async (productId: string) => {
    const selected = selectedCustomers[productId] || [];
    const customerIds = selected.map((c) => c.id).join(',');
    alert(customerIds);
    // return;

    try {
      const res = await fetch('/api/custom-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          name: 'restrict_users',
          value: customerIds,
        }),
      });

      const result = await res.json();
      alert(result.success ? 'Customers saved successfully' : 'Failed to save customers');
    } catch (error) {
      console.error('Error managing custom field:', error);
      alert('Error managing customers');
    }
  };

  const handleCustomerSelect = (customer: ICustomer, productId: string) => {
    setSelectedCustomers((prev) => ({
      ...prev,
      [productId]: [...(prev[productId] || []), customer],
    }));
  };

  const handleCustomerRemove = (customerId: string, productId: string) => {
    setSelectedCustomers((prev) => ({
      ...prev,
      [productId]: prev[productId].filter((c) => c.id !== customerId),
    }));
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <main className="p-5">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Product List</h1>
      <div className="grid gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className={clsx(
              'p-6 rounded-xl border-2 border-blue-300 relative',
              activeProductId === product.id ? 'bg-green-50' : 'bg-gray-50 opacity-90',
              'transition-all duration-200'
            )}
          >
            <button
              className="absolute top-3 right-3 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-full"
              onClick={() => setActiveProductId(product.id)}
            >
              {activeProductId === product.id ? 'Active' : 'Select'}
            </button>

            <h3 className="text-2xl font-semibold text-blue-800 mb-2">
              {product.name} – ${product.price}
            </h3>

            {activeProductId === product.id && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search customers..."
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                    onClick={() => handleAddCustomField(product.id)}
                  >
                    Save Customers
                  </button>
                </div>

                <CustomersList
                  customers={filteredCustomers}
                  onSelect={(customer) => handleCustomerSelect(customer, product.id)}
                />

                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Selected Customers:</h4>
                  <CustomersList
                    customers={selectedCustomers[product.id] || []}
                    onRemove={(customer) => handleCustomerRemove(customer.id, product.id)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}