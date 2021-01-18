import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateGroupDialogComponent } from '../../../../shared/components/dialogs/create-group-dialog/create-group-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { DeleteGroupDialogComponent } from '../../../../shared/components/dialogs/delete-group-dialog/delete-group-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { Group, GroupsManagerService } from '@perun-web-apps/perun/openapi';
import { Urns } from '@perun-web-apps/perun/urns';
import { TABLE_GROUP_SUBGROUPS, TableConfigService } from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { GroupFlatNode } from '@perun-web-apps/perun/models';
import { MoveGroupDialogComponent } from '../../../../shared/components/dialogs/move-group-dialog/move-group-dialog.component';
import { GuiAuthResolver, InitAuthService } from '@perun-web-apps/perun/services';
import { GroupsTreeComponent } from '@perun-web-apps/perun/components';
import { GroupsListComponent } from '@perun-web-apps/perun/components';

@Component({
  selector: 'app-group-subgroups',
  templateUrl: './group-subgroups.component.html',
  styleUrls: ['./group-subgroups.component.scss']
})
export class GroupSubgroupsComponent implements OnInit {

  static id = 'GroupSubgroupsComponent';

  // used for router animation
  @HostBinding('class.router-component') true;

  constructor(
    private dialog: MatDialog,
    private groupService: GroupsManagerService,
    private tableConfigService: TableConfigService,
    private route: ActivatedRoute,
    private guiAuthResolver: GuiAuthResolver,
    private initAuthService: InitAuthService
  ) {
  }
  group: Group;
  groups: Group[] = [];
  selected = new SelectionModel<Group>(true, []);
  showGroupList = false;
  loading: boolean;
  filtering = false;
  tableId = TABLE_GROUP_SUBGROUPS;
  pageSize: number;
  filterValue = '';

  createAuth: boolean;
  deleteAuth: boolean;
  routeAuth: boolean;
  hideColumns: string[] = [];

  @ViewChild('tree', {})
  tree: GroupsTreeComponent;

  @ViewChild('list', {})
  list: GroupsListComponent;

  @ViewChild('toggle', {static: true})
  toggle: MatSlideToggle;


  onCreateGroup() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {parentGroup: this.group, theme: 'group-theme'};

    const dialogRef = this.dialog.open(CreateGroupDialogComponent, config);

    dialogRef.afterClosed().subscribe(groupCreated => {
      if(groupCreated) {
        this.loading = true;
        this.refreshTable();
      }
    });
  }

  ngOnInit() {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    if (localStorage.getItem('preferedValue') === 'list') {
      this.toggle.toggle();
      this.selected.clear();
      this.showGroupList = true;
    }
    this.toggle.change.subscribe(() => {
      const value = this.toggle.checked ? 'list' : 'tree';
      localStorage.setItem('preferedValue', value);
    });

    this.route.parent.params.subscribe(parentParams => {
      const groupId = parentParams['groupId'];
      this.groupService.getGroupById(groupId).subscribe(group => {
        // @ts-ignore
        this.group = group;

        this.refreshTable();
      });
    });
  }

  setAuthRights() {
    this.createAuth = this.guiAuthResolver.isAuthorized('createGroup_Group_Group_policy', [this.group]);
    this.deleteAuth = this.guiAuthResolver.isAuthorized('deleteGroups_List<Group>_boolean_policy', [this.group]);
    if (this.groups.length !== 0) {
      this.routeAuth = this.guiAuthResolver.isAuthorized('getGroupById_int_policy', [this.groups[0]]);
    }
    this.hideColumns = this.deleteAuth ? ['vo', 'expiration'] : ['select', 'vo', 'expiration']
  }

  deleteGroup() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {voId: this.group.id, groups: this.selected.selected, theme: 'group-theme'};

    const dialogRef = this.dialog.open(DeleteGroupDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  refreshTable() {
    this.loading = true;
    this.groupService.getAllRichSubGroupsWithGroupAttributesByNames(this.group.id,
      [
        Urns.GROUP_DEF_MAIL_FOOTER,
        Urns.GROUP_SYNC_ENABLED,
        Urns.GROUP_LAST_SYNC_STATE,
        Urns.GROUP_LAST_SYNC_TIMESTAMP,
        Urns.GROUP_STRUCTURE_SYNC_ENABLED,
        Urns.GROUP_LAST_STRUCTURE_SYNC_STATE,
        Urns.GROUP_LAST_STRUCTURE_SYNC_TIMESTAMP
      ]).subscribe(groups => {
      this.groups = groups;
      this.selected.clear();
      this.setAuthRights();
      this.loading = false;
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
    this.filtering = filterValue !== '';
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  onMoveGroup(group: GroupFlatNode | Group) {
    const config = getDefaultDialogConfig();
    config.width = '550px';
    config.data = {
      group: group,
      theme: 'group-theme'
    };

    const dialogRef = this.dialog.open(MoveGroupDialogComponent, config);
    dialogRef.afterClosed().subscribe(groupMoved => {
      if (groupMoved) {
        this.refreshTable();
      }
    });
  }
}
