import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { Group, GroupsManagerService } from '@perun-web-apps/perun/openapi';
import { FormControl, Validators } from '@angular/forms';

export interface CreateGroupDialogData {
  parentGroup: Group;
  voId: number;
  theme: string;
}

@Component({
  selector: 'app-create-group-dialog',
  templateUrl: './create-group-dialog.component.html',
  styleUrls: ['./create-group-dialog.component.scss']
})
export class CreateGroupDialogComponent implements OnInit{

  loading: boolean;
  theme: string;

  isNotSubGroup: boolean;
  asSubgroup = false;
  invalidNameMessage = this.store.get('groupNameErrorMessage');
  secondaryRegex = this.store.get('groupNameSecondaryRegex');
  nameControl: FormControl;
  descriptionControl: FormControl;
  selectedParent: Group;
  voGroups: Group[] = [];

  constructor(
    private dialogRef: MatDialogRef<CreateGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: CreateGroupDialogData,
    private groupService: GroupsManagerService,
    private translate: TranslateService,
    private notificator: NotificatorService,
    private store: StoreService
  ) {
    this.isNotSubGroup = (this.data.parentGroup === null);
    if (this.isNotSubGroup) {
      translate.get('DIALOGS.CREATE_GROUP.TITLE').subscribe(value => this.title = value);
    } else {
      translate.get('DIALOGS.CREATE_GROUP.TITLE_SUB_GROUP').subscribe(value => {
        this.title = value + this.data.parentGroup.name;
      });
    }
    translate.get('DIALOGS.CREATE_GROUP.SUCCESS').subscribe(value => this.successMessage = value);
    translate.get('DIALOGS.CREATE_GROUP.SUCCESS_SUBGROUP').subscribe(value => this.successSubGroupMessage = value);
  }

  title: string;

  successMessage: string;
  successSubGroupMessage: string;
  nameFunction = (group: Group) => group.name;

  ngOnInit() {
    this.theme = this.data.theme;
    this.invalidNameMessage = this.invalidNameMessage && this.secondaryRegex ? this.invalidNameMessage : '';
    this.nameControl = new FormControl('', [Validators.required, Validators.pattern(this.secondaryRegex ? this.secondaryRegex : ''), Validators.pattern('.*[\\S]+.*')]);
    this.descriptionControl = new FormControl('', [Validators.required, Validators.maxLength(129)]);
    this.selectedParent = null;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.loading = true;
    if (this.isNotSubGroup && !this.asSubgroup) {
      this.groupService.createGroupWithVoNameDescription(this.data.voId, this.nameControl.value, this.descriptionControl.value).subscribe(() => {
        this.notificator.showSuccess(this.successMessage);
        this.loading = false;
        this.dialogRef.close(true);
      }, () => this.loading = false);
    } else {
      const parentGroupId = this.asSubgroup ? this.selectedParent.id : this.data.parentGroup.id;
      this.groupService.createGroupWithParentGroupNameDescription(parentGroupId, this.nameControl.value, this.descriptionControl.value).subscribe(() => {
        this.notificator.showSuccess(this.successSubGroupMessage);
        this.loading = false;
        this.dialogRef.close(true);
      }, () => this.loading = false);
    }
  }

  loadVoGroups(){
    this.groupService.getAllGroups(this.data.voId).subscribe(groups => {
      this.voGroups = groups.filter(grp => grp.name !== 'members');
    });
  }
}


