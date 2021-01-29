import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Resource } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-resource-search-select',
  templateUrl: './resource-search-select.component.html',
  styleUrls: ['./resource-search-select.component.css']
})
export class ResourceSearchSelectComponent {

  constructor() { }

  @Input()
  resources: Resource[];

  @Output()
  resourceSelected = new EventEmitter<Resource>();

  nameFunction = (resource: Resource) => resource.name;
}
