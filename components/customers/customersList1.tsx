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
  restrictedUsersList: string[];
  onSelect?: (customer: ICustomer) => void;
  onRemove?: (customer: ICustomer) => void;
  onAllocate: (customer: ICustomer, removeAllocation: boolean) => void;
  onRestrict: (customer: ICustomer, removeRestriction: boolean) => void;
}

export function CustomersList({
  customers,
  onSelect,
  onRemove,
  onAllocate,
  onRestrict,
  allocatedUsersList,
  restrictedUsersList,
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
            "flex items-center justify-between p-2 transition-colors bg-blue-600 hover:bg-blue-500",
            onSelect && "hover:bg-blue-50",
            onRemove && "bg-red-50 hover:bg-red-100"
          )}
        >
          <span
            onClick={onSelect ? () => onSelect(customer) : undefined}
            className="rounded-2xl p-2 text-white  w-1/2"
          >
            {customer.first_name} {customer.last_name} –{" "}
            <span className="text-blue-900">{customer.company}</span>
          </span>
          {allocatedUsersList?.includes(customer.id) ? (
            <span
              onClick={() => onAllocate(customer, true)}
              title='Click on button to cancel allocation'
              className="bg-green-500 hover:bg-green-600 text-center text-[14px] p-2 text-white rounded-xl cursor-pointer w-[120px]">
              Allocated
            </span>
          ) : (
            <span
              onClick={restrictedUsersList?.includes(customer.id) ? () => {} : () => onAllocate(customer, false)}
              className={clsx(
                "bg-white text-center p-2 rounded-xl w-[120px] text-black  text-[14px] cursor-pointer",
                restrictedUsersList?.includes(customer.id) ?
                  "opacity-50 !cursor-not-allowed hover:bg-white hover:text-black" : "hover:bg-green-500  hover:text-white",
                onRemove && "bg-red-50 hover:bg-red-100"
              )}
              title={
                restrictedUsersList?.includes(customer.id)
                  ? "You can't allocate restricted user"
                  : "Click on button to allocate"
              }
            >
              Allocate
            </span>
          )}
          {restrictedUsersList?.includes(customer.id) ? (
            <span
              onClick={() => onRestrict(customer, true)}
              title='Click on button to cancel restriction'
              className="bg-red-500 hover:bg-red-600 text-[14px] p-2 text-white text-center rounded-xl cursor-pointer w-[120px]">
              Restricted
            </span>
          ) : (
            <span
              onClick={allocatedUsersList?.includes(customer.id) ? () => {} :() => onRestrict(customer, false)}
              className={clsx(
                "bg-white text-black text-center  w-[120px]  p-2 rounded-xl  text-[14px]",
                allocatedUsersList?.includes(customer.id) ? "opacity-50 !cursor-not-allowed": "hover:bg-red-500  cursor-pointer hover:text-white",
                onRemove && "bg-red-50 hover:bg-red-100"
              )}
              title={allocatedUsersList?.includes(customer.id)?'You can\'t restrict allocated user':'Click on button to restrict'}
            >
              Restrict
            </span>
          )}
          {onRemove && (
            <button
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-full ml-2 cursor-pointer w-[220px]"
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
