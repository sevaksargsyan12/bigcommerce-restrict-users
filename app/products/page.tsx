"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { CustomersList, ICustomer } from "@/components/customers/customersList";

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
  ALLOCATE = "allocating_users",
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
        }
        console.log({ initialSelected });

        setSelectedCustomers(initialSelected);
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
    if (!activeProductId) return matchesSearch;
    return (
      matchesSearch &&
      !selectedCustomers[activeProductId]?.some((c) => c.id === customer.id)
    );
  });

  const handleAddCustomField = async (productId: string) => {
    setLoadingProduct(productId);
    const selected = selectedCustomers[productId] || [];
    const customerIds = selected.map((c) => c.id).join(",");
    // alert(customerIds);
    // return;

    try {
      const res = await fetch("/api/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          name: condition,
          value: customerIds,
        }),
      });

      const result = await res.json();
      alert(
        result.success
          ? "Customers saved successfully"
          : "Failed to save customers"
      );
    } catch (error) {
      console.error("Error managing custom field:", error);
      alert("Error managing customers");
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
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                    onClick={() => handleAddCustomField(product.id)}
                  >
                    Save Customers
                  </button>
                </div>
                <div className="customers-wrapper flex gap-4">
                  <div className="mt-4 w-1/2">
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
                      customers={filteredCustomers}
                      onSelect={(customer) =>
                        handleCustomerSelect(customer, product.id)
                      }
                    />
                  </div>
                  <div className="mt-4 w-1/2">
                    <h4 className="font-medium text-red-700 text-2xl mb-4">
                      Restricted Customers:
                    </h4>
                    <CustomersList
                      customers={selectedCustomers[product.id] || []}
                      onRemove={(customer) =>
                        handleCustomerRemove(customer.id, product.id)
                      }
                    />
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
