import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Group,
  GroupsManagerService,
  Member,
  MembersManagerService,
  Vo
} from '@perun-web-apps/perun/openapi';
import { PageEvent } from '@angular/material/paginator';
import { TABLE_MEMBER_DETAIL_GROUPS, TableConfigService } from '@perun-web-apps/config/table-config';
import { SelectionModel } from '@angular/cdk/collections';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { AddMemberGroupDialogComponent } from '../../../../shared/components/dialogs/add-member-group-dialog/add-member-group-dialog.component';
import { RemoveMemberGroupDialogComponent } from '../../../../shared/components/dialogs/remove-member-group-dialog/remove-member-group-dialog.component';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { GroupsListComponent } from '@perun-web-apps/perun/components';

@Component({
  selector: 'app-member-groups',
  templateUrl: './member-groups.component.html',
  styleUrls: ['./member-groups.component.scss']
})
export class MemberGroupsComponent implements OnInit {

  static id = 'MemberGroupsComponent';

  // used for router animation
  @HostBinding('class.router-component') true;

  @ViewChild('list', {})
  list: GroupsListComponent;

  constructor(
    private groupsService: GroupsManagerService,
    private tableConfigService: TableConfigService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private authResolver: GuiAuthResolver,
    private memberService: MembersManagerService,
  ) { }

  groups: Group[];
  memberId: number;
  member: Member;
  allGroups: Group[];

  loading: boolean;
  filterValue = '';

  tableId = TABLE_MEMBER_DETAIL_GROUPS;
  pageSize: number;
  selection = new SelectionModel<Group>(true, []);

  addAuth: boolean;
  removeAuth: boolean;
  routeAuth: boolean;

  ngOnInit() {
    this.loading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.route.parent.params.subscribe(parentParams => {
      this.memberId = parentParams['memberId'];
      this.memberService.getMemberById(this.memberId).subscribe(member => {
        this.member = member;
        this.groupsService.getAllGroups(this.member.voId).subscribe(allGroups => {
          this.allGroups = allGroups;
          this.refreshTable();
        });
      });
    });
  }

  refreshTable() {
    this.loading = true;
    this.groupsService.getMemberRichGroupsWithAttributesByNames(this.memberId, ['urn:perun:member_group:attribute-def:def:groupMembershipExpiration']).subscribe(groups => {
      this.selection.clear();
      this.filterValue = '';
      this.groups = groups;
      this.setAuthRights();
      this.loading = false;
    }, () => this.loading = false);
  }

  setAuthRights(){
    const vo: Vo = {
      id:  this.member.voId,
      beanName: 'Vo'
    };

    this.addAuth = this.allGroups.reduce((acc, grp) =>
      acc || this.authResolver.isAuthorized('addMember_Group_Member_policy', [grp]), false);

    if(this.groups.length !== 0){
      this.routeAuth = this.authResolver.isAuthorized('getGroupById_int_policy', [vo, this.groups[0]]);
    }
  }

  addGroup(){
    const config = getDefaultDialogConfig();
    config.width = "850px";
    config.data = {
      memberId: this.memberId,
      membersGroups: new Set<number>(this.groups.map(grp => grp.id)),
      theme: "member-theme"
    };

    const dialogRef = this.dialog.open(AddMemberGroupDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  removeGroup(){
    const config = getDefaultDialogConfig();
    config.width = "650px";
    config.data = {
      memberId: this.memberId,
      groups: this.selection.selected,
      theme: "member-theme"
    };

    const dialogRef = this.dialog.open(RemoveMemberGroupDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
