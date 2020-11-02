import { Component, HostBinding, OnInit } from '@angular/core';
import { RichUser, UsersManagerService } from '@perun-web-apps/perun/openapi';
import {
  TABLE_ADMIN_USER_SELECT,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';
import { Urns } from '@perun-web-apps/perun/urns';
import { StoreService } from '@perun-web-apps/perun/services';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {

  static id = 'AdminUsersComponent';

  @HostBinding('class.router-component') true;

  constructor(
    private usersService: UsersManagerService,
    private storeService: StoreService,
    private tableConfigService: TableConfigService
  ) { }

  users: RichUser[];

  searchControl: FormControl;
  loading = false;
  firstSearchDone = false;
  pageSize: number;
  tableId = TABLE_ADMIN_USER_SELECT;

  ngOnInit() {
    this.searchControl = new FormControl('', [Validators.required, Validators.pattern('.*[\\S]+.*')]);
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
  }

  onSearchByString() {
    if (this.searchControl.invalid) {
      this.searchControl.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.firstSearchDone = true;
    let attributes = [
      Urns.USER_DEF_ORGANIZATION,
      Urns.USER_DEF_PREFERRED_MAIL];
    attributes = attributes.concat(this.storeService.getLoginAttributeNames());
    this.usersService.findRichUsersWithAttributes(this.searchControl.value, attributes).subscribe(users => {
      this.users = users;
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  onKeyInput(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSearchByString();
    }
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
