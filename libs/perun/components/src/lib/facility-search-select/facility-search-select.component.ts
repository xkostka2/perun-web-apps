import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Facility } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-facility-search-select',
  templateUrl: './facility-search-select.component.html',
  styleUrls: ['./facility-search-select.component.css']
})
export class FacilitySearchSelectComponent {

  constructor() { }

  @Input()
  facilities: Facility[];

  @Output()
  facilitySelected = new EventEmitter<Facility>();
  nameFunction = (facility: Facility) => facility.name;
}
