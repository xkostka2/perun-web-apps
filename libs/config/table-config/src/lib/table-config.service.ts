import { Injectable } from '@angular/core';
import { GUIConfigService, LS_TABLE_PREFIX, PREF_PAGE_SIZE } from './guiconfig.service';

@Injectable({
  providedIn: 'root'
})
export class TableConfigService {

  constructor(
    private guiConfigService: GUIConfigService
  ) { }

  getTablePageSize(tableId: String): number {
    const tablePref = this.guiConfigService.getNumber(LS_TABLE_PREFIX + tableId);
    if (!isNaN(tablePref)) {
      return tablePref;
    }
    const pref = this.guiConfigService.getNumber(PREF_PAGE_SIZE);
    if (!isNaN(pref)) {
      return pref;
    }

    return 10;
  }

  setTablePageSize(tableId: String, value: number) {
    this.guiConfigService.setNumber(LS_TABLE_PREFIX + tableId, value);
  }
}

export const TABLE_FACILITY_RESOURCES_LIST = '0';
export const TABLE_VO_SELECT = '1';
export const TABLE_VO_RESOURCES_LIST = '2';
export const TABLE_USER_PROFILE_ADMIN_SELECT = '3';
export const TABLE_USER_PROFILE_MEMBER_SELECT = '4';
export const TABLE_GROUP_RESOURCES_LIST = '5';
export const TABLE_GROUP_SETTINGS_NOTIFICATIONS = '6';
export const TABLE_VO_SETTINGS_NOTIFICATIONS = '7';
export const TABLE_ADMIN_ATTRIBUTES = '8';
export const TABLE_ADMIN_USER_SELECT = '9';
export const TABLE_ADD_MANAGER = '10';
export const TABLE_FACILITY_SELECT = '11';
export const TABLE_GROUP_MEMBERS = '12';
export const TABLE_VO_MEMBERS = '13';
export const TABLE_ENTITYLESS_ATTRIBUTE_KEYS = '14';
export const TABLE_ADMIN_EXTSOURCES = '15';
export const TABLE_ADD_EXTSOURCE_DIALOG = '16';
export const TABLE_VO_EXTSOURCES_SETTINGS = '17';
export const TABLE_ADD_MEMBER_CANDIDATES_DIALOG = '18';
export const TABLE_GROUP_APPLICATIONS_DETAILED = '19';
export const TABLE_VO_RESOURCES_TAGS = '20';
export const TABLE_GROUP_APPLICATIONS_NORMAL = '21';
export const TABLE_VO_APPLICATIONS_NORMAL = '22';
export const TABLE_VO_APPLICATIONS_DETAILED = '23';
export const TABLE_MEMBER_DETAIL_GROUPS = '24';
// For now, there is a shared value for all tables with attributes. It might be useful for
// users to share this value across all attribute tables.
export const TABLE_ATTRIBUTES_SETTINGS = '25';
export const TABLE_FACILITY_ALLOWED_GROUPS = '26';
export const TABLE_RESOURCE_ALLOWED_GROUPS = '27';
export const TABLE_SELECT_GROUP_MANAGER_DIALOG = '28';
export const TABLE_ASSIGN_GROUP_TO_RESOURCE_DIALOG = '29';
export const TABLE_CREATE_RELATION_GROUP_DIALOG = '30';
export const TABLE_GROUP_MANAGERS_PAGE = '31';
export const TABLE_USER_DETAIL_MEMBER_GROUPS = '32';
export const TABLE_USER_DETAIL_ADMIN_GROUPS = '33';
export const TABLE_GROUP_SETTINGS_RELATIONS = '34';
export const TABLE_GROUP_SUBGROUPS = '35';
export const TABLE_VO_GROUPS = '36';
export const TABLE_FACILITY_SERVICES_DESTINATION_LIST = '37';
export const TABLE_USER_PROFILE_DASHBOARD_VO = '38';
export const TABLE_USER_PROFILE_DASHBOARD_GROUP = '39';
export const TABLE_USER_PROFILE_DASHBOARD_FACILITY = '40';
export const TABLE_USER_PROFILE_DASHBOARD_RESOURCE = '41';
export const TABLE_FACILITY_HOSTS_LIST = '42';
export const TABLE_FACILITY_BLACKLIST_LIST = '43';
export const TABLE_FACILITY_SECURITY_TEAMS_LIST = '44';
export const TABLE_MEMBER_APPLICATIONS_DETAILED = '45';
export const TABLE_MEMBER_APPLICATIONS_NORMAL = '46';
export const TABLE_ADMIN_SERVICES = '47';
export const TABLE_ADMIN_USER_RESOURCES_LIST = '48';
export const TABLE_MEMBER_RESOURCE_LIST = '49';
export const TABLE_ASSIGN_SERVICE_TO_RESOURCE_DIALOG = '50';
export const TABLE_RESOURCE_ASSIGNED_SERVICES = '51';
export const TABLE_REQUIRED_ATTRIBUTES = '52';
export const TABLE_FACILITY_SERVICES_STATUS_LIST = '53';
export const TABLE_USER_SERVICE_IDENTITIES = '54';
export const TABLE_USER_ASSOCIATED_USERS = '55';
export const TABLE_FACILITY_ALLOWED_USERS = '56';
export const TABLE_RESOURCE_MEMBERS = '57';
export const TABLE_TASK_RESULTS = '58';
export const TABLE_SPONSORED_MEMBERS = '59';
export const TABLE_USER_PROFILE_DASHBOARD_VO_SPONSORED = '60';
export const TABLE_USER_PROFILE_DASHBOARD_VO_TOP_GROUP_CREATOR = '61';
export const TABLE_FACILITY_OWNERS = '62';
export const TABLE_ADD_SPONSORED_MEMBERS = '63';
export const TABLE_USER_IDENTITIES = '64';
export const TABLE_RESOURCE_DELETE_SERVICE = '65';
