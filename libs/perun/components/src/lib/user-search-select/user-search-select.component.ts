import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '@perun-web-apps/perun/openapi';
import { parseFullName } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-user-search-select',
  templateUrl: './user-search-select.component.html',
  styleUrls: ['./user-search-select.component.css']
})
export class UserSearchSelectComponent {

  constructor() { }

  @Input()
  users: User[];

  @Input()
  disableAutoSelect = false;

  @Output()
  userSelected = new EventEmitter<User>();
  userFullNameFunction = parseFullName;
}
