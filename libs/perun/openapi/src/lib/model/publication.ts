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
import { PerunBean } from './perunBean';
import { Author } from './author';


export interface Publication extends PerunBean { 
    authors?: Array<Author>;
    externalId?: number;
    publicationSystemId?: number;
    title?: string;
    year?: number;
    main?: string;
    isbn?: string;
    doi?: string;
    categoryId?: number;
    rank?: number;
    locked?: boolean;
    createdBy?: string;
    createdByUid?: number;
    createdDate?: string;
}

