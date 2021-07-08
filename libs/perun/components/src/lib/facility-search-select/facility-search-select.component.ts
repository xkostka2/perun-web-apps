import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Facility } from '@perun-web-apps/perun/openapi';
import { compareFnName } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-facility-search-select',
  templateUrl: './facility-search-select.component.html',
  styleUrls: ['./facility-search-select.component.css']
})
export class FacilitySearchSelectComponent implements OnInit{

  constructor() { }

  @Input()
  facilities: Facility[];

  @Output()
  facilitySelected = new EventEmitter<Facility>();
  nameFunction = (facility: Facility) => facility.name;

  ngOnInit(): void {
    this.facilities = this.facilities.sort(compareFnName);
  }
}
