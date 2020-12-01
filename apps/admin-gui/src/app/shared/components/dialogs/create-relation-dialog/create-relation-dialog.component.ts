import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Group, GroupsManagerService } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import {
  TABLE_CREATE_RELATION_GROUP_DIALOG,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';

export interface CreateRelationDialogData {
  theme: string,
  groups: Group[],
  group: Group,
  voId: number,
  reverse: boolean
}

@Component({
  selector: 'app-create-relation-dialog',
  templateUrl: './create-relation-dialog.component.html',
  styleUrls: ['./create-relation-dialog.component.scss']
})
export class CreateRelationDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<CreateRelationDialogComponent>,
              private groupService: GroupsManagerService,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private tableConfigService: TableConfigService,
              private guiAuthResolver: GuiAuthResolver,
              @Inject(MAT_DIALOG_DATA) public data: CreateRelationDialogData
  ) {
    translate.get('DIALOGS.CREATE_RELATION.SUCCESS').subscribe(value => this.successMessage = value);
  }

  successMessage: string;
  selection = new SelectionModel<Group>(false, []);
  groups: Group[];
  theme: string;
  hideColumns = ['vo', 'expiration','menu'];
  filterValue = '';
  loading:boolean;

  tableId = TABLE_CREATE_RELATION_GROUP_DIALOG;
  pageSize: number;

  groupsToDisable: Set<number> = new Set<number>();

  ngOnInit() {
    this.loading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.groupService.getGroupUnions(this.data.group.id, !this.data.reverse).subscribe( unionGroups => {
      unionGroups = unionGroups.concat(this.data.groups);
      this.groupService.getAllGroups(this.data.voId).subscribe(allGroups => {
        const groupIds = unionGroups.map(elem => elem.id);
        this.groups = allGroups.filter(group => !groupIds.includes(group.id) && group.id !== this.data.group.id);
        this.setGroupsToDisable();
        this.loading = false;
      }, () => this.loading = false);
    }, () => this.loading = false);
    this.theme = this.data.theme;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    this.groupService.createGroupUnion(this.data.group.id, this.selection.selected[0].id).subscribe(() =>{
      this.notificator.showSuccess(this.successMessage);
      this.loading = false;
      this.dialogRef.close(true);
    }, () => this.loading = false);
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  private setGroupsToDisable() {
    for (const group of this.groups) {
      if (!this.guiAuthResolver.isAuthorized('createGroupUnion_Group_Group_policy', [this.data.group, group])) {
        this.groupsToDisable.add(group.id);
      }
    }
  }
}
