import BigCommerce from 'node-bigcommerce';

const bigcommerce = new BigCommerce({
  clientId: process.env.DEV_BIGCOMMERCE_CLIENT_ID!,
  accessToken: process.env.DEV_BIGCOMMERCE_ACCESS_TOKEN!,
  storeHash: process.env.DEV_BIGCOMMERCE_STORE_HASH!,
  responseType: 'json',
  apiVersion: 'v3',
});

export async function getAllProducts() {
  try {
    const response = await bigcommerce.get('/catalog/products');
    const products = response.data;

    // Fetch metafields for each product
    const productsWithMetafields = await Promise.all(
      products.map(async (product: any) => {
        try {
          const meta = await bigcommerce.get(`/catalog/products/${product.id}/metafields`);
          return { ...product, metafields: meta.data || [] };
        } catch (e) {
          console.error(`Failed to fetch metafields for product ${product.id}`, e);
          return { ...product, metafields: [] };
        }
      })
    );

    return productsWithMetafields;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function createMetafield(productId: number, metafield: { key: string; value: string; namespace?: string }) {
  try {
    const result = await bigcommerce.post(`/catalog/products/${productId}/metafields`, [
      {
        key: metafield.key,
        value: metafield.value,
        namespace: metafield.namespace || 'custom',
        permission_set: 'read_and_sf_access',
        description: 'Added from app',
      },
    ]);
    return result.data;
  } catch (error) {
    console.error('Failed to create metafield:', error);
    return null;
  }
}


export async function getAllCustomers() {
  try {
    const response = await bigcommerce.get('/customers');
    const customers = response.data;

    // Fetch metafields for each product

    console.log({customers});
    return customers;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}
