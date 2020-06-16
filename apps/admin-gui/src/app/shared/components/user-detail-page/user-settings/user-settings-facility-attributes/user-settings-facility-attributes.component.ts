import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FacilitiesManagerService, Facility } from '@perun-web-apps/perun/openapi';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-user-settings-facility-attributes',
  templateUrl: './user-settings-facility-attributes.component.html',
  styleUrls: ['./user-settings-facility-attributes.component.scss']
})
export class UserSettingsFacilityAttributesComponent implements OnInit {

  constructor(protected route: ActivatedRoute,
              private storage: StoreService,
              private facilitiesManagerService: FacilitiesManagerService) {
  }

  userId: number;
  facilities: Facility[] = [];
  loading: boolean;


  ngOnInit(): void {
    this.loading = true;
    this.route.parent.parent.params.subscribe(params => {
      this.userId = params['userId'];
      if (this.userId === undefined) {
        this.userId = this.storage.getPerunPrincipal().userId;
      }

      this.facilitiesManagerService.getAssignedFacilitiesByUser(this.userId).subscribe(facilities => {
        this.facilities = facilities;
        this.loading = false;
      });
    });
  }

}
