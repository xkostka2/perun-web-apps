/**
 * Perun RPC API
 * Perun Remote Procedure Calls Application Programming Interface
 *
 * The version of the OpenAPI document: 3.12.0
 * Contact: perun@cesnet.cz
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { Auditable } from './auditable';


export interface AttributeDefinition extends Auditable { 
    friendlyName?: string;
    namespace?: string;
    description?: string;
    type?: string;
    displayName?: string;
    writable?: boolean;
    unique?: boolean;
    readonly friendlyNameParameter?: string;
    readonly baseFriendlyName?: string;
    readonly entity?: string;
}

