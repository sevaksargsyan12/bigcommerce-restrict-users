import BigCommerce from 'node-bigcommerce';

const bigcommerce = new BigCommerce({
  clientId: process.env.DEV_BIGCOMMERCE_CLIENT_ID! || "",
  accessToken: process.env.DEV_BIGCOMMERCE_ACCESS_TOKEN!,
  storeHash: process.env.DEV_BIGCOMMERCE_STORE_HASH!,
  responseType: 'json',
  apiVersion: 'v3',
});

export async function getAllProducts(keyword: string = '', limit: number = 5) {
  try {
    const query = new URLSearchParams();
    query.set('limit', limit.toString());
    if (keyword) query.set('keyword', keyword);
    // query.set('sort', 'date_created'); // Sort by creation date
    // query.set('direction', 'desc');    // Descending order
    query.set('sort', 'date_modified'); // Use date_modified instead
    query.set('direction', 'desc');

    const response = await bigcommerce.get(`/catalog/products?${query.toString()}`);
    const products = response.data;

    // Fetch custom fields for each product
    const productsWithCustomFields = await Promise.all(
      products.map(async (product: any) => {
        try {
          const customFields = await bigcommerce.get(`/catalog/products/${product.id}/custom-fields`);
          return { ...product, custom_fields: customFields.data || [] };
        } catch (e) {
          console.error(`Failed to fetch custom fields for product ${product.id}`, e);
          return { ...product, custom_fields: [] };
        }
      })
    );

    return productsWithCustomFields;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function getAllCustomers() {
  try {
    const response = await bigcommerce.get('/customers');
    const customers = response.data;
    return customers;
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return [];
  }
}

export async function getProductCustomFields(productId: number, filterName: string = '') {
  try {
    const response = await bigcommerce.get(`/catalog/products/${productId}/custom-fields`);
    if(filterName && response.data) {
      return response.data.filter((c: any) => c.name === filterName);
    } 
    return response.data || [];
  } catch (error) {
    console.error(`Failed to fetch custom fields for product ${productId}:`, error);
    return [];
  }
}

export async function createCustomField(productId: number, customField: { name: string; value: string }) {
  try {
    const result = await bigcommerce.post(`/catalog/products/${productId}/custom-fields`, {
      name: customField.name,
      value: customField.value,
    });
    return result.data;
  } catch (error) {
    console.error('Failed to create custom field:', error);
    return null;
  }
}

export async function updateCustomField(productId: number, customFieldId: number, customField: { name: string; value: string }) {
  try {
    const result = await bigcommerce.put(`/catalog/products/${productId}/custom-fields/${customFieldId}`, {
      name: customField.name,
      value: customField.value,
    });
    return result.data;
  } catch (error) {
    console.error('Failed to update custom field:', error);
    return null;
  }
}

export async function removeCustomField(productId: number, customFieldId: number) {
  try {
    const result = await bigcommerce.delete(`/catalog/products/${productId}/custom-fields/${customFieldId}`);
    return true;
  } catch (error) {
    console.error('Failed to delete custom field:', error);
    return null;
  }
}