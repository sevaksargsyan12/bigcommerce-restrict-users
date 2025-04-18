'use client';

import clsx from 'clsx';
import { useEffect } from 'react';

export interface ICustomer {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
}

export interface CustomersListProps {
  customers: ICustomer[];
  onSelect?: (customer: ICustomer) => void;
  onRemove?: (customer: ICustomer) => void;
}

export function CustomersList({ customers, onSelect, onRemove }: CustomersListProps) {
  useEffect(() => {
    console.log('CustomersList rendered with', customers.length, 'customers');
  }, [customers]);

  if (!customers.length && onSelect) {
    return <div className="p-2 text-gray-500">No customers found</div>;
  }

  return (
    <ul className="bg-white rounded-lg max-h-40 overflow-y-auto inline-block w-full">
      {customers.map((customer) => (
        <li
          key={customer.id}
          className={clsx(
            'flex items-center justify-between p-2 transition-colors',
            onSelect && 'hover:bg-blue-50 cursor-pointer',
            onRemove && 'bg-red-50 hover:bg-red-100'
          )}
          onClick={onSelect ? () => onSelect(customer) : undefined}
        >
          <span className="text-gray-700">
            {customer.first_name} {customer.last_name} – {customer.company}
          </span>
          {onRemove && (
            <button
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-full ml-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation(); // Prevent li click from triggering
                onRemove(customer);
              }}
            >
              Remove
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}