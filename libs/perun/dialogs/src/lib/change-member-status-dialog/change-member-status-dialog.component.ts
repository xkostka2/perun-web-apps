import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MembersManagerService, RichMember } from '@perun-web-apps/perun/openapi';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

export interface ChangeMemberStatusDialogData {
  member: RichMember;
}

@Component({
  selector: 'perun-web-apps-change-member-status-dialog',
  templateUrl: './change-member-status-dialog.component.html',
  styleUrls: ['./change-member-status-dialog.component.scss']
})
export class ChangeMemberStatusDialogComponent implements OnInit {

  loading = false;
  theme: string;

  constructor(public dialogRef: MatDialogRef<ChangeMemberStatusDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ChangeMemberStatusDialogData,
              private memberManager: MembersManagerService,
              private notificatorService: NotificatorService,
              private translate: TranslateService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(parentParams => {
      if (parentParams['groupId']) {
        this.theme = 'group-theme';
      } else {
        this.theme = 'vo-theme';
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  submit() {
    this.loading = true;
    this.memberManager.setStatus(this.data.member.id, 'VALID').subscribe( () => {
      this.translate.get('DIALOGS.CHANGE_STATUS.SUCCESS').subscribe( success => {
        this.notificatorService.showSuccess(success);
        this.dialogRef.close(true);
      });
    }, () => this.loading = false);
  }
}
