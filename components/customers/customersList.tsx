'use client';

import { useEffect } from "react";

export interface ICustomer {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
}

export type CustomersListProps = {
  customers: ICustomer[],
  onSelect?: (customer: ICustomer) => void;
  onRemove?: (customer: ICustomer) => void;
}


export function CustomersList({customers, onSelect, onRemove}: CustomersListProps) {

  useEffect(() => {
    console.log('Render Customers');
  },[]);


  return (
    <ul className="bg-white border max-h-40 overflow-y-auto">
    {customers
      .map((c :ICustomer) => (
        onSelect ?
        <li
          key={c.id}
          className="p-2 hover:bg-blue-100 cursor-pointer my-1">
          {c.first_name} {c.last_name} – {c.company}
          <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl p-2 m-2 cursor-pointer" onClick={() => onSelect(c)}>Select</button>
        </li>
        : (onRemove && c?.id) ?
        <li
        key={c.id}
        className="p-2 hover:bg-blue-100 cursor-pointer my-1">
        {c.first_name} {c.last_name} – {c.company}
        <button className="bg-red-500 hover:bg-red-600 text-white rounded-2xl p-1 m-1 cursor-pointer" onClick={() => onRemove(c)}>X</button>
      </li> : null
      ))}
  </ul>
  );
}
