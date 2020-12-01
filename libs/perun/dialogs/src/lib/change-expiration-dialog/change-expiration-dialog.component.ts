import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { formatDate } from '@angular/common';
import { Urns } from '@perun-web-apps/perun/urns';

export interface ChangeExpirationDialogData {
  groupId?: number;
  memberId: number;
  expirationAttr: Attribute;
  mode: 'group' | 'vo';
}

@Component({
  selector: 'perun-web-apps-change-expiration-dialog',
  templateUrl: './change-expiration-dialog.component.html',
  styleUrls: ['./change-expiration-dialog.component.scss']
})
export class ChangeExpirationDialogComponent implements OnInit {

  currentExpiration: string;
  newExpiration: string;
  loading: boolean;
  expirationControl: FormControl;
  successMessage: string;
  expirationAttr: Attribute;
  minDate: Date;
  mode = 'vo'

  constructor(private dialogRef: MatDialogRef<ChangeExpirationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: ChangeExpirationDialogData,
              private attributesManagerService: AttributesManagerService,
              private translate: TranslateService,
              private notificator: NotificatorService) {
    translate.get('DIALOGS.CHANGE_EXPIRATION.SUCCESS').subscribe(res => this.successMessage = res);
  }

  ngOnInit(): void {
    this.mode = this.data.mode;
    const currentDate = new Date();
    this.minDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    this.expirationAttr = this.data.expirationAttr;
    this.currentExpiration = this.expirationAttr && this.expirationAttr.value ? this.expirationAttr.value as unknown as string : 'never';
    this.expirationControl = new FormControl(this.currentExpiration);
    this.newExpiration = this.currentExpiration;
    if (this.expirationControl.value === 'never') {
      this.expirationControl.setValue(null);
    }
  }

  onChange() {
    this.loading = true;
    if (!this.expirationAttr) {
      this.attributesManagerService.getAttributeDefinitionByName(this.mode === 'vo' ? Urns.MEMBER_DEF_EXPIRATION : Urns.MEMBER_DEF_GROUP_EXPIRATION).subscribe(att => {
        this.expirationAttr = att;
        this.changeExpiration();
      });
    } else {
      this.changeExpiration();
    }

  }

  onCancel() {
    this.dialogRef.close(false);
  }

  setExpiration() {
    this.newExpiration = formatDate(this.expirationControl.value, 'yyyy-MM-dd', 'en');
    this.expirationControl.setValue(formatDate(this.expirationControl.value, 'yyyy-MM-dd', 'en'));
  }

  // setExpiration(date: Date) {
  //   this.newExpiration = formatDate(date,'yyyy-MM-dd','en-GB');
  // }

  private changeExpiration() {
    // @ts-ignore
    this.expirationAttr.value = this.newExpiration === 'never' ? null : this.newExpiration;
    if (this.mode === 'group') {
      this.attributesManagerService.setMemberGroupAttributes({
        member: this.data.memberId,
        group: this.data.groupId,
        attributes: [this.expirationAttr]
      }).subscribe(() => {
        this.loading = false;
        this.notificator.showSuccess(this.successMessage);
        this.dialogRef.close(true);
      });
    } else {
      this.attributesManagerService.setMemberAttribute({
        member: this.data.memberId,
        attribute: this.expirationAttr
      }).subscribe(() => {
        this.loading = false;
        this.notificator.showSuccess(this.successMessage);
        this.dialogRef.close(true);
      });

    }

  }

}
