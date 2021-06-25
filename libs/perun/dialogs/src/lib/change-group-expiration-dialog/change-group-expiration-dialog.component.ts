import { Component, Inject, OnInit } from '@angular/core';
import {
  Attribute,
  AttributesManagerService,
  GroupsManagerService,
  MembersManagerService
} from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { formatDate } from '@angular/common';
import { Urns } from '@perun-web-apps/perun/urns';


export interface ChangeGroupExpirationDialogData {
  groupId: number;
  memberId: number;
  expirationAttr: Attribute;
  status: string;
  statusChanged?: boolean;
}

@Component({
  selector: 'perun-web-apps-change-group-expiration-dialog',
  templateUrl: './change-group-expiration-dialog.component.html',
  styleUrls: ['./change-group-expiration-dialog.component.scss']
})
export class ChangeGroupExpirationDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ChangeGroupExpirationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: ChangeGroupExpirationDialogData,
              private attributesManagerService: AttributesManagerService,
              private memberManager: MembersManagerService,
              private groupManager: GroupsManagerService,
              private translate: TranslateService,
              private notificator: NotificatorService) {
    translate.get('DIALOGS.CHANGE_EXPIRATION.SUCCESS').subscribe(res => this.successMessage = res);
  }

  loading = false;

  maxDate: Date;
  minDate: Date;

  expirationAttr: Attribute = null;
  currentExpiration: string;
  newExpiration: string;

  canExtendMembership = false;

  successMessage: string;

  ngOnInit(): void {
    this.loading = true;
    const currentDate = new Date();
    if(this.data.status !== 'VALID') {
      this.maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    } else {
      this.minDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    }

    this.expirationAttr = this.data.expirationAttr;
    this.currentExpiration = this.expirationAttr && this.expirationAttr.value ? this.expirationAttr.value as unknown as string : 'never';
    this.newExpiration = this.currentExpiration;

    if(this.data.statusChanged) {
      if(this.data.status !== 'VALID') {
        this.newExpiration = formatDate(this.maxDate, 'yyyy-MM-dd', 'en');
      } else {
        this.newExpiration = 'never';
      }
    }

    if(this.data.status === 'VALID') {
      this.attributesManagerService.getGroupAttributeByName(this.data.groupId, Urns.GROUP_DEF_EXPIRATION_RULES).subscribe(attr => {
        if (attr.value !== null) {
          this.groupManager.canExtendMembershipInGroup(this.data.memberId, this.data.groupId).subscribe(canExtend => {
            this.canExtendMembership = !!canExtend;
            this.loading = false;
          }, () => this.loading = false);
        } else {
          this.loading = false;
        }
      }, () => this.loading = false);
    } else {
      this.loading = false;
    }
  }

  onExpirationChanged(newExp: string) {
    this.loading = true;
    if (newExp === 'groupRules') {
      this.groupManager.extendMembershipInGroup(this.data.memberId, this.data.groupId).subscribe(() => {
        this.loading = false;
        this.notificator.showSuccess(this.successMessage);
        this.dialogRef.close(true);
      }, () => this.loading = false);
    } else {
      // @ts-ignore
      this.expirationAttr.value = newExp === 'never' ? null : newExp;

      this.attributesManagerService.setMemberGroupAttributes({
        member: this.data.memberId,
        group: this.data.groupId,
        attributes: [this.expirationAttr]
      }).subscribe(() => {
        this.loading = false;
        this.notificator.showSuccess(this.successMessage);
        this.dialogRef.close(true);
      }, () => this.loading = false);
    }
  }
}
