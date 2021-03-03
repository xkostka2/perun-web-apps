import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EntityMenuLink, SideMenuItem } from './side-menu.component';
import { ApiRequestConfigurationService, GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import {
  AttributesManagerService,
  Facility,
  Group,
  Resource,
  RichMember,
  Service,
  User,
  Vo
} from '@perun-web-apps/perun/openapi';
import { parseFullName } from '@perun-web-apps/perun/utils';
import { StoreService } from '@perun-web-apps/perun/services';
import { GetResourceRoutePipe } from '@perun-web-apps/perun/pipes';
import { Urns } from '@perun-web-apps/perun/urns';

@Injectable({
  providedIn: 'root'
})
export class SideMenuItemService {

  constructor(
    private translate: TranslateService,
    private authResolver: GuiAuthResolver,
    private store: StoreService,
    private apiRequest: ApiRequestConfigurationService,
    private attributesManager: AttributesManagerService,
    private notificator: NotificatorService,
    public guiAuthResolver: GuiAuthResolver
  ) {
  }

  baseItemColor = this.store.get('theme', 'sidemenu_bg_color');
  voBgColor = this.store.get('theme', 'sidemenu_vo_bg_color');
  memberBgColor = this.store.get('theme', 'sidemenu_member_bg_color');
  groupBgColor = this.store.get('theme', 'sidemenu_group_bg_color');
  facilityBgColor = this.store.get('theme', 'sidemenu_facility_bg_color');
  resourceBgColor = this.store.get('theme', 'sidemenu_resource_bg_color');
  userBgColor = this.store.get('theme', 'sidemenu_user_bg_color');
  serviceBgColor = this.store.get('theme', 'sidemenu_service_bg_color');

  baseItemTextColor = this.store.get('theme', 'sidemenu_text_color');
  voTextColor = this.store.get('theme', 'sidemenu_vo_text_color');
  memberTextColor = this.store.get('theme', 'sidemenu_member_text_color');
  groupTextColor = this.store.get('theme', 'sidemenu_group_text_color');
  facilityTextColor = this.store.get('theme', 'sidemenu_facility_text_color');
  resourceTextColor = this.store.get('theme', 'sidemenu_resource_text_color');
  userTextColor = this.store.get('theme', 'sidemenu_user_text_color');
  serviceTextColor = this.store.get('theme', 'sidemenu_service_text_color');

  getFacilitiesManagementItem(): SideMenuItem {
    return {
      label: 'MAIN_MENU.FACILITIES',
      colorClass: 'base-item-color-activated',
      icon: 'perun-facility-white',
      baseLink: ['/facilities'],
      links: [],
      baseColorClass: 'base-item-color',
      baseColorClassRegex: '^/facilities$',
      backgroundColorCss: this.baseItemColor,
      textColorCss: this.baseItemTextColor
    };
  }

  getAccessManagementItem(): SideMenuItem {
    return {
      label: 'MAIN_MENU.ACCESS',
      colorClass: 'base-item-color-activated',
      icon: 'perun-vo',
      links: [],
      baseLink: ['/organizations'],
      baseColorClass: 'base-item-color',
      baseColorClassRegex: '^/organizations$',
      backgroundColorCss: this.baseItemColor,
      textColorCss: this.baseItemTextColor
    };
  }

  getHomeItem(): SideMenuItem {
    return {
      baseLink: ['/home'],
      label: 'MAIN_MENU.HOME',
      colorClass: 'base-item-color-activated',
      icon: 'perun-home-white',
      baseColorClass: 'base-item-color',
      baseColorClassRegex: '^dont-use$',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
      backgroundColorCss: this.baseItemColor,
      textColorCss: this.baseItemTextColor,
      links: []
    };
  }

  getUserItem(): SideMenuItem {
    return {
      baseLink: ['/myProfile'],
      expandable: false,
      label: 'MAIN_MENU.MY_PROFILE',
      colorClass: 'base-item-color-activated',
      icon: 'perun-user',
      baseColorClass: 'base-item-color',
      baseColorClassRegex: '^/dont-use$',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
      backgroundColorCss: this.baseItemColor,
      textColorCss: this.baseItemTextColor,
      links: [
        {
          label: 'MENU_ITEMS.USER.OVERVIEW',
          url: [`/myProfile`],
          activatedRegex: `^/myProfile$`
        },
        {
          label: 'MENU_ITEMS.USER.ORGANIZATIONS',
          url: [`/myProfile/organizations`],
          activatedRegex: `^/myProfile/organizations$`
        },
        {
          label: 'MENU_ITEMS.USER.GROUPS',
          url: [`/myProfile/groups`],
          activatedRegex: `^/myProfile/groups$`
        },
        {
          label: 'MENU_ITEMS.USER.ATTRIBUTES',
          url: [`/myProfile/attributes`],
          activatedRegex: `^/myProfile/attributes$`
        },
        {
          label: 'MENU_ITEMS.USER.ROLES',
          url: [`myProfile/roles`],
          activatedRegex: `myProfile/roles`
        },
        {
          label: 'MENU_ITEMS.USER.SETTINGS',
          url: [`/myProfile/settings`],
          activatedRegex: `^/myProfile/settings$`,
          children: [
            {
              label: 'MENU_ITEMS.USER.PASSWORD_RESET',
              url: [`/myProfile/settings/passwordReset`],
              activatedRegex: `^/myProfile/settings/passwordReset`
            },
            {
              label: 'MENU_ITEMS.USER.GUI_CONFIG',
              url: ['/myProfile/settings/guiConfig'],
              activatedRegex: '/myProfile/settings/guiConfig'
            }
          ],
          showChildrenRegex: `/myProfile/settings`
        }
      ]
    };
  }

  getAdminItem(): SideMenuItem {
    return {
      baseLink: ['/admin'],
      expandable: false,
      label: 'MAIN_MENU.ADMIN',
      colorClass: 'base-item-color-activated',
      icon: 'perun-perun-admin',
      baseColorClass: 'base-item-color',
      baseColorClassRegex: '^/dont-use$',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
      backgroundColorCss: this.baseItemColor,
      textColorCss: this.baseItemTextColor,
      links: [
        {
          label: 'MENU_ITEMS.ADMIN.OVERVIEW',
          url: ['/admin'],
          activatedRegex: '^/admin$'
        },
        {
          label: 'MENU_ITEMS.ADMIN.ATTRIBUTES',
          url: ['/admin/attributes'],
          activatedRegex: '^/admin/attributes$'
        },
        {
          label: 'MENU_ITEMS.ADMIN.USERS',
          url: ['/admin/users'],
          activatedRegex: '^/admin/users$'
        },
        {
          label: 'MENU_ITEMS.ADMIN.SERVICES',
          url: [`/admin/services`],
          activatedRegex: '^/admin/services$'
        },
        {
          label: 'MENU_ITEMS.ADMIN.VISUALIZER',
          url: ['/admin/visualizer'],
          activatedRegex: '^/admin/visualizer$',
          children: [
            {
              label: 'MENU_ITEMS.VISUALIZER.ATTR_DEPENDENCIES',
              url: ['/admin/visualizer/attrDependencies'],
              activatedRegex: '^/admin/visualizer/attrDependencies'
            },
            {
              label: this.translate.instant('MENU_ITEMS.VISUALIZER.USER_DESTINATION'),
              url: ['/admin/visualizer/userDestinationRelationship'],
              activatedRegex: '^/admin/visualizer/userDestinationRelationship'
            }
          ],
          showChildrenRegex: '/admin/visualizer'
        },
        {
          label: 'MENU_ITEMS.ADMIN.EXT_SOURCES',
          url: ['/admin/ext_sources'],
          activatedRegex: '^/admin/ext_sources$'
        }
      ]
    };
  }

  parseFacility(facility: Facility): SideMenuItem {
    return {
      label: facility.name,
      baseLink: [`/facilities/${facility.id}`],
      backgroundColorCss: this.facilityBgColor,
      textColorCss: this.facilityTextColor,
      links: this.getFacilityLinks(facility),
      colorClass: 'facility-item',
      icon: 'perun-facility-white',
      // labelClass: 'facility-text',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links'
    };
  }

  parseResource(resource: Resource, underVo: boolean): SideMenuItem {
    const baseUrl = new GetResourceRoutePipe().transform(resource, underVo);
    const regexStart = underVo ? '/organizations' : '/facilities';
    return {
      label: resource.name,
      baseLink: [baseUrl],
      backgroundColorCss: this.resourceBgColor,
      textColorCss: this.resourceTextColor,
      links: this.getResourceLinks(baseUrl, regexStart, resource),
      colorClass: 'resource-item',
      icon: 'perun-resource-white',
      // labelClass: 'resource-text',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links'
    };
  }

  private getResourceLinks(baseUrl: string, regexStart: string, resource: Resource) {
    const links: EntityMenuLink[] = [
      {
        label: 'MENU_ITEMS.RESOURCE.OVERVIEW',
        url: [baseUrl],
        activatedRegex: `${regexStart}/\\d+/resources/\\d+$`
      }];

    if(this.authResolver.isAuthorized('getAssignedGroups_Resource_policy', [resource])){
      links.push({
        label: 'MENU_ITEMS.RESOURCE.ASSIGNED_GROUPS',
        url: [baseUrl, 'groups'],
        activatedRegex: `${regexStart}/\\d+/resources/\\d+/groups$`
      });
    }
    if(this.authResolver.isAuthorized('getAssignedServices_Resource_policy', [resource])){
      links.push({
        label: 'MENU_ITEMS.RESOURCE.ASSIGNED_SERVICES',
        url: [baseUrl, 'services'],
        activatedRegex: `${regexStart}/\\d+/resources/\\d+/services$`
      });
    }
    if(this.authResolver.isAuthorized('getAssignedMembers_Resource_policy', [resource])){
      links.push({
        label: 'MENU_ITEMS.RESOURCE.ASSIGNED_MEMBERS',
        url: [baseUrl, 'members'],
        activatedRegex: `${regexStart}/\\d+/resources/\\d+/members$`
      });
    }
    links.push({
      label: 'MENU_ITEMS.RESOURCE.ATTRIBUTES',
      url: [baseUrl,`attributes`],
      activatedRegex: `${regexStart}/\\d+/resources/\\d+/attributes$`
    });

    if (this.authResolver.isManagerPagePrivileged(resource)){
      links.push({
        label: 'MENU_ITEMS.RESOURCE.SETTINGS',
        url: [baseUrl, `settings`],
        activatedRegex: `${regexStart}/\\d+/resources/\\d+/settings$`,
        children: [
          {
            label: 'MENU_ITEMS.RESOURCE.MANAGERS',
            url: [baseUrl, `settings`, `managers`],
            activatedRegex: `${regexStart}/\\d+/resources/\\d+/settings/managers$`
          }
        ],
        showChildrenRegex: `${regexStart}/\\d+/resources/\\d+/settings`
      });
    }

    return links;
  }

  parseGroup(group: Group): SideMenuItem {
    return {
      label: group.name,
      baseLink: [`/organizations/${group.voId}/groups/${group.id}`],
      backgroundColorCss: this.groupBgColor,
      textColorCss: this.groupTextColor,
      links: this.getGroupLinks(group),
      colorClass: 'group-item',
      icon: 'perun-group',
      // labelClass: 'group-text',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links'
    };
  }

  parseVo(vo: Vo): SideMenuItem {
    return {
      label: vo.name,
      baseLink: [`/organizations/${vo.id}`],
      links: this.getVoLinks(vo),
      colorClass: 'vo-item',
      icon: 'perun-vo',
      // labelClass: 'vo-text',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
      backgroundColorCss: this.voBgColor,
      textColorCss: this.voTextColor
    };
  }

  parseMember(member: RichMember, vo: Vo): SideMenuItem {
    return {
      label: parseFullName(member.user),
      baseLink: [`/organizations/${member.voId}/members/${member.id}`],
      backgroundColorCss: this.memberBgColor,
      textColorCss: this.memberTextColor,
      links: this.getMemberLinks(member, vo),
      colorClass: 'member-item',
      icon: 'perun-user',
      // labelClass: 'member-text',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links'
    };
  }

  parseUser(user: User, path: string, regex: string): SideMenuItem {
    return {
      label: parseFullName(user),
      baseLink: [path],
      backgroundColorCss: this.userBgColor,
      textColorCss: this.userTextColor,
      links: this.getUserLinks(user, path, regex),
      colorClass: 'user-bg-color',
      icon: 'perun-user',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links'
    };
  }

  parseService(service: Service): SideMenuItem {
    return {
      label: service.name,
      baseLink: [`/admin/services/${service.id}`],
      backgroundColorCss: this.serviceBgColor,
      textColorCss: this.serviceTextColor,
      links: [
        {
          label: 'MENU_ITEMS.SERVICE.OVERVIEW',
          url: [`/admin/services/${service.id}`],
          activatedRegex: '/admin/services/\\d+$'
        },
        {
          label: 'MENU_ITEMS.SERVICE.REQUIRED_ATTRIBUTES',
          url: [`/admin/services/${service.id}/required-attributes`],
          activatedRegex: '/admin/services/\\d+/required-attributes'
        },
        {
          label: 'MENU_ITEMS.SERVICE.DESTINATIONS',
          url: [`/admin/services/${service.id}/destinations`],
          activatedRegex: '/admin/services/\\d+/destinations'
        }
      ],
      colorClass: 'service-item',
      icon: 'perun-service',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links'
    };
  }

  getVoLinks(vo: Vo): EntityMenuLink[] {
    const links: EntityMenuLink[] = [];

    // Overview
    links.push({
      label: 'MENU_ITEMS.VO.OVERVIEW',
      url: [`/organizations/${vo.id}`],
      activatedRegex: '/organizations/\\d+$'
    });

    // Members
    if (this.authResolver.isAuthorized('getCompleteRichMembers_Vo_List<String>_policy', [vo])) {
      links.push({
        label: 'MENU_ITEMS.VO.MEMBERS',
        url: [`/organizations/${vo.id}/members`],
        activatedRegex: '/organizations/\\d+/members$'
      });
    }

    // Groups
    if (this.authResolver.isAuthorized('getAllRichGroupsWithAttributesByNames_Vo_List<String>_policy', [vo])) {
      links.push({
        label: 'MENU_ITEMS.VO.GROUPS',
        url: [`/organizations/${vo.id}/groups`],
        activatedRegex: '/organizations/\\d+/groups$'
      });
    }

    // Resource management
    if (this.authResolver.isAuthorized('getRichResources_Vo_policy', [vo])) {
      // Preview
      const children = [{
        label: 'MENU_ITEMS.VO.RESOURCE_PREVIEW',
        url: [`/organizations/${vo.id}/resources/preview`],
        activatedRegex: '/organizations/\\d+/resources/preview$'
      }];

      // Tags
      if (this.authResolver.isAuthorized('getAllResourcesTagsForVo_Vo_policy', [vo])) {
        children.push({
          label: 'MENU_ITEMS.VO.RESOURCE_TAGS',
          url: [`/organizations/${vo.id}/resources/tags`],
          activatedRegex: '/organizations/\\d+/resources/tags$'
        });
      }

      // States
      if (this.authResolver.isAuthorized('getResourcesState_Vo_policy', [vo])) {
        children.push({
          label: 'MENU_ITEMS.VO.RESOURCE_STATES',
          url: [`/organizations/${vo.id}/resources/states`],
          activatedRegex: '/organizations/\\d+/resources/states$'
        });
      }

      links.push({
        label: 'MENU_ITEMS.VO.RESOURCES',
        url: [`/organizations/${vo.id}/resources`],
        activatedRegex: '/organizations/\\d+/resources$',
        children: children,
        showChildrenRegex: '/organizations/\\d+/resources'
      });
    }

    // Applications
    if (this.authResolver.isAuthorized('getApplicationsForVo_Vo_List<String>_Boolean_policy', [vo])) {
      links.push({
        label: 'MENU_ITEMS.VO.APPLICATIONS',
        url: [`/organizations/${vo.id}/applications`],
        activatedRegex: '/organizations/\\d+/applications'
      });
    }

    // Sponsored members
    if(this.authResolver.isAuthorized('getSponsoredMembersAndTheirSponsors_Vo_policy', [vo])){
      links.push({
        label: 'MENU_ITEMS.VO.SPONSORED_MEMBERS',
        url: [`/organizations/${vo.id}/sponsoredMembers`],
        activatedRegex: '/organizations/\\d+/sponsoredMembers$'
      });
    }

    //Attributes
    links.push({
      label: 'MENU_ITEMS.VO.ATTRIBUTES',
      url: [`/organizations/${vo.id}/attributes`],
      activatedRegex: '/organizations/\\d+/attributes$'
    });

    // Settings
    const extSourcesAuth = this.authResolver.isAuthorized('getVoExtSources_Vo_policy', [vo]);
    const managersAuth = this.authResolver.isManagerPagePrivileged(vo);
    const adminOrObserver = this.authResolver.isThisVoAdminOrObserver(vo.id);

    if (managersAuth || extSourcesAuth || adminOrObserver) {
      const children = [];

      // Membership
      if (adminOrObserver) {
        children.push({
          label: 'MENU_ITEMS.VO.EXPIRATION',
          url: [`/organizations/${vo.id}/settings/expiration`],
          activatedRegex: '/organizations/\\d+/settings/expiration$'
        });
      }

      // Managers
      if (managersAuth) {
        children.push({
          label: 'MENU_ITEMS.VO.MANAGERS',
          url: [`/organizations/${vo.id}/settings/managers`],
          activatedRegex: '/organizations/\\d+/settings/managers$'
        });
      }

      // Application form
      if (adminOrObserver) {
        children.push({
          label: 'MENU_ITEMS.VO.APPLICATION_FORM',
          url: [`/organizations/${vo.id}/settings/applicationForm`],
          activatedRegex: '/organizations/\\d+/settings/applicationForm$'
        });
      }

      // Notifications
      if (adminOrObserver) {
        children.push({
          label: 'MENU_ITEMS.VO.NOTIFICATIONS',
          url: [`/organizations/${vo.id}/settings/notifications`],
          activatedRegex: '/organizations/\\d+/settings/notifications$'
        });
      }

      // Ext. sources
      if (extSourcesAuth) {
        children.push({
          label: 'MENU_ITEMS.VO.EXTSOURCES',
          url: [`/organizations/${vo.id}/settings/extsources`],
          activatedRegex: '/organizations/\\d+/settings/extsources$'
        });
      }

      links.push({
        label: 'MENU_ITEMS.VO.SETTINGS',
        url: [`/organizations/${vo.id}/settings`],
        activatedRegex: '/organizations/\\d+/settings$',
        children: children,
        showChildrenRegex: '/organizations/\\d+/settings'
      });
    }

    return links;
  }

  getUserLinks(user: User, path: string, regex: string): EntityMenuLink[] {
    const links: EntityMenuLink[] = [];

    // Overview
    links.push({
      label: 'MENU_ITEMS.USER.OVERVIEW',
      url: [path],
      activatedRegex: `${regex}$`
    });

    // Organizations
    links.push({
      label: 'MENU_ITEMS.ADMIN.ORGANIZATIONS',
      url: [`${path}/organizations`],
      activatedRegex: `${regex}/organizations`
    });

    // Groups
    links.push({
      label: 'MENU_ITEMS.ADMIN.GROUPS',
      url: [`${path}/groups`],
      activatedRegex: `${regex}/groups`
    });

    // Identities
    links.push({
      label: 'MENU_ITEMS.USER.IDENTITIES',
      url: [`${path}/identities`],
      activatedRegex: `${regex}/identities`
    });

    // Resources
    links.push({
      label: 'MENU_ITEMS.USER.RESOURCES',
      url: [`${path}/resources`],
      activatedRegex: `${regex}/resources`
    });

    // Attributes
    links.push({
      label: 'MENU_ITEMS.MEMBER.ATTRIBUTES',
      url: [`${path}/attributes`],
      activatedRegex: `${regex}/attributes`
    });

    // Roles
    links.push({
      label: 'MENU_ITEMS.USER.ROLES',
        url: [`${path}/roles`],
      activatedRegex: `^${path}/roles`
    });


    // Settings
    links.push({
      label: 'MENU_ITEMS.ADMIN.SETTINGS',
      url: [`${path}/settings`],
      activatedRegex: `${regex}/settings$`,
      children: [],
      showChildrenRegex: `${regex}/settings`
    });

    // Settings associated users if user is service
    // Settings service identities if user is person
    if (user.serviceUser) {
      links[links.length - 1].children.push({
        label: 'MENU_ITEMS.USER.ASSOCIATED_USERS',
        url: [`${path}/settings/associated-users`],
        activatedRegex: `^${path}/settings/associated-users`
      });
    } else {
      links[links.length - 1].children.push({
        label: 'MENU_ITEMS.USER.SERVICE_IDENTITIES',
        url: [`${path}/settings/service-identities`],
        activatedRegex: `^${path}/settings/service-identities`
      });
    }

    return links;
  }

  getMemberLinks(member: RichMember, vo: Vo): EntityMenuLink[] {
    // Overview
    const links: EntityMenuLink[] = [{
      label: 'MENU_ITEMS.MEMBER.OVERVIEW',
      url: [`/organizations/${member.voId}/members/${member.id}`],
      activatedRegex: '/organizations/\\d+/members/\\d+$'
    }];

    // Groups
    if (this.authResolver.isAuthorized('getMemberGroups_Member_policy', [vo])) {
      links.push({
        label: 'MENU_ITEMS.MEMBER.GROUPS',
        url: [`//organizations/${member.voId}/members/${member.id}/groups`],
        activatedRegex: '/organizations/\\d+/members/\\d+/groups'
      });
    }
    // Applications
    if (this.authResolver.isAuthorized('vo-getApplicationsForMember_Group_Member_policy', [vo])) {
      links.push({
        label: 'MENU_ITEMS.MEMBER.APPLICATIONS',
        url: [`//organizations/${member.voId}/members/${member.id}/applications`],
        activatedRegex: '/organizations/\\d+/members/\\d+/applications'
      });
    }
    // Resources
    if (this.authResolver.isAuthorized('getAssignedRichResources_Member_policy', [vo])) {
      links.push({
        label: 'MENU_ITEMS.MEMBER.RESOURCES',
        url: [`/organizations/${member.voId}/members/${member.id}/resources`],
        activatedRegex: '/organizations/\\d+/members/\\d+/resources'
      });
    }

    // Attributes
    links.push({
      label: 'MENU_ITEMS.MEMBER.ATTRIBUTES',
      url: [`/organizations/${member.voId}/members/${member.id}/attributes`],
      activatedRegex: '/organizations/\\d+/members/\\d+/attributes$'
    });

    //Settings
    // const children = [];
    //
    // links.push({
    //   label: 'MENU_ITEMS.MEMBER.SETTINGS',
    //   url: [`/organizations/${member.voId}/members/${member.id}/settings`],
    //   activatedRegex: '/organizations/\\d+/members/\\d+/settings$',
    //   children: children,
    //   showChildrenRegex: '/organizations/\\d+/members/\\d+/settings'
    // });

    return links;
  }

  getFacilityLinks(facility: Facility): EntityMenuLink[]{
    const links: EntityMenuLink[] = [
      {
        label: 'MENU_ITEMS.FACILITY.OVERVIEW',
        url: [`/facilities/${facility.id}`],
        activatedRegex: '/facilities/\\d+$'
      }];

    // Resources
    if (this.authResolver.isAuthorized('getAssignedRichResources_Facility_policy', [facility])) {
      links.push({
        label: 'MENU_ITEMS.FACILITY.RESOURCES',
        url: [`/facilities/${facility.id}/resources`],
        activatedRegex: '/facilities/\\d+/resources$'
      });
    }
    // Allowed users
    if (this.authResolver.isAuthorized('getAssignedUsers_Facility_Service_policy', [facility])) {
      links.push({
        label: 'MENU_ITEMS.FACILITY.ALLOWED_USERS',
        url: [`/facilities/${facility.id}/allowed-users`],
        activatedRegex: '/facilities/\\d+/allowed-users'
      });
    }
    // Allowed groups
    if (this.authResolver.isAuthorized('getAllowedGroups_Facility_Vo_Service_policy', [facility])) {
      links.push({
        label: 'MENU_ITEMS.FACILITY.ALLOWED_GROUPS',
        url: [`/facilities/${facility.id}/allowed-groups`],
        activatedRegex: '/facilities/\\d+/allowed-groups'
      });
    }
    // Service state
    if (this.authResolver.isAuthorized('getFacilityServicesState_Facility_policy', [facility])) {
      links.push({
        label: 'MENU_ITEMS.FACILITY.SERVICES_STATUS',
        url: [`/facilities/${facility.id}/services-status`],
        activatedRegex: '/facilities/\\d+/services-status'
      });
    }
    // Service destination
    if (this.authResolver.isAuthorized('getAllRichDestinations_Facility_policy', [facility])) {
      links.push({
        label: 'MENU_ITEMS.FACILITY.SERVICES_DESTINATIONS',
        url: [`/facilities/${facility.id}/services-destinations`],
        activatedRegex: 'facilities/\\d+/services-destinations'
      });
    }
    // Hosts
    // TODO fix when policies are updated
    if (this.authResolver.isFacilityAdmin()) {
      links.push({
        label: 'MENU_ITEMS.FACILITY.HOSTS',
        url: [`/facilities/${facility.id}/hosts`],
        activatedRegex: 'facilities/\\d+/hosts'
      });
    }
    links.push({
      label: 'MENU_ITEMS.FACILITY.ATTRIBUTES',
      url: ['/facilities', facility.id, 'attributes'],
      activatedRegex: '/facilities/\\d+/attributes$'
    });

    // Settings
    const bansAuth = this.authResolver.isAuthorized('getBansForFacility_int_policy', [facility]);
    const managersAuth = this.authResolver.isAuthorized('getRichAdmins_Facility_List<String>_boolean_boolean_policy', [facility]);
    const ownersAuth = this.authResolver.isAuthorized('getOwners_Facility_policy', [facility]);
    const securityAuth = this.authResolver.isAuthorized('getAssignedSecurityTeams_Facility_policy', [facility]);

    if(bansAuth || managersAuth || ownersAuth || securityAuth){
      const children = [];

      // Owners
      if (ownersAuth) {
        children.push({
          label: 'MENU_ITEMS.FACILITY.OWNERS',
          url: ['/facilities', facility.id, 'settings', 'owners'],
          activatedRegex: '/facilities/\\d+/settings/owners$'
        });
      }
      // Managers
      if (managersAuth) {
        children.push({
          label: 'MENU_ITEMS.FACILITY.MANAGERS',
          url: ['/facilities', facility.id, 'settings', 'managers'],
          activatedRegex: '/facilities/\\d+/settings/managers$'
        });
      }
      // Security teams
      if (securityAuth){
        children.push({
          label: 'MENU_ITEMS.FACILITY.SECURITY_TEAMS',
          url: [`/facilities/${facility.id}/settings/security-teams`],
          activatedRegex: 'facilities/\\d+/settings/security-teams'
        });
      }

      // Blacklist
      if (bansAuth) {
        children.push({
          label: 'MENU_ITEMS.FACILITY.BLACKLIST',
          url: ['facilities', facility.id, 'settings', 'blacklist'],
          activatedRegex: '/facilities/\\d+/settings/blacklist'
        });
      }

      links.push({
        label: 'MENU_ITEMS.FACILITY.SETTINGS',
        url: ['/facilities', facility.id, 'settings'],
        activatedRegex: '/facilities/\\d+/settings$',
        children: children,
        showChildrenRegex: '/facilities/\\d+/settings'
      });
    }
    return links;
  }

  getGroupLinks(group: Group): EntityMenuLink[] {
    const links: EntityMenuLink[] = [];
    const settingsChildrenLinks: EntityMenuLink[] = [];

    //Overview
    links.push({
      label: 'MENU_ITEMS.GROUP.OVERVIEW',
      url: [`/organizations/${group.voId}/groups/${group.id}`],
      activatedRegex: '/organizations/\\d+/groups/\\d+$'
    });

    //Members
    if (this.authResolver.isAuthorized('getCompleteRichMembers_Group_List<String>_boolean_policy', [group])) {
      links.push({
        label: 'MENU_ITEMS.GROUP.MEMBERS',
        url: [`/organizations/${group.voId}/groups/${group.id}/members`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/members$'
      });
    }

    //Subgroups
    if (this.authResolver.isAuthorized('getAllRichSubGroupsWithAttributesByNames_Group_List<String>_policy', [group])
        && group.name !== 'members') {
      links.push({
        label: 'MENU_ITEMS.GROUP.SUBGROUPS',
        url: [`/organizations/${group.voId}/groups/${group.id}/subgroups`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/subgroups$'
      });
    }

    //Resources
    if (this.authResolver.isAuthorized('getAssignedRichResources_Group_policy', [group])) {
      links.push({
        label: 'MENU_ITEMS.GROUP.RESOURCES',
        url: [`/organizations/${group.voId}/groups/${group.id}/resources`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/resources$'
      });
    }

    //Applications
    if (this.authResolver.isAuthorized('getApplicationsForGroup_Group_List<String>_policy', [group])) {
      links.push({
        label: 'MENU_ITEMS.GROUP.APPLICATIONS',
        url: [`/organizations/${group.voId}/groups/${group.id}/applications`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/applications$'
      });
    }

    //Attributes
    links.push({
      label: 'MENU_ITEMS.GROUP.ATTRIBUTES',
      url: [`/organizations/${group.voId}/groups/${group.id}/attributes`],
      activatedRegex: '/organizations/\\d+/groups/\\d+/attributes$'
    });

    //SettingsMembership
    //not implemented in authorization....probably must be hardcoded
    this.apiRequest.dontHandleErrorForNext();
    this.attributesManager.getGroupAttributeByName(group.id, Urns.GROUP_DEF_EXPIRATION_RULES).subscribe(() => {
      settingsChildrenLinks.push({
        label: 'MENU_ITEMS.GROUP.EXPIRATION',
        url: [`/organizations/${group.voId}/groups/${group.id}/settings/expiration`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/settings/expiration$'
      });
    }, error => {
      if (error.name !== 'HttpErrorResponse') {
        this.notificator.showRPCError(error);
      }
    });

    //SettingsManagers
    if (this.authResolver.isManagerPagePrivileged(group)) {
      settingsChildrenLinks.push({
        label: 'MENU_ITEMS.GROUP.MANAGERS',
        url: [`/organizations/${group.voId}/groups/${group.id}/settings/managers`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/settings/managers$'
      });
    }

    //SettingsApplicationForm
    if (this.authResolver.isAuthorized('group-getFormItems_ApplicationForm_AppType_policy', [group])) {
      settingsChildrenLinks.push({
        label: 'MENU_ITEMS.GROUP.APPLICATION_FORM',
        url: [`/organizations/${group.voId}/groups/${group.id}/settings/applicationForm`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/settings/applicationForm$'
      });
    }

    //SettingsNotifications
    if (this.authResolver.isAuthorized('group-getFormItems_ApplicationForm_AppType_policy', [group])) {
      settingsChildrenLinks.push({
        label: 'MENU_ITEMS.GROUP.NOTIFICATIONS',
        url: [`/organizations/${group.voId}/groups/${group.id}/settings/notifications`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/settings/notifications$'
      });
    }

    //SettingsRelations
    if (this.authResolver.isAuthorized('getGroupUnions_Group_boolean_policy', [group])) {
      settingsChildrenLinks.push({
        label: 'MENU_ITEMS.GROUP.RELATIONS',
        url: [`/organizations/${group.voId}/groups/${group.id}/settings/relations`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/settings/relations$'
      });
    }

    //SettingsWithChildrenLinks
    if (settingsChildrenLinks.length !== 0){
      links.push({
        label: 'MENU_ITEMS.GROUP.SETTINGS',
        url: [`/organizations/${group.voId}/groups/${group.id}/settings`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/settings$',
        children: settingsChildrenLinks,
        showChildrenRegex: '/organizations/\\d+/groups/\\d+/settings'
      });
    }

    return links;
  }
}
