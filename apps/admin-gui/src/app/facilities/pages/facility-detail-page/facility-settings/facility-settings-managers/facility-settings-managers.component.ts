import { Component, HostBinding, OnInit } from '@angular/core';
import { FacilitiesManagerService, Facility } from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-perun-web-apps-facility-settings-managers',
  templateUrl: './facility-settings-managers.component.html',
  styleUrls: ['./facility-settings-managers.component.scss']
})
export class FacilitySettingsManagersComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(
    private facilityService: FacilitiesManagerService,
    private route: ActivatedRoute,
    private guiAuthResolver: GuiAuthResolver
  ) { }

  facility: Facility;

  availableRoles: string[] = [];

  selected = 'user';

  type = 'Facility';

  theme = 'facility-theme';

  ngOnInit() {
    this.route.parent.parent.params.subscribe(parentParentParams => {
      const facilityId = parentParentParams ['facilityId'];

      this.facilityService.getFacilityById(facilityId).subscribe( facility => {
        this.facility = facility;
      });
    });

    this.guiAuthResolver.assignAvailableRoles(this.availableRoles, 'Facility');
  }
}
