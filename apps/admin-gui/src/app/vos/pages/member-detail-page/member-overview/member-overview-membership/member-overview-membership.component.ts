import { Component, Input, OnChanges } from '@angular/core';
import {
  Attribute,
  AttributesManagerService,
  RichMember,
  Vo
} from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import {
  ChangeMemberStatusDialogComponent,
  ChangeVoExpirationDialogComponent
} from '@perun-web-apps/perun/dialogs';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ApiRequestConfigurationService, GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-member-overview-membership',
  templateUrl: './member-overview-membership.component.html',
  styleUrls: ['./member-overview-membership.component.css']
})
export class MemberOverviewMembershipComponent implements OnChanges {

  constructor(private dialog: MatDialog,
              public authResolver: GuiAuthResolver,
              private apiRequest: ApiRequestConfigurationService,
              private attributesManager: AttributesManagerService,
              private translate: TranslateService,
              private notificator: NotificatorService) { }

  @Input()
  member: RichMember;

  @Input()
  vo: Vo;

  voMembershipDataSource = new MatTableDataSource<string>();
  voExpiration = '';
  voExpirationAtt: Attribute;
  loading: boolean;
  displayedColumns = ['attName', 'attValue'];

  ngOnChanges(): void {
    this.voMembershipDataSource = new MatTableDataSource<string>(['Status', 'Expiration']);
    this.refreshVoExpiration();
  }

  changeStatus() {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {member: this.member, voId: this.vo.id};
    const oldStatus = this.member.status;

    const dialogRef = this.dialog.open(ChangeMemberStatusDialogComponent, config);
    dialogRef.afterClosed().subscribe( member => {
      if (member) {
        this.member = member;
        if ((oldStatus === 'VALID' && (member.status === 'EXPIRED' || member.status === 'DISABLED')) || member.status === 'VALID') {
          this.changeVoExpiration(true);
        }
      }
    });
  }

  changeVoExpiration(statusChanged: boolean) {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {
      voId: this.vo.id,
      memberId: this.member.id,
      expirationAttr: this.voExpirationAtt,
      status: this.member.status,
      statusChanged: statusChanged,
    }

    const dialogRef = this.dialog.open(ChangeVoExpirationDialogComponent, config);
    dialogRef.afterClosed().subscribe(success => {
      if (success) {
        this.refreshVoExpiration();
      }
    });
  }

  refreshVoExpiration() {
    this.loading = true;
    this.apiRequest.dontHandleErrorForNext();
    this.attributesManager.getMemberAttributeByName(this.member.id, Urns.MEMBER_DEF_EXPIRATION).subscribe(attr => {
      this.voExpirationAtt = attr;
      this.voExpiration = !attr.value ? this.translate.instant('MEMBER_DETAIL.OVERVIEW.NEVER_EXPIRES') : attr.value;
      this.loading = false;
    }, error => {
      if (error.error.name !== 'PrivilegeException') {
        this.notificator.showError(error);
      } else {
        this.voMembershipDataSource = new MatTableDataSource<string>(['Status']);
      }
      this.loading = false
    });
  }

}
