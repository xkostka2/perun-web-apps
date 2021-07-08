import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Group } from '@perun-web-apps/perun/openapi';
import { compareFnName } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-group-search-select',
  templateUrl: './group-search-select.component.html',
  styleUrls: ['./group-search-select.component.css']
})
export class GroupSearchSelectComponent implements OnInit{

  @Input()
  groups: Group[];

  @Output()
  groupSelected = new EventEmitter<Group>();

  @Input()
  disableAutoSelect = false;

  @Input()
  firstSelectedGroup: Group;

  nameFunction = (group: Group) => group.name;

  ngOnInit(): void {
   this.groups = this.groups.sort(compareFnName);
  }
}
