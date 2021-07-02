import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  GroupsManagerService,
  MembersManagerService,
  RichMember
} from '@perun-web-apps/perun/openapi';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { MatSelectChange } from '@angular/material/select';

export interface ChangeMemberStatusDialogData {
  member: RichMember;
  voId?: number;
  groupId?: number;
}

@Component({
  selector: 'perun-web-apps-change-member-status-dialog',
  templateUrl: './change-member-status-dialog.component.html',
  styleUrls: ['./change-member-status-dialog.component.scss']
})
export class ChangeMemberStatusDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ChangeMemberStatusDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ChangeMemberStatusDialogData,
              private memberManager: MembersManagerService,
              private groupsManager: GroupsManagerService,
              private notificatorService: NotificatorService,
              private translate: TranslateService) { }

  loading = false;
  theme: string;

  allStatuses: string[] = ['VALID', 'INVALID', 'EXPIRED', 'DISABLED'];
  actualStatus: string;
  selectedStatus: string;
  description: string;
  changeMessage: string;
  submitButtonText: string;
  changeStatusButton: string;
  changeStatusWithExpButton: string;

  ngOnInit() {
    if (this.data.groupId) {
      this.theme = 'group-theme';
      this.actualStatus = this.data.member.groupStatus;
    } else {
      this.theme = 'vo-theme';
      this.actualStatus = this.data.member.status;
    }

    if (this.data.groupId) {
      this.allStatuses = this.actualStatus === 'VALID' ? ['EXPIRED'] : ['VALID'];
    } else {
      if (this.actualStatus === 'INVALID') {
        this.allStatuses = ['VALID', 'EXPIRED'];
      } else {
        this.allStatuses = this.allStatuses.filter(status => status !== this.actualStatus);
      }
    }

    this.changeStatusButton = this.translate.instant('DIALOGS.CHANGE_STATUS.CHANGE_STATUS');
    this.changeStatusWithExpButton = this.translate.instant('DIALOGS.CHANGE_STATUS.CHANGE_STATUS_WITH_EXPIRATION');
    this.submitButtonText = this.changeStatusButton;

    switch (this.actualStatus) {
      case "VALID":
        this.description = this.translate.instant('DIALOGS.CHANGE_STATUS.VALID_DESCRIPTION');
        break;
      case "INVALID":
        this.description = this.translate.instant('DIALOGS.CHANGE_STATUS.INVALID_DESCRIPTION');
        break;
      case "EXPIRED":
        this.description = this.translate.instant('DIALOGS.CHANGE_STATUS.EXPIRED_DESCRIPTION');
        break;
      case "DISABLED":
        this.description = this.translate.instant('DIALOGS.CHANGE_STATUS.DISABLED_DESCRIPTION');
        break;
      default:
        this.description = "";
    }

  }

  changeStatus(event: MatSelectChange) {
    this.selectedStatus = event.value;
    if ((this.actualStatus === 'VALID' && this.selectedStatus === 'EXPIRED') || (this.actualStatus === 'VALID' && this.selectedStatus === 'DISABLED') || this.selectedStatus === 'VALID') {
      this.submitButtonText = this.changeStatusWithExpButton;
    } else {
      this.submitButtonText = this.changeStatusButton;
    }
    this.changeStatusMessage(this.actualStatus, this.selectedStatus);
  }

  changeStatusMessage(actualStatus: string, newStatus: string) {
    if (actualStatus === 'VALID') {
      switch (newStatus) {
        case "INVALID":
          this.changeMessage = this.translate.instant('DIALOGS.CHANGE_STATUS.CHANGE_VALID_TO_INVALID');
          break;
        case "EXPIRED":
          this.changeMessage = this.translate.instant('DIALOGS.CHANGE_STATUS.CHANGE_VALID_TO_EXPIRED');
          break;
        case "DISABLED":
          this.changeMessage = this.translate.instant('DIALOGS.CHANGE_STATUS.CHANGE_VALID_TO_DISABLED');
          break;
        default:
          this.changeMessage = "";
      }
    } else {
      switch (newStatus) {
        case "VALID":
          this.changeMessage = this.translate.instant('DIALOGS.CHANGE_STATUS.CHANGE_NO_VALID_TO_VALID');
          break;
        case "INVALID":
          this.changeMessage = this.translate.instant('DIALOGS.CHANGE_STATUS.CHANGE_NO_VALID_TO_INVALID');
          break;
        case "EXPIRED":
          this.changeMessage = this.translate.instant('DIALOGS.CHANGE_STATUS.CHANGE_NO_VALID_TO_EXPIRED');
          break;
        case "DISABLED":
          this.changeMessage = this.translate.instant('DIALOGS.CHANGE_STATUS.CHANGE_NO_VALID_TO_DISABLED');
          break;
        default:
          this.changeMessage = "";
      }
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  submit() {
    this.loading = true;
    if (!this.data.groupId) {
      this.memberManager.setStatus(this.data.member.id, this.selectedStatus).subscribe( member => {
        this.translate.get('DIALOGS.CHANGE_STATUS.SUCCESS').subscribe( success => {
          this.notificatorService.showSuccess(success);
          this.dialogRef.close(member);
        });
      }, () => this.loading = false);
    } else {
      this.groupsManager.setGroupsMemberStatus(this.data.member.id, this.data.groupId, this.selectedStatus).subscribe(member => {
        this.translate.get('DIALOGS.CHANGE_STATUS.SUCCESS').subscribe( success => {
          this.notificatorService.showSuccess(success);
          this.dialogRef.close(member);
        });
      }, () => this.loading = false);
    }
  }
}
