import { Component, HostBinding, OnInit } from '@angular/core';
import {
  FacilitiesManagerService,
  Facility,
  Group, Resource, ResourcesManagerService,
  User,
  UsersManagerService,
  Vo, VosManagerService
} from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver, StoreService } from '@perun-web-apps/perun/services';
import {
  TABLE_USER_PROFILE_DASHBOARD_FACILITY,
  TABLE_USER_PROFILE_DASHBOARD_GROUP,
  TABLE_USER_PROFILE_DASHBOARD_RESOURCE,
  TABLE_USER_PROFILE_DASHBOARD_VO,
  TABLE_USER_PROFILE_DASHBOARD_VO_SPONSORED,
  TABLE_USER_PROFILE_DASHBOARD_VO_TOP_GROUP_CREATOR,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { MenuItem } from '@perun-web-apps/perun/models';
import { PageEvent } from '@angular/material/paginator';
import { SideMenuService } from '../../../../core/services/common/side-menu.service';

@Component({
  selector: 'app-perun-web-apps-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(private userManager: UsersManagerService,
              private storeService: StoreService,
              private guiAuthResolver: GuiAuthResolver,
              private tableConfigService: TableConfigService,
              private facilitiesService: FacilitiesManagerService,
              private resourcesService: ResourcesManagerService,
              private sideMenuService: SideMenuService,
              private voManager: VosManagerService) { }

  navItems: MenuItem[] = [];
  user: User;
  path: string;

  adminVo: Vo[] = [];
  voTableId = TABLE_USER_PROFILE_DASHBOARD_VO;
  voPageSize: number;
  voFilterValue = '';

  adminGroup: Group[] = [];
  groupTableId = TABLE_USER_PROFILE_DASHBOARD_GROUP;
  groupPageSize: number;
  groupFilterValue = '';

  adminFacility: Facility[] = [];
  facilityTableId = TABLE_USER_PROFILE_DASHBOARD_FACILITY;
  facilityPageSize: number;
  facilityFilterValue = '';

  adminResource: Resource[] = [];
  resourceTableId = TABLE_USER_PROFILE_DASHBOARD_RESOURCE;
  resourcePageSize: number;
  resourceFilterValue = '';

  sponsoringVo: Vo[] = [];
  sponsoringVoTableId = TABLE_USER_PROFILE_DASHBOARD_VO_SPONSORED;
  sponsoringVoPageSize: number;
  sponsoringVoFilterValue = '';

  topGroupCreatorVo: Vo[] = [];
  topGroupCreatorVoTableId = TABLE_USER_PROFILE_DASHBOARD_VO_TOP_GROUP_CREATOR;
  topGroupCreatorVoPageSize: number;
  topGroupCreatorVoFilterValue = '';

  loading = false;

  ngOnInit() {
    this.loading = true;
    this.user = this.storeService.getPerunPrincipal().user;
    this.voPageSize = this.tableConfigService.getTablePageSize(this.voTableId);
    this.groupPageSize = this.tableConfigService.getTablePageSize(this.groupTableId);
    this.facilityPageSize = this.tableConfigService.getTablePageSize(this.facilityTableId);
    this.resourcePageSize = this.tableConfigService.getTablePageSize(this.resourceTableId);
    this.sponsoringVoPageSize = this.tableConfigService.getTablePageSize(this.sponsoringVoTableId);
    this.topGroupCreatorVoPageSize = this.tableConfigService.getTablePageSize(this.topGroupCreatorVoTableId);
    this.getAdminVoGroup();
    this.sideMenuService.setHomeItems([]);
  }

  getAdminVoGroup() {
    this.userManager.getVosWhereUserIsAdmin(this.user.id).subscribe( vo => {
      this.adminVo = vo;
      this.userManager.getGroupsWhereUserIsAdmin(this.user.id).subscribe( groups => {
        this.adminGroup = groups;
        return this.getAdminFacility()
          .then(() => this.getVoWhereUserIsSponsor())
          .then(() => this.getVoWhereUserIsTopGroupCreator())
          .then(() => this.getAdminResource());
      }, () => this.loading = false);
    }, () => this.loading = false);
  }

  getAdminFacility(): Promise<void> {
    return new Promise((resolve, reject) => {

      if (this.guiAuthResolver.isAuthorized('getFacilities_policy', [])) {
        this.facilitiesService.getAllFacilities().subscribe(facilities => {
          this.adminFacility = facilities;
          resolve();
        }, () => resolve());
      } else {
        resolve();
      }

    });
  }

  getVoWhereUserIsSponsor(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.guiAuthResolver.isOnlySponsor()) {
        const vosSponsoring = this.storeService.getPerunPrincipal().roles['SPONSOR']['Vo'];
        if (vosSponsoring === undefined || vosSponsoring.length === 0){
          resolve();
        }
        let voCount = 0;
        for (const voId of vosSponsoring) {
          this.voManager.getVoById(voId).subscribe(vo => {
            this.sponsoringVo.push(vo);
            voCount++;
            if (voCount === vosSponsoring.length) {
              resolve();
            }
          });
        }
      } else {
        resolve();
      }
    });
  }

  getAdminResource() {
      this.resourcesService.getAllResourcesWhereUserIsAdmin(this.user.id).subscribe(resources => {
        this.adminResource = resources;
        this.loading = false;
      }, () => this.loading = false);
  }

  pageChanged($event: PageEvent, tableId: string, pagesize: number) {
    pagesize = $event.pageSize;
    this.tableConfigService.setTablePageSize(tableId, pagesize);
  }

  getVoWhereUserIsTopGroupCreator(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.guiAuthResolver.isTopGroupCreatorOnly()) {
        const vosCreator = this.storeService.getPerunPrincipal().roles['TOPGROUPCREATOR']['Vo'];
        let voCount = 0;
        for (const voId of vosCreator) {
          this.voManager.getVoById(voId).subscribe(vo => {
            this.topGroupCreatorVo.push(vo);
            voCount++;
            if (voCount === vosCreator.length) {
              resolve();
            }
          });
        }
      } else {
        resolve();
      }
    });
  }
}
