import {Component, HostBinding, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { Facility } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-facility-attributes',
  templateUrl: './facility-attributes.component.html',
  styleUrls: ['./facility-attributes.component.scss']
})
export class FacilityAttributesComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(private route: ActivatedRoute,
              private authResolver: GuiAuthResolver) {}

  facilityId: number;
  facilityUserAttAuth: boolean;

  ngOnInit() {
    this.route.parent.params.subscribe(params => {
      this.facilityId = params['facilityId'];

      const facility: Facility = {
        id: this.facilityId,
        beanName: 'Facility'
      }
      this.facilityUserAttAuth = this.authResolver.isAuthorized('getAssignedUsers_Facility_policy', [facility]);

    });
  }
}
