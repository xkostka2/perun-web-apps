import { Component, OnInit, ViewChild } from '@angular/core';
import { Group, GroupsManagerService } from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { TABLE_APPLICATION_FORM_ITEM_MANAGE_GROUP, TableConfigService } from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';
import { AddGroupToRegistrationComponent } from '../../../shared/components/dialogs/add-group-to-registration/add-group-to-registration.component';
import { UniversalRemoveItemsDialogComponent } from '@perun-web-apps/perun/dialogs';
import { GroupsListComponent } from '@perun-web-apps/perun/components';

@Component({
  selector: 'app-application-form-manage-groups',
  templateUrl: './application-form-manage-groups.component.html',
  styleUrls: ['./application-form-manage-groups.component.css']
})
export class ApplicationFormManageGroupsComponent implements OnInit {

  constructor(private tableConfigService: TableConfigService,
              public groupsService: GroupsManagerService,
              public authResolver: GuiAuthResolver,
              private dialog: MatDialog,
              protected route: ActivatedRoute) { }

  loading: boolean;
  voId: number;
  groups: Group[] = [];
  selected = new SelectionModel<Group>(true, []);
  pageSize: number;
  tableId = TABLE_APPLICATION_FORM_ITEM_MANAGE_GROUP;
  filterValue = '';
  addAuth: boolean;

  @ViewChild('list', {})
  list: GroupsListComponent;

  ngOnInit(): void {
    this.loading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.route.parent.parent.params.subscribe(params => {
      this.voId = params['voId'];
      this.loadGroups();
    });
  }

  loadGroups() {
    this.loading = true;
    this.groupsService.getGroupsToAutoRegistration(this.voId).subscribe(groups => {
      this.groups = groups;
      this.selected.clear();
      this.setAuthRights();
      this.loading = false;
    }, () => this.loading = false);
  }

  onAddGroup() {
    const config = getDefaultDialogConfig();
    config.width = '900px';
    config.data = {voId: this.voId,
      assignedGroups: this.groups.map(group => group.id),
      theme: 'vo-theme'};

    const dialogRef = this.dialog.open(AddGroupToRegistrationComponent, config);

    dialogRef.afterClosed().subscribe(groupAssigned => {
      if (groupAssigned) {
        this.loadGroups();
      }
    });
  }

  removeGroup() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {items: this.selected.selected.map(group => group.name),
      title: 'VO_DETAIL.SETTINGS.APPLICATION_FORM.MANAGE_GROUPS_PAGE.REMOVE_GROUP_DIALOG_TITLE',
      description: 'VO_DETAIL.SETTINGS.APPLICATION_FORM.MANAGE_GROUPS_PAGE.REMOVE_GROUP_DIALOG_DESCRIPTION',
      theme: 'vo-theme'};

    const dialogRef = this.dialog.open(UniversalRemoveItemsDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.groupsService.deleteGroupsFromAutoRegistration(this.selected.selected.map(group => group.id)).subscribe(() => {
          this.loadGroups();
        });
      }
    });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  private setAuthRights() {
    const vo = {id: this.voId, beanName: 'Vo'};
    this.addAuth = this.authResolver.isAuthorized('addGroupsToAutoRegistration_List<Group>_policy', [vo]);
  }
}
