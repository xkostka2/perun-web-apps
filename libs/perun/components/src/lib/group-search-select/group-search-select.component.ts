import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Group } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-group-search-select',
  templateUrl: './group-search-select.component.html',
  styleUrls: ['./group-search-select.component.css']
})
export class GroupSearchSelectComponent {

  @Input()
  groups: Group[];

  @Output()
  groupSelected = new EventEmitter<Group>();

  @Input()
  disableAutoSelect = false;

  @Input()
  firstSelectedGroup: Group;

  nameFunction = (group: Group) => group.name;
}
