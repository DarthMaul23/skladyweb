/* tslint:disable */
/* eslint-disable */
/**
 * My API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import type { Configuration } from './configuration';
import type { AxiosPromise, AxiosInstance, RawAxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from './common';
import type { RequestArgs } from './base';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, BaseAPI, RequiredError, operationServerMap } from './base';

/**
 * 
 * @export
 * @interface Item
 */
export interface Item {
    /**
     * 
     * @type {string}
     * @memberof Item
     */
    'id'?: string;
    /**
     * 
     * @type {string}
     * @memberof Item
     */
    'warehouseId'?: string;
    /**
     * 
     * @type {string}
     * @memberof Item
     */
    'name'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Item
     */
    'description'?: string | null;
    /**
     * 
     * @type {number}
     * @memberof Item
     */
    'quantity'?: number;
    /**
     * 
     * @type {Warehouse}
     * @memberof Item
     */
    'warehouse'?: Warehouse;
}
/**
 * 
 * @export
 * @interface LoginModel
 */
export interface LoginModel {
    /**
     * 
     * @type {string}
     * @memberof LoginModel
     */
    'email'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof LoginModel
     */
    'password'?: string | null;
}
/**
 * 
 * @export
 * @interface NewOfferObject
 */
export interface NewOfferObject {
    /**
     * 
     * @type {string}
     * @memberof NewOfferObject
     */
    'id'?: string;
}
/**
 * 
 * @export
 * @interface NewWarehouseModel
 */
export interface NewWarehouseModel {
    /**
     * 
     * @type {string}
     * @memberof NewWarehouseModel
     */
    'name'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof NewWarehouseModel
     */
    'location'?: string | null;
}
/**
 * 
 * @export
 * @interface Organization
 */
export interface Organization {
    /**
     * 
     * @type {string}
     * @memberof Organization
     */
    'id'?: string;
    /**
     * 
     * @type {string}
     * @memberof Organization
     */
    'name'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Organization
     */
    'location'?: string | null;
    /**
     * 
     * @type {Array<Warehouse>}
     * @memberof Organization
     */
    'warehouses'?: Array<Warehouse> | null;
}
/**
 * 
 * @export
 * @interface ResponseObject
 */
export interface ResponseObject {
    /**
     * 
     * @type {string}
     * @memberof ResponseObject
     */
    'responseStatus'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ResponseObject
     */
    'error'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ResponseObject
     */
    'exception'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ResponseObject
     */
    'stackTrace'?: string | null;
    /**
     * 
     * @type {any}
     * @memberof ResponseObject
     */
    'result'?: any | null;
}
/**
 * 
 * @export
 * @interface Warehouse
 */
export interface Warehouse {
    /**
     * 
     * @type {string}
     * @memberof Warehouse
     */
    'id'?: string;
    /**
     * 
     * @type {string}
     * @memberof Warehouse
     */
    'organizationId'?: string;
    /**
     * 
     * @type {string}
     * @memberof Warehouse
     */
    'name'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Warehouse
     */
    'location'?: string | null;
    /**
     * 
     * @type {Organization}
     * @memberof Warehouse
     */
    'organization'?: Organization;
}
/**
 * 
 * @export
 * @interface WarehouseModel
 */
export interface WarehouseModel {
    /**
     * 
     * @type {string}
     * @memberof WarehouseModel
     */
    'id'?: string;
    /**
     * 
     * @type {string}
     * @memberof WarehouseModel
     */
    'name'?: string | null;
    /**
     * 
     * @type {string}
     * @memberof WarehouseModel
     */
    'location'?: string | null;
}

/**
 * ItemApi - axios parameter creator
 * @export
 */
export const ItemApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @param {string} [warehouseId] 
         * @param {Item} [item] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        itemAddOrUpdateItemPost: async (warehouseId?: string, item?: Item, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/Item/AddOrUpdateItem`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Bearer required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)

            if (warehouseId !== undefined) {
                localVarQueryParameter['warehouseId'] = warehouseId;
            }


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(item, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @param {string} [warehouseId] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        itemGetWarehouseItemsPost: async (warehouseId?: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/Item/GetWarehouseItems`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Bearer required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)

            if (warehouseId !== undefined) {
                localVarQueryParameter['warehouseId'] = warehouseId;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * ItemApi - functional programming interface
 * @export
 */
export const ItemApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = ItemApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @param {string} [warehouseId] 
         * @param {Item} [item] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async itemAddOrUpdateItemPost(warehouseId?: string, item?: Item, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ResponseObject>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.itemAddOrUpdateItemPost(warehouseId, item, options);
            const index = configuration?.serverIndex ?? 0;
            const operationBasePath = operationServerMap['ItemApi.itemAddOrUpdateItemPost']?.[index]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, operationBasePath || basePath);
        },
        /**
         * 
         * @param {string} [warehouseId] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async itemGetWarehouseItemsPost(warehouseId?: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ResponseObject>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.itemGetWarehouseItemsPost(warehouseId, options);
            const index = configuration?.serverIndex ?? 0;
            const operationBasePath = operationServerMap['ItemApi.itemGetWarehouseItemsPost']?.[index]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, operationBasePath || basePath);
        },
    }
};

/**
 * ItemApi - factory interface
 * @export
 */
export const ItemApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = ItemApiFp(configuration)
    return {
        /**
         * 
         * @param {string} [warehouseId] 
         * @param {Item} [item] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        itemAddOrUpdateItemPost(warehouseId?: string, item?: Item, options?: any): AxiosPromise<ResponseObject> {
            return localVarFp.itemAddOrUpdateItemPost(warehouseId, item, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @param {string} [warehouseId] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        itemGetWarehouseItemsPost(warehouseId?: string, options?: any): AxiosPromise<ResponseObject> {
            return localVarFp.itemGetWarehouseItemsPost(warehouseId, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * ItemApi - object-oriented interface
 * @export
 * @class ItemApi
 * @extends {BaseAPI}
 */
export class ItemApi extends BaseAPI {
    /**
     * 
     * @param {string} [warehouseId] 
     * @param {Item} [item] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ItemApi
     */
    public itemAddOrUpdateItemPost(warehouseId?: string, item?: Item, options?: RawAxiosRequestConfig) {
        return ItemApiFp(this.configuration).itemAddOrUpdateItemPost(warehouseId, item, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @param {string} [warehouseId] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ItemApi
     */
    public itemGetWarehouseItemsPost(warehouseId?: string, options?: RawAxiosRequestConfig) {
        return ItemApiFp(this.configuration).itemGetWarehouseItemsPost(warehouseId, options).then((request) => request(this.axios, this.basePath));
    }
}



/**
 * LoginApi - axios parameter creator
 * @export
 */
export const LoginApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @param {LoginModel} [loginModel] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        loginPost: async (loginModel?: LoginModel, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/Login`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Bearer required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(loginModel, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * LoginApi - functional programming interface
 * @export
 */
export const LoginApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = LoginApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @param {LoginModel} [loginModel] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async loginPost(loginModel?: LoginModel, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.loginPost(loginModel, options);
            const index = configuration?.serverIndex ?? 0;
            const operationBasePath = operationServerMap['LoginApi.loginPost']?.[index]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, operationBasePath || basePath);
        },
    }
};

/**
 * LoginApi - factory interface
 * @export
 */
export const LoginApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = LoginApiFp(configuration)
    return {
        /**
         * 
         * @param {LoginModel} [loginModel] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        loginPost(loginModel?: LoginModel, options?: any): AxiosPromise<void> {
            return localVarFp.loginPost(loginModel, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * LoginApi - object-oriented interface
 * @export
 * @class LoginApi
 * @extends {BaseAPI}
 */
export class LoginApi extends BaseAPI {
    /**
     * 
     * @param {LoginModel} [loginModel] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof LoginApi
     */
    public loginPost(loginModel?: LoginModel, options?: RawAxiosRequestConfig) {
        return LoginApiFp(this.configuration).loginPost(loginModel, options).then((request) => request(this.axios, this.basePath));
    }
}



/**
 * OfferApi - axios parameter creator
 * @export
 */
export const OfferApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @param {NewOfferObject} [newOfferObject] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        offerCreateOfferPost: async (newOfferObject?: NewOfferObject, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/Offer/CreateOffer`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Bearer required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(newOfferObject, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        offerGetOffersGet: async (options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/Offer/GetOffers`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Bearer required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * OfferApi - functional programming interface
 * @export
 */
export const OfferApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = OfferApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @param {NewOfferObject} [newOfferObject] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async offerCreateOfferPost(newOfferObject?: NewOfferObject, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ResponseObject>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.offerCreateOfferPost(newOfferObject, options);
            const index = configuration?.serverIndex ?? 0;
            const operationBasePath = operationServerMap['OfferApi.offerCreateOfferPost']?.[index]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, operationBasePath || basePath);
        },
        /**
         * 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async offerGetOffersGet(options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ResponseObject>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.offerGetOffersGet(options);
            const index = configuration?.serverIndex ?? 0;
            const operationBasePath = operationServerMap['OfferApi.offerGetOffersGet']?.[index]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, operationBasePath || basePath);
        },
    }
};

/**
 * OfferApi - factory interface
 * @export
 */
export const OfferApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = OfferApiFp(configuration)
    return {
        /**
         * 
         * @param {NewOfferObject} [newOfferObject] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        offerCreateOfferPost(newOfferObject?: NewOfferObject, options?: any): AxiosPromise<ResponseObject> {
            return localVarFp.offerCreateOfferPost(newOfferObject, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        offerGetOffersGet(options?: any): AxiosPromise<ResponseObject> {
            return localVarFp.offerGetOffersGet(options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * OfferApi - object-oriented interface
 * @export
 * @class OfferApi
 * @extends {BaseAPI}
 */
export class OfferApi extends BaseAPI {
    /**
     * 
     * @param {NewOfferObject} [newOfferObject] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OfferApi
     */
    public offerCreateOfferPost(newOfferObject?: NewOfferObject, options?: RawAxiosRequestConfig) {
        return OfferApiFp(this.configuration).offerCreateOfferPost(newOfferObject, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OfferApi
     */
    public offerGetOffersGet(options?: RawAxiosRequestConfig) {
        return OfferApiFp(this.configuration).offerGetOffersGet(options).then((request) => request(this.axios, this.basePath));
    }
}



/**
 * UserApi - axios parameter creator
 * @export
 */
export const UserApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @param {string} id 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        userIdGet: async (id: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            assertParamExists('userIdGet', 'id', id)
            const localVarPath = `/User/{id}`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Bearer required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * UserApi - functional programming interface
 * @export
 */
export const UserApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = UserApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @param {string} id 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async userIdGet(id: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.userIdGet(id, options);
            const index = configuration?.serverIndex ?? 0;
            const operationBasePath = operationServerMap['UserApi.userIdGet']?.[index]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, operationBasePath || basePath);
        },
    }
};

/**
 * UserApi - factory interface
 * @export
 */
export const UserApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = UserApiFp(configuration)
    return {
        /**
         * 
         * @param {string} id 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        userIdGet(id: string, options?: any): AxiosPromise<void> {
            return localVarFp.userIdGet(id, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * UserApi - object-oriented interface
 * @export
 * @class UserApi
 * @extends {BaseAPI}
 */
export class UserApi extends BaseAPI {
    /**
     * 
     * @param {string} id 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserApi
     */
    public userIdGet(id: string, options?: RawAxiosRequestConfig) {
        return UserApiFp(this.configuration).userIdGet(id, options).then((request) => request(this.axios, this.basePath));
    }
}



/**
 * WarehouseApi - axios parameter creator
 * @export
 */
export const WarehouseApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @param {NewWarehouseModel} [newWarehouseModel] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        warehouseCreateWarehousePost: async (newWarehouseModel?: NewWarehouseModel, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/Warehouse/CreateWarehouse`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Bearer required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(newWarehouseModel, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        warehouseGetWarehousesGet: async (options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/Warehouse/GetWarehouses`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Bearer required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @param {WarehouseModel} [warehouseModel] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        warehouseUpdateWarehousePost: async (warehouseModel?: WarehouseModel, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/Warehouse/UpdateWarehouse`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication Bearer required
            await setApiKeyToObject(localVarHeaderParameter, "Authorization", configuration)


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(warehouseModel, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * WarehouseApi - functional programming interface
 * @export
 */
export const WarehouseApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = WarehouseApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @param {NewWarehouseModel} [newWarehouseModel] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async warehouseCreateWarehousePost(newWarehouseModel?: NewWarehouseModel, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ResponseObject>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.warehouseCreateWarehousePost(newWarehouseModel, options);
            const index = configuration?.serverIndex ?? 0;
            const operationBasePath = operationServerMap['WarehouseApi.warehouseCreateWarehousePost']?.[index]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, operationBasePath || basePath);
        },
        /**
         * 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async warehouseGetWarehousesGet(options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ResponseObject>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.warehouseGetWarehousesGet(options);
            const index = configuration?.serverIndex ?? 0;
            const operationBasePath = operationServerMap['WarehouseApi.warehouseGetWarehousesGet']?.[index]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, operationBasePath || basePath);
        },
        /**
         * 
         * @param {WarehouseModel} [warehouseModel] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async warehouseUpdateWarehousePost(warehouseModel?: WarehouseModel, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ResponseObject>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.warehouseUpdateWarehousePost(warehouseModel, options);
            const index = configuration?.serverIndex ?? 0;
            const operationBasePath = operationServerMap['WarehouseApi.warehouseUpdateWarehousePost']?.[index]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, operationBasePath || basePath);
        },
    }
};

/**
 * WarehouseApi - factory interface
 * @export
 */
export const WarehouseApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = WarehouseApiFp(configuration)
    return {
        /**
         * 
         * @param {NewWarehouseModel} [newWarehouseModel] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        warehouseCreateWarehousePost(newWarehouseModel?: NewWarehouseModel, options?: any): AxiosPromise<ResponseObject> {
            return localVarFp.warehouseCreateWarehousePost(newWarehouseModel, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        warehouseGetWarehousesGet(options?: any): AxiosPromise<ResponseObject> {
            return localVarFp.warehouseGetWarehousesGet(options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @param {WarehouseModel} [warehouseModel] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        warehouseUpdateWarehousePost(warehouseModel?: WarehouseModel, options?: any): AxiosPromise<ResponseObject> {
            return localVarFp.warehouseUpdateWarehousePost(warehouseModel, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * WarehouseApi - object-oriented interface
 * @export
 * @class WarehouseApi
 * @extends {BaseAPI}
 */
export class WarehouseApi extends BaseAPI {
    /**
     * 
     * @param {NewWarehouseModel} [newWarehouseModel] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof WarehouseApi
     */
    public warehouseCreateWarehousePost(newWarehouseModel?: NewWarehouseModel, options?: RawAxiosRequestConfig) {
        return WarehouseApiFp(this.configuration).warehouseCreateWarehousePost(newWarehouseModel, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof WarehouseApi
     */
    public warehouseGetWarehousesGet(options?: RawAxiosRequestConfig) {
        return WarehouseApiFp(this.configuration).warehouseGetWarehousesGet(options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @param {WarehouseModel} [warehouseModel] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof WarehouseApi
     */
    public warehouseUpdateWarehousePost(warehouseModel?: WarehouseModel, options?: RawAxiosRequestConfig) {
        return WarehouseApiFp(this.configuration).warehouseUpdateWarehousePost(warehouseModel, options).then((request) => request(this.axios, this.basePath));
    }
}



