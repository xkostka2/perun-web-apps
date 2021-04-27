import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Group, GroupsManagerService } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import {
  TABLE_ADD_GROUP_TO_REGISTRATION, TableConfigService
} from '@perun-web-apps/config/table-config';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { PageEvent } from '@angular/material/paginator';

export interface AddGroupToRegistrationDialogData {
  theme: string;
  voId: number;
  assignedGroups: number[];
}

@Component({
  selector: 'app-add-group-to-registration',
  templateUrl: './add-group-to-registration.component.html',
  styleUrls: ['./add-group-to-registration.component.css']
})
export class AddGroupToRegistrationComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AddGroupToRegistrationComponent>,
              @Inject(MAT_DIALOG_DATA) public data: AddGroupToRegistrationDialogData,
              private groupService: GroupsManagerService,
              private tableConfigService: TableConfigService) { }

  loading = false;
  theme: string;
  unAssignedGroups: Group[];
  selection = new SelectionModel<Group>(true, []);
  filterValue = '';

  tableId = TABLE_ADD_GROUP_TO_REGISTRATION;
  pageSize: number;

  ngOnInit(): void {
    this.loading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.theme = this.data.theme;
    this.groupService.getAllGroups(this.data.voId).subscribe(groups => {
      this.unAssignedGroups = groups.filter(group => this.data.assignedGroups.indexOf(group.id) <= -1);
      this.loading = false;
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onAdd() {
    this.loading = true;
    this.groupService.addGroupsToAutoRegistration(this.selection.selected.map(group => group.id)).subscribe(() => {
      this.dialogRef.close(true);
    }, () => this.loading = false);
  }
}
