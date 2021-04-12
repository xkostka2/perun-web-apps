/**
 * Perun RPC API
 * Perun Remote Procedure Calls Application Programming Interface
 *
 * The version of the OpenAPI document: 3.22.0
 * Contact: perun@cesnet.cz
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { Candidate } from './candidate';
import { Group } from './group';


/**
 * input to create member for candidate
 */
export interface InputCreateMemberForCandidate { 
    vo: number;
    candidate: Candidate;
    groups?: Array<Group>;
}

