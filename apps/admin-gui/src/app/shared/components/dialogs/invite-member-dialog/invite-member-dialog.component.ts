import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { RegistrarManagerService } from '@perun-web-apps/perun/openapi';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';


export interface InviteMemberDialogData {
  theme: string;
  voId: number;
  groupId: number;
}

@Component({
  selector: 'app-invite-member-dialog',
  templateUrl: './invite-member-dialog.component.html',
  styleUrls: ['./invite-member-dialog.component.scss']
})
export class InviteMemberDialogComponent implements OnInit {

  emailForm = new FormControl('', [Validators.required, Validators.email]);
  languages = ['en'];
  currentLanguage = 'en'
  name = new FormControl('', Validators.required);
  loading = false;
  theme: string;

  constructor(public dialogRef: MatDialogRef<InviteMemberDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: InviteMemberDialogData,
              private registrarManager: RegistrarManagerService,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private store: StoreService) { }

  ngOnInit() {
    this.languages = this.store.get('supportedLanguages')
    this.theme = this.data.theme;
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    if (this.emailForm.invalid || this.name.invalid) {
      return;
    }
    if(this.data.voId && !this.data.groupId){
      this.loading = true;
      this.registrarManager.sendInvitation(this.emailForm.value, this.currentLanguage, this.data.voId).subscribe(() => {
        this.translate.get('DIALOGS.INVITE_MEMBER.SUCCESS').subscribe(successMessage => {
          this.notificator.showSuccess(successMessage);
          this.dialogRef.close(true);
        });
      }, () => this.loading = false);
    } else {
      this.loading = true;
      this.registrarManager.sendInvitationForGroup(this.emailForm.value, this.currentLanguage, this.data.voId, this.data.groupId).subscribe(() => {
        this.translate.get('DIALOGS.INVITE_MEMBER.SUCCESS').subscribe(successMessage => {
          this.notificator.showSuccess(successMessage);
          this.dialogRef.close(true);
        });
      }, () => this.loading = false);
    }
  }

}
