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
import { Destination } from './destination';
import { Service } from './service';
import { Facility } from './facility';
import { TaskStatus } from './taskStatus';


export interface Task { 
    id?: number;
    delay?: number;
    recurrence?: number;
    startTime?: string;
    sentToEngine?: string;
    sendStartTime?: string;
    schedule?: string;
    genStartTime?: string;
    genEndTime?: string;
    sendEndTime?: string;
    endTime?: string;
    service?: Service;
    facility?: Facility;
    destinations?: Array<Destination>;
    status?: TaskStatus;
    sourceUpdated?: boolean;
    propagationForced?: boolean;
}

