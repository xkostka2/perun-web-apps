import { Component, Inject, OnInit } from '@angular/core';
import {
  Attribute,
  AttributesManagerService,
  GroupsManagerService,
  MembersManagerService, Sponsor
} from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificatorService } from '@perun-web-apps/perun/services';

export interface ChangeSponsorshipExpirationDialogData {
  memberId: number;
  sponsor: Sponsor;
}


@Component({
  selector: 'perun-web-apps-change-sponsorship-expiration-dialog',
  templateUrl: './change-sponsorship-expiration-dialog.component.html',
  styleUrls: ['./change-sponsorship-expiration-dialog.component.scss']
})
export class ChangeSponsorshipExpirationDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ChangeSponsorshipExpirationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: ChangeSponsorshipExpirationDialogData,
              private attributesManagerService: AttributesManagerService,
              private memberManager: MembersManagerService,
              private groupManager: GroupsManagerService,
              private translate: TranslateService,
              private notificator: NotificatorService) {
    translate.get('DIALOGS.CHANGE_EXPIRATION.SUCCESS').subscribe(res => this.successMessage = res);
  }

  loading = false;

  minDate: Date;

  currentExpiration: string;
  newExpiration: string;
  successMessage: string;

  ngOnInit(): void {
    this.loading = true;
    this.currentExpiration = this.data.sponsor.validityTo ? this.data.sponsor.validityTo : 'never';
    this.newExpiration = this.currentExpiration;
    const currentDate = new Date();
    this.minDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    this.loading = false;
  }

  onExpirationChanged(newExp: string) {
    this.loading = true;
    const expiration = newExp === 'never' ? null : newExp;

    this.memberManager.updateSponsorshipValidity(this.data.memberId, this.data.sponsor.user.id, expiration).subscribe(() => {
      this.loading = false;
      this.notificator.showSuccess(this.successMessage);
      this.dialogRef.close(true);
    }, () => this.loading = false);
  }
}
