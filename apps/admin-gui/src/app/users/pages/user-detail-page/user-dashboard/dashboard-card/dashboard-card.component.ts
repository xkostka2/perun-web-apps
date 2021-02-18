import { Component, Input, OnInit } from '@angular/core';
import {
  AuthzResolverService, EnrichedFacility, Facility,
  Group,
  ResourcesManagerService,
  RichResource,
  Vo
} from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { getRecentlyVisitedIds } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'app-perun-web-apps-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.css']
})
export class DashboardCardComponent implements OnInit {

  constructor(private authzResolver: AuthzResolverService,
              private guiAuthResolver: GuiAuthResolver,
              private resourceService: ResourcesManagerService){ }

  @Input()
  role: { [key: string]: Array<number>; }

  @Input()
  roleName: string;

  primaryObject: string;
  svgIcon: string;
  title: string;
  roleTooltipInfo: string;
  objects: Vo[] | Group[] | RichResource[] | EnrichedFacility[];
  loading = false;
  recentIds =[];

  ngOnInit(): void {
    this.loading = true;
    this.primaryObject = this.guiAuthResolver.getPrimaryObjectOfRole(this.roleName);
    this.svgIcon = 'perun-' + this.primaryObject.toLowerCase() + '-black';
    this.title = 'USER_DETAIL.DASHBOARD.CARD_TITLE_' + this.roleName;
    this.roleTooltipInfo = 'USER_DETAIL.DASHBOARD.ROLE_INFO_' + this.roleName;
    this.getObjects();

  }

  public getObjects() {
    switch (this.primaryObject) {
      case 'Vo': {
        this.authzResolver.getVosWhereUserIsInRoles([this.roleName]).subscribe( vos => {
          this.objects = vos;
          this.recentIds = getRecentlyVisitedIds('vos');
          this.loading = false;
        });
        break;
      }
      case 'Group': {
        this.authzResolver.getGroupsWhereUserIsInRoles([this.roleName]).subscribe( groups => {
          this.objects = groups;
          this.recentIds = getRecentlyVisitedIds('groups');
          this.loading = false;
        });
        break;
      }
      case 'Resource': {
        this.resourceService.getRichResourcesByIds(this.role[this.primaryObject]).subscribe( resources => {
          this.objects = resources;
          this.recentIds = getRecentlyVisitedIds('resources');
          this.loading = false;
        });
        break;
      }
      case 'Facility': {
        this.authzResolver.getFacilitiesWhereUserIsInRoles([this.roleName]).subscribe( facilities => {
          this.objects = facilities.map(fac =>{
            const ef: EnrichedFacility = {
              facility: fac
            };
            return ef
          });
          this.recentIds = getRecentlyVisitedIds('facilities')
          this.loading = false;
        });
        break;
      }
      default: {
        this.objects = [];
        this.loading = false;
      }
    }
  }
}
