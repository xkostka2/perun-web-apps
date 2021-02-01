import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {NotificatorService} from '@perun-web-apps/perun/services';
import { MailType, RegistrarManagerService } from '@perun-web-apps/perun/openapi';

export interface DialogData {
  applicationId: number;
  theme: string;
}

@Component({
  selector: 'app-application-re-send-notification-dialog',
  templateUrl: './application-re-send-notification-dialog.component.html',
  styleUrls: ['./application-re-send-notification-dialog.component.scss']
})
export class ApplicationReSendNotificationDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ApplicationReSendNotificationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              private translate: TranslateService,
              private notificator: NotificatorService,
              private registrarManager: RegistrarManagerService) { }

  mailType: MailType = 'APP_CREATED_USER';
  reason = '';
  loading = false;
  theme: string;

  ngOnInit() {
    this.theme = this.data.theme;
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.loading = true;
    if (this.mailType === 'APP_REJECTED_USER') {
      this.registrarManager.sendMessage(
        {appId: this.data.applicationId, mailType: this.mailType, reason: this.reason}).subscribe( () => {
        this.translate.get('DIALOGS.RE_SEND_NOTIFICATION.SUCCESS').subscribe(successMessage => {
          this.notificator.showSuccess(successMessage);
          this.dialogRef.close();
        });
      }, () => this.loading = false);
    } else {
      this.registrarManager.sendMessage(
        {appId: this.data.applicationId, mailType: this.mailType}).subscribe( () => {
        this.translate.get('DIALOGS.RE_SEND_NOTIFICATION.SUCCESS').subscribe(successMessage => {
          this.notificator.showSuccess(successMessage);
          this.dialogRef.close();
        });
      }, () => this.loading = false);
    }
  }
}
