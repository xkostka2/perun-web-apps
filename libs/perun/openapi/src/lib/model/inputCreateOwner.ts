/**
 * Perun RPC API
 * Perun Remote Procedure Calls Application Programming Interface
 *
 * The version of the OpenAPI document: 3.28.0
 * Contact: perun@cesnet.cz
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


/**
 * input to createOwner, no id, numeric ownerType instead of string type
 */
export interface InputCreateOwner { 
    /**
     * name of contact, e.g. John Doe or NSA
     */
    name: string;
    /**
     * email address
     */
    contact: string;
    /**
     * 0 - technical, 1 - administrative
     */
    ownerType: InputCreateOwner.OwnerTypeEnum;
}
export namespace InputCreateOwner {
    export type OwnerTypeEnum = 0 | 1;
    export const OwnerTypeEnum = {
        NUMBER_0: 0 as OwnerTypeEnum,
        NUMBER_1: 1 as OwnerTypeEnum
    };
}


