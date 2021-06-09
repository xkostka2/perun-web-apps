import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AssignedGroup,
  Group,
  Resource,
  ResourcesManagerService,
  VosManagerService
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { RemoveGroupFromResourceDialogComponent } from '../../../../shared/components/dialogs/remove-group-from-resource-dialog/remove-group-from-resource-dialog.component';
import { AssignGroupToResourceDialogComponent } from '../../../../shared/components/dialogs/assign-group-to-resource-dialog/assign-group-to-resource-dialog.component';
import {
  TABLE_RESOURCE_ALLOWED_GROUPS,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { GroupWithStatus } from '@perun-web-apps/perun/components';

@Component({
  selector: 'app-perun-web-apps-resource-groups',
  templateUrl: './resource-groups.component.html',
  styleUrls: ['./resource-groups.component.scss']
})
export class ResourceGroupsComponent implements OnInit {

  @ViewChild('checkbox', { static: true })
  checkbox: MatCheckbox;

  resourceId: number;
  assignedGroups: GroupWithStatus[] = [];
  selected = new SelectionModel<GroupWithStatus>(true, []);
  loading: boolean;
  filteredValue = '';

  tableId = TABLE_RESOURCE_ALLOWED_GROUPS;
  pageSize: number;
  resource: Resource;
  loadingResource: boolean;

  constructor(private route: ActivatedRoute,
              private resourcesManager: ResourcesManagerService,
              private vosManagerService: VosManagerService,
              private tableConfigService: TableConfigService,
              private dialog: MatDialog,
              public guiAuthResolver: GuiAuthResolver) {
  }

  ngOnInit() {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.loading = true;
    this.route.parent.params.subscribe(parentParams => {
      this.resourceId = parentParams['resourceId'];
      this.getDataForAuthorization();
      this.loadAllGroups();
    });
  }

  loadAllGroups() {
    this.loading = true;
    this.resourcesManager.getGroupAssignments(this.resourceId).subscribe(assignedGroups => {
      this.assignedGroups = <GroupWithStatus[]>assignedGroups.map(g => {
        const gws: GroupWithStatus = g.enrichedGroup.group;
        gws.status = g.status;
        return gws;
      });
      this.selected.clear();
      this.loading = false;
    });
  }

  addGroup() {
    const config = getDefaultDialogConfig();
    config.width = '800px';
    config.data = { theme: 'resource-theme', resource: this.resource };

    const dialogRef = this.dialog.open(AssignGroupToResourceDialogComponent, config);
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.loadAllGroups();
      }
    });
  }

  removeGroups() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {resourceId: this.resourceId, groups: this.selected.selected, theme: 'resource-theme'};

    const dialogRef = this.dialog.open(RemoveGroupFromResourceDialogComponent, config);
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.loadAllGroups();
      }
    });
  }

  canRemoveGroups() {
    let canRemove = true;
    this.selected.selected.forEach(group => {
      if(!this.guiAuthResolver.isAuthorized('removeGroupsFromResource_List<Group>_Resource_policy',[this.resource, group])){
        canRemove = false;
      }
    });
    return canRemove;
  }

  applyFilter(filterValue: string) {
    this.filteredValue = filterValue;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  private getDataForAuthorization() {
    this.loadingResource = true;
    this.resourcesManager.getResourceById(this.resourceId).subscribe(resource => {
      this.resource = resource;
      this.loadingResource = false;
    });
  }
}
