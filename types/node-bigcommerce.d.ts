declare module 'node-bigcommerce' {
  interface BigCommerceConfig {
    clientId: string;
    accessToken: string;
    storeHash: string;
    responseType?: string;
    apiVersion?: string;
  }

  export default class BigCommerce {
    constructor(config: BigCommerceConfig);
    get(endpoint: string, params?: object): Promise<any>;
    post(endpoint: string, data?: object): Promise<any>;
    put(endpoint: string, data?: object): Promise<any>;
    delete(endpoint: string): Promise<any>;
  }
}
