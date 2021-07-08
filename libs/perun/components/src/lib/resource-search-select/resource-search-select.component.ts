import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Resource } from '@perun-web-apps/perun/openapi';
import { compareFnName } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-resource-search-select',
  templateUrl: './resource-search-select.component.html',
  styleUrls: ['./resource-search-select.component.css']
})
export class ResourceSearchSelectComponent implements OnInit{

  constructor() { }

  @Input()
  resources: Resource[];

  @Output()
  resourceSelected = new EventEmitter<Resource>();

  nameFunction = (resource: Resource) => resource.name;

  ngOnInit(): void {
    this.resources = this.resources.sort(compareFnName);
  }
}
