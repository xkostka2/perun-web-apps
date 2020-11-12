import {Component, HostBinding, OnInit} from '@angular/core';
import {MenuItem} from '@perun-web-apps/perun/models';
import {ActivatedRoute} from '@angular/router';
import { FacilitiesManagerService, Facility } from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-facility-settings-overview',
  templateUrl: './facility-settings-overview.component.html',
  styleUrls: ['./facility-settings-overview.component.scss']
})
export class FacilitySettingsOverviewComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(
    private route: ActivatedRoute,
    private facilityManager: FacilitiesManagerService,
    private authResolver: GuiAuthResolver
  ) { }

  items: MenuItem[] = [];
  facility: Facility;
  loading = false;

  ngOnInit() {
    this.loading = true;
    this.route.parent.parent.params.subscribe(parentParams => {
      const facilityId = parentParams['facilityId'];

      this.facilityManager.getFacilityById(facilityId).subscribe(facility => {
        this.facility = facility;

        this.initItems();
        this.loading = false;
      }, () => this.loading = false);
    });
  }

  private initItems() {
    this.items = [];

    // Owners
    if(this.authResolver.isAuthorized('getOwners_Facility_policy', [this.facility])){
      this.items.push({
        cssIcon: 'perun-user',
        url: `/facilities/${this.facility.id}/settings/owners`,
        label: 'MENU_ITEMS.FACILITY.OWNERS',
        style: 'facility-btn'
      });
    }
    // Managers
    if(this.authResolver.isAuthorized('getRichAdmins_Facility_List<String>_boolean_boolean_policy', [this.facility])){
     this.items.push({
       cssIcon: 'perun-manager',
       url: `/facilities/${this.facility.id}/settings/managers`,
       label: 'MENU_ITEMS.FACILITY.MANAGERS',
       style: 'facility-btn'
     });
    }
    // Security teams
    if (this.authResolver.isAuthorized('getAssignedSecurityTeams_Facility_policy', [this.facility])) {
      this.items.push({
        cssIcon: 'perun-security-teams',
        url: `/facilities/${this.facility.id}/settings/security-teams`,
        label: 'MENU_ITEMS.FACILITY.SECURITY_TEAMS',
        style: 'facility-btn'
      });
    }
    // Blacklist
    if(this.authResolver.isAuthorized('getBansForFacility_int_policy', [this.facility])){
     this.items.push({
       cssIcon: 'perun-black-list',
       url: `/facilities/${this.facility.id}/settings/blacklist`,
       label: 'MENU_ITEMS.FACILITY.BLACKLIST',
       style: 'facility-btn'
     });
    }
  }
}
