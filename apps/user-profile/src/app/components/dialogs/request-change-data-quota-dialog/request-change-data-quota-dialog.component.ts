import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { RichResource, RTMessagesManagerService, User, Vo } from '@perun-web-apps/perun/openapi';
import { UserFullNamePipe } from '@perun-web-apps/perun/pipes';
import { NotificatorService} from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';

export interface RequestChangeDataQuotaDialogData {
  vo: Vo;
  resource: RichResource;
  user: User;
  currentQuota: string;
}

@Component({
  selector: 'perun-web-apps-request-change-data-quota-dialog',
  templateUrl: './request-change-data-quota-dialog.component.html',
  styleUrls: ['./request-change-data-quota-dialog.component.scss']
})
export class RequestChangeDataQuotaDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<RequestChangeDataQuotaDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: RequestChangeDataQuotaDialogData,
              private rtMessagesService:RTMessagesManagerService,
              private notificator: NotificatorService,
              private translate: TranslateService
  ) {
    translate.get('DIALOGS.REQUEST_DATA_QUOTA_CHANGE.SUCCESS').subscribe(res => this.successMessage = res);
  }

  resource = '';
  currentQuota = '';
  reasonControl: FormControl;
  newValueControl: FormControl;
  units: string[] = ['MiB', 'GiB', 'TiB'];
  selectedUnit = 'GiB';
  successMessage: string;

  ngOnInit(): void {
    this.resource = this.data.resource.name;
    this.currentQuota = this.data.currentQuota;
    this.reasonControl = new FormControl(null, [Validators.required]);
    this.newValueControl = new FormControl(null, [Validators.required, Validators.pattern('[1-9][0-9]*')])
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    const subject = 'QUOTA: Change request';
    const name = new UserFullNamePipe().transform(this.data.user);
    const text = `QUOTA CHANGE REQUEST↵ ↵ User: ${name} (user ID: ${this.data.user.id})↵ VO: ${this.data.vo.shortName} / ${this.data.vo.name} (vo ID: ${this.data.vo.id})↵ Resource: ${this.data.resource.name} (resource ID: ${this.data.resource.id})↵ Data quota↵ Requested quota: ${this.newValueControl.value}↵ Reason: ${this.reasonControl.value}↵ ↵ ↵ -------------------------------------↵ Sent from Perun GUI`;
    this.rtMessagesService.sentMessageToRTWithVo(this.data.vo.id, subject, text).subscribe(() =>{
      this.notificator.showSuccess(this.successMessage);
      this.dialogRef.close();
    });
  }
}
