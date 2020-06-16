import { Component, HostBinding, OnInit } from '@angular/core';
import { MembersService, StoreService } from '@perun-web-apps/perun/services';
import { Group, GroupsManagerService, UsersManagerService, Vo } from '@perun-web-apps/perun/openapi';
import {
  TABLE_USER_DETAIL_ADMIN_GROUPS,
  TABLE_USER_DETAIL_MEMBER_GROUPS,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-groups',
  templateUrl: './user-groups.component.html',
  styleUrls: ['./user-groups.component.scss']
})
export class UserGroupsComponent implements OnInit {

  @HostBinding('class.router-component') true;

  loading = false;
  userId: number;
  vos: Vo[] = [];
  membersGroups: Group[] = [];
  adminsGroups: Group[] = [];

  tableId = TABLE_USER_DETAIL_MEMBER_GROUPS;
  pageSize: number;

  adminTableId = TABLE_USER_DETAIL_ADMIN_GROUPS;
  adminPageSize: number;

  constructor(private usersService: UsersManagerService,
              private memberService: MembersService,
              private tableConfigService: TableConfigService,
              private groupService: GroupsManagerService,
              private store: StoreService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.loading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.adminPageSize = this.tableConfigService.getTablePageSize(this.adminTableId);
    this.route.parent.params.subscribe(params => {
      this.userId = params['userId'];
      if (this.userId === undefined) {
        this.userId = this.store.getPerunPrincipal().userId;
      }

      this.refreshTable();
    });
  }

  refreshTable() {
    this.loading = true;
    this.membersGroups = [];
    this.usersService.getVosWhereUserIsMember(this.userId).subscribe(vos => {
      this.vos = vos;
      for(const vo of this.vos) {
        this.memberService.getMemberByUser(vo.id, this.userId).subscribe( member => {
          this.groupService.getMemberGroups(member.id).subscribe( groups => {
            this.membersGroups = this.membersGroups.concat(groups);
          });
        });
      }
      this.loading = false;
    });
    this.usersService.getGroupsWhereUserIsAdmin(this.userId).subscribe( groups => {
      this.adminsGroups = groups;
    });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
  adminPageChanged(event: PageEvent) {
    this.adminPageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.adminTableId, event.pageSize);
  }
}
