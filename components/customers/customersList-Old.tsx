"use client";

import clsx from "clsx";
import { useEffect } from "react";

export interface ICustomer {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
}

export interface CustomersListProps {
  customers: ICustomer[];
  allocatedUsersList: string[];
  onSelect?: (customer: ICustomer) => void;
  onRemove?: (customer: ICustomer) => void;
  onAllocate: (customer: ICustomer) => void;
}

export function CustomersList({
  customers,
  onSelect,
  onRemove,
  onAllocate,
  allocatedUsersList,
}: CustomersListProps) {
  useEffect(() => {
    console.log("CustomersList rendered with", customers.length, "customers");
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
            "flex items-center justify-between p-2 transition-colors",
            onSelect && "hover:bg-blue-50",
            onRemove && "bg-red-50 hover:bg-red-100"
          )}
        >
          <span 
            onClick={onSelect ? () => onSelect(customer) : undefined}
            className="text-gray-700 border-2 rounded-2xl p-2 cursor-pointer">
            {customer.first_name} {customer.last_name} – {customer.company}
          </span>
          {allocatedUsersList?.includes(customer.id) ? (
            <span className="bg-amber-900 text-[14px] p-2 text-white rounded-2xl pointer-events-none cursor-no-drop">Allocated</span>
          ) : (
            <span onClick={() => onAllocate(customer)} className="bg-green-700 hover:bg-green-900 p-2 rounded-2xl text-white text-[14px] cursor-pointer">
              Allocate {customer.first_name}
            </span>
          )}
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
