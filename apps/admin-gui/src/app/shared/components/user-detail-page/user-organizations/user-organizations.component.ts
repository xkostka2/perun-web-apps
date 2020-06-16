import { Component, HostBinding, OnInit } from '@angular/core';
import { UsersManagerService, Vo } from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver, StoreService } from '@perun-web-apps/perun/services';
import { PageEvent } from '@angular/material/paginator';
import {
  TABLE_USER_PROFILE_ADMIN_SELECT, TABLE_USER_PROFILE_MEMBER_SELECT,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-organizations',
  templateUrl: './user-organizations.component.html',
  styleUrls: ['./user-organizations.component.scss']
})
export class UserOrganizationsComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(
    private usersService: UsersManagerService,
    private authResolver: GuiAuthResolver,
    private tableConfigService: TableConfigService,
    private store: StoreService,
    private route: ActivatedRoute
  ) {
  }

  vosWhereIsAdmin: Vo[];
  vosWhereIsMember: Vo[];
  loading: boolean;
  userId: number;
  filterValue = '';

  displayedColumns = ['id', 'name'];
  adminPageSize: number;
  memberPageSize: number;
  adminTableId = TABLE_USER_PROFILE_ADMIN_SELECT;
  memberTableId = TABLE_USER_PROFILE_MEMBER_SELECT;

  ngOnInit() {
    this.adminPageSize = this.tableConfigService.getTablePageSize(this.adminTableId);
    this.memberPageSize = this.tableConfigService.getTablePageSize(this.memberTableId);
    this.route.parent.params.subscribe(params => {
      this.userId = params['userId'];
      if (this.userId === undefined) {
        this.userId = this.store.getPerunPrincipal().userId;
      }

      this.refreshTable();
    });

    this.refreshTable();
  }

  refreshTable() {
    this.loading = true;
    this.usersService.getVosWhereUserIsMember(this.userId).subscribe(vosMember => {
      this.vosWhereIsMember = vosMember;

      this.usersService.getVosWhereUserIsAdmin(this.userId).subscribe(vosAdmin => {
        this.vosWhereIsAdmin = vosAdmin;
        this.loading = false;
      });
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  adminPageChanged(event: PageEvent) {
    this.adminPageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.adminTableId, event.pageSize);
  }

  memberPageChanged(event: PageEvent) {
    this.memberPageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.memberTableId, event.pageSize);
  }
}
