import { Component, HostBinding, OnInit } from '@angular/core';
import { MenuItem } from '@perun-web-apps/perun/models';
import { ActivatedRoute } from '@angular/router';
import {
  AttributesManagerService,
  Group,
  GroupsManagerService,
  Vo,
  VosManagerService
} from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService, GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';

@Component({
  selector: 'app-group-overview',
  templateUrl: './group-overview.component.html',
  styleUrls: ['./group-overview.component.scss']
})
export class GroupOverviewComponent implements OnInit {

  // used for router animation
  @HostBinding('class.router-component') true;

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupsManagerService,
    private voService: VosManagerService,
    private guiAuthResolver: GuiAuthResolver,
    private apiRequest: ApiRequestConfigurationService,
    private attributesManager: AttributesManagerService,
    private notificator: NotificatorService
  ) {
  }

  navItems: MenuItem[] = [];
  groupId: number;
  group: Group;
  parentGroup: Group = null;
  loading = false;

  ngOnInit() {
    this.loading = true;
    this.route.params.subscribe(params => {
      this.groupId = params['groupId'];

      this.groupService.getGroupById(this.groupId).subscribe(group => {
        this.group = group;
        if (this.group.parentGroupId !== null) {
          this.loadParentGroupData();
        } else {
          this.parentGroup = null;
          this.initNavItems();
          this.loading = false;
        }
      }, () => this.loading = false);
    });
  }

  private loadParentGroupData() {
    this.groupService.getGroupById(this.group.parentGroupId).subscribe(parentGroup => {
      this.parentGroup = parentGroup;
      this.initNavItems();
      this.loading = false;
    }, () => this.loading = false);
  }

  private initNavItems() {
    this.navItems = [];

    if (this.guiAuthResolver.isAuthorized('getCompleteRichMembers_Group_List<String>_boolean_policy', [this.group])) {
      this.navItems.push(
        {
          cssIcon: 'perun-user',
          url: `/organizations/${this.group.voId}/groups/${this.groupId}/members`,
          label: 'MENU_ITEMS.GROUP.MEMBERS',
          style: 'group-btn'
        });
    }

    if (this.guiAuthResolver.isAuthorized('getAllRichSubGroupsWithAttributesByNames_Group_List<String>_policy', [this.group])
        && this.group.name !== 'members') {
      this.navItems.push({
        cssIcon: 'perun-group',
        url: `/organizations/${this.group.voId}/groups/${this.groupId}/subgroups`,
        label: 'MENU_ITEMS.GROUP.SUBGROUPS',
        style: 'group-btn'
      });
    }

    if (this.guiAuthResolver.isAuthorized('getAssignedRichResources_Group_policy', [this.group])) {
      this.navItems.push({
        cssIcon: 'perun-manage-facility',
        url: `/organizations/${this.group.voId}/groups/${this.groupId}/resources`,
        label: 'MENU_ITEMS.GROUP.RESOURCES',
        style: 'group-btn'
      });
    }

    if (this.guiAuthResolver.isAuthorized('getApplicationsForGroup_Group_List<String>_policy', [this.group])) {
      this.navItems.push({
        cssIcon: 'perun-applications',
        url: `/organizations/${this.group.voId}/groups/${this.groupId}/applications`,
        label: 'MENU_ITEMS.GROUP.APPLICATIONS',
        style: 'group-btn'
      });
    }

    this.navItems.push({
      cssIcon: 'perun-attributes',
      url: `/organizations/${this.group.voId}/groups/${this.group.id}/attributes`,
      label: 'MENU_ITEMS.GROUP.ATTRIBUTES',
      style: 'group-btn'
    });

    //SettingsMembership
    //not implemented in authorization....probably must be hardcoded
    let expirationAuth = false;
    this.apiRequest.dontHandleErrorForNext();
    this.attributesManager.getGroupAttributeByName(this.group.id, Urns.GROUP_DEF_EXPIRATION_RULES).subscribe(() => {
      expirationAuth = true;
    }, error => {
      if (error.name !== 'HttpErrorResponse') {
        this.notificator.showRPCError(error);
      }
    });

    const managerAuth = this.guiAuthResolver.isManagerPagePrivileged(this.group);
    const appFormAuth = this.guiAuthResolver.isAuthorized('group-getFormItems_ApplicationForm_AppType_policy', [this.group]);
    const notificationAuth = this.guiAuthResolver.isAuthorized('group-getFormItems_ApplicationForm_AppType_policy', [this.group]);
    const relationAuth = this.guiAuthResolver.isAuthorized('getGroupUnions_Group_boolean_policy', [this.group]);
    if(expirationAuth || managerAuth || appFormAuth || notificationAuth || relationAuth){
      this.navItems.push({
        cssIcon: 'perun-settings2',
        url: `/organizations/${this.group.voId}/groups/${this.groupId}/settings`,
        label: 'MENU_ITEMS.GROUP.SETTINGS',
        style: 'group-btn'
      });
    }
  }
}
