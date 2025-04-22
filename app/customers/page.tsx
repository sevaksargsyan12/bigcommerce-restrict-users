"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import toast from 'react-hot-toast';

import { CustomersList, ICustomer } from "@/components/customers/customersList1";

interface IProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  custom_fields: Array<{ id?: number; name: string; value: string }>;
}

interface ICustomField {
  id?: number;
  name: string;
  value: string;
}

enum UserCondition {
  ALLOCATE = "allocated_users",
  RESTRICT = "restrict_users",
}

export default function ProductListPage() {
  const [condition, setCondition] = useState<UserCondition>(
    UserCondition.RESTRICT
  );
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<
    Record<string, ICustomer[]>
  >({});
  const [allocatedCustomers, setAllocatedCustomers] = useState<
  Record<string, ICustomer[]>
>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchProductTerm, setsearchProductTerm] = useState("");
  const [page, setPage] = useState("");
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  useEffect(() => {
    setSearchTerm("");
  }, [activeProductId]);

  useEffect(() => {
    const fetchProducts = async (customers: ICustomer[]) => {
      try {
        const limit = 5;
        const keyword = "";
        // const res = await fetch('/api/products?limit=2');
        const res = await fetch(
          `/api/products?keyword=${encodeURIComponent(keyword)}&limit=${limit}`
        );

        const data = await res.json();
        setProducts(data);
        if (data?.length) setActiveProductId(data[0].id);

        // Initialize selected customers from custom fields
        const initialSelected: Record<string, ICustomer[]> = {};
        const initialSelectedAllocated: Record<string, ICustomer[]> = {};
        for (const product of data) {
          const restrictUsersField = product.custom_fields.find(
            (field: ICustomField) => field.name === condition
          );

          const allocatedUsersField = product.custom_fields.find(
            (field: ICustomField) => field.name === UserCondition.ALLOCATE
          );

          console.log({lolo:product.custom_fields});

          if (restrictUsersField && restrictUsersField.value) {
            const customerIds = restrictUsersField.value.split(",");
            initialSelected[product.id] = customers.filter((c) =>
              customerIds.includes(c.id.toString())
            );
          }

          if (allocatedUsersField && allocatedUsersField.value) {
            const customerIds = allocatedUsersField.value.split(",");
            initialSelectedAllocated[product.id] = customers.filter((c) =>
              customerIds.includes(c.id.toString())
            );
          }
        }
        console.log({ initialSelected });
        console.log({ initialSelectedAllocated });


        setSelectedCustomers(initialSelected);
        setAllocatedCustomers(initialSelectedAllocated);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        setCustomers(data);
        return data;
      } catch (error) {
        console.error("Error fetching customers:", error);
        return [];
      }
    };

    const initializeData = async () => {
      const customers: ICustomer[] = await fetchCustomers();
      await fetchProducts(customers);
      setLoading(false);
    };

    initializeData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const limit = 5;
        let query = "";
        if (page) {
          query = page;
        } else {
          if (searchProductTerm) {
            query = `?keyword=${encodeURIComponent(
              searchProductTerm
            )}&limit=${limit}`;
          }
        }
        // const res = await fetch('/api/products?limit=2');
        const res = await fetch(`/api/products${query}`);

        const data = await res.json();
        setProducts(data);
        if (data?.length) setActiveProductId(data[0].id);

        // Initialize selected customers from custom fields
        const initialSelected: Record<string, ICustomer[]> = {};
        const initialSelectedAllocated: Record<string, ICustomer[]> = {};

        for (const product of data) {
          const restrictUsersField = product.custom_fields.find(
            (field: ICustomField) => field.name === condition
          );

          
          if (restrictUsersField && restrictUsersField.value) {
            const customerIds = restrictUsersField.value.split(",");
            initialSelected[product.id] = customers.filter((c) =>
              customerIds.includes(c.id.toString())
            );
          }

          const allocatedUsersField = product.custom_fields.find(
            (field: ICustomField) => field.name === UserCondition.ALLOCATE
          );

          if (allocatedUsersField && allocatedUsersField.value) {
            const customerIds = allocatedUsersField.value.split(",");
            initialSelectedAllocated[product.id] = customers.filter((c) =>
              customerIds.includes(c.id.toString())
            );
          }
        }
        console.log({ initialSelected });

        setSelectedCustomers(initialSelected);
        setAllocatedCustomers(initialSelectedAllocated);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [searchProductTerm, page]);

  const filteredCustomers = customers.filter((customer) => {
    const searchString =
      `${customer.first_name} ${customer.last_name} ${customer.company}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    // if (!activeProductId) return matchesSearch;
    return (
      matchesSearch 
      // && !selectedCustomers[activeProductId]?.some((c) => c.id === customer.id)
    );
  });

  const handleCustomFieldAction = async (product: IProduct, customFieldName: UserCondition, customerId: string, remove = false, customFieldId: string = '') => {
    const productId = product.id;
    setLoadingProduct(productId);
    const selected = customFieldName === UserCondition.ALLOCATE ? (allocatedCustomers[productId] || []) : (selectedCustomers[productId] || []);
    // let customerIds = selected.map((c) => c.id).join(",");
    let customerIds:any[] = [];
    // alert(customerIds);
    // return;
    // console.log('%cThis is a custom colored message!', 'color: green');
    // console.log({customerIds});
    // console.log({remove, productId,customerIds});
    // // return;


    if(customerId) {
       customerIds = remove ? selected.filter((c) => c.id !== customerId).map((c)=>c.id) : [customerId,selected.map((c) => c.id)];
    }

    console.log('%cThis is a custom colored message!', 'color: green');
    console.log({customerIds});
    console.log({remove, productId,customerIds});
    // return;

    try {
      if(customerIds.length) {
        const res = await fetch("/api/custom-fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            name: customFieldName,
            value: customerIds.join(','),
          }),
        });
  
        const result = await res.json();
        setLoadingProduct("");
  
        // alert(
        //   result.success
        //     ? "Customers saved successfully"
        //     : "Failed to save customers"
        // );
        toast.success(result.success
          ? "Customers saved successfully"
          : "Failed to save customers", {
          position: 'top-center',
          duration: 3000,
        });

        setProducts(products.map((prod) => {
          if(prod.id === productId) {
            return {...prod, custom_fields: prod.custom_fields.map((cf) => {
                if(cf.name === customFieldName) {
                  return result.data
                }

                return cf;
            })}
          }
          return prod
        }))


        return result.data;


      } else {
        const res = await fetch("/api/custom-fields", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            customFieldId
          }),
        });
  
        const result = await res.json();
        console.error({result});
        setLoadingProduct("");
  
        toast.success(result.success
          ? "Changes were saved successfully"
          : "Failed to do the changes", {
          position: 'top-center',
          duration: 3000,
        });

        // location.reload();
        return [];
      }
      
    } catch (error) {
      toast.error('Error managing customers', {
        style: {
          background: '#ffe6e6',
          color: '#d32f2f',
          border: '1px solid #d32f2f',
        },
        duration: 4000, // 4 seconds
      });
      console.error("Error managing custom field:", error);
    } finally {
      setLoadingProduct("");
    }
  };

  const handleCustomerSelect = (customer: ICustomer, productId: string) => {
    setSelectedCustomers((prev) => ({
      ...prev,
      [productId]: [customer, ...(prev[productId] || [])],
    }));
  };

  const handleCustomerAllocation = async (customer: ICustomer, unAllocate: boolean, product: IProduct) => {
    let customFieldId = product.custom_fields.filter((c) => c.name === UserCondition.ALLOCATE)[0]?.id;
    alert(customFieldId);
    const result = await handleCustomFieldAction(product, UserCondition.ALLOCATE, customer.id, unAllocate, customFieldId?.toString() || '');
    if(result) {
      const productId = product.id;
      setAllocatedCustomers((prev) => ({
        ...prev,
        [productId]: unAllocate ? [...prev[productId]].filter((c) => c.id !== customer.id) : [customer, ...(prev[productId] || [])],
      }));
    }
  };

  const handleCustomerRestriction = async (customer: ICustomer, unRestrict: boolean, product: IProduct) => {
    let customFieldId = product.custom_fields.filter((c) => c.name === UserCondition.RESTRICT)[0]?.id;
    const result = await handleCustomFieldAction(product, UserCondition.RESTRICT, customer.id, unRestrict, customFieldId?.toString() || '');
    if(result) {
      const productId = product.id;
      setSelectedCustomers((prev) => ({
        ...prev,
        [productId]: unRestrict ? [...prev[productId]].filter((c) => c.id !== customer.id) : [customer, ...(prev[productId] || [])],
      }));
    }
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
      <div className="flex gap-4 my-1">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">Product List</h1>
        <input
          type="text"
          placeholder="Search products..."
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={searchProductTerm}
          onChange={(e) => setsearchProductTerm(e.target.value)}
        />
      </div>
      <div className="grid gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className={clsx(
              "p-6 rounded-xl border-2 border-blue-300 hover:border-blue-600 relative",
              activeProductId === product.id
                ? "bg-green-50"
                : "bg-gray-50 opacity-90",
              loadingProduct === product.id ? "opacity-60" : "",
              "transition-all duration-200"
            )}
          >
            <button
              className="absolute top-3 right-3 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-full hidden"
              onClick={() => setActiveProductId(product.id)}
            >
              {activeProductId === product.id ? "Active" : "Select"}
            </button>
            {loadingProduct === product.id ? (
              <div className="text-[24px]">Wait...</div>
            ) : null}
            <h3
              onClick={() => setActiveProductId(product.id)}
              className="text-2xl font-semibold text-blue-800 mb-2 cursor-pointer"
            >
              {product.name}{" "}
              {product?.sku && (
                <>
                  –{" "}
                  <span className="bg-white rounded-xl p-2 border-2 text-[16px] text-black">
                    {product?.sku}
                  </span>
                </>
              )}
            </h3>
            {activeProductId === product.id && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  {/* <button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                    onClick={() => handleCustomFieldAction(product)}
                  >
                    Save Customers
                  </button> */}
                </div>
                <div className="customers-wrapper flex gap-4">
                  <div className="mt-4 w-full">
                    <div className="flex gap-2 mb-2">
                      <h4 className="font-medium text-gray-600 mb-2 text-2xl">
                        All Customers:
                      </h4>
                      <input
                        type="text"
                        placeholder="Search customers..."
                        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <CustomersList
                      allocatedUsersList={allocatedCustomers[product.id]?.map(c => c.id)}
                      restrictedUsersList={selectedCustomers[product.id]?.map(c => c.id)}
                      onAllocate={(customer, unAllocate) => handleCustomerAllocation(customer,unAllocate, product)}
                      onRestrict={(customer, unRestrict) => handleCustomerRestriction(customer,unRestrict, product)}
                      customers={filteredCustomers}
                      onSelect={(customer) =>
                        handleCustomerSelect(customer, product.id)
                      }
                      // onRestrict={(customer) =>
                      //   handleCustomerSelect(customer, product.id)
                      // }                
                          />
                  </div>
                  <div className="mt-4 w-1/2">
                    <h4 className="font-medium text-red-700 text-2xl mb-4">
                      Restricted Customers:
                    </h4>
                    {/* <CustomersList
                      restrictedUsersList={selectedCustomers[product.id]?.map(c => c.id)}
                      onAllocate={(customer) => handleCustomerAllocation(customer, product.id)}
                      customers={selectedCustomers[product.id] || []}
                      onRemove={(customer) =>
                        handleCustomerRemove(customer.id, product.id)
                      }
                      onRestrict={(customer) =>
                        handleCustomerSelect(customer, product.id)
                      }  
                    /> */}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
