import { Component, Input, OnChanges } from '@angular/core';
import {
  Attribute,
  GroupsManagerService,
  Member,
  RichGroup,
  RichMember,
  Vo
} from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig, getRecentlyVisitedIds } from '@perun-web-apps/perun/utils';
import { Urns } from '@perun-web-apps/perun/urns';
import { MatTableDataSource } from '@angular/material/table';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { ChangeExpirationDialogComponent, ChangeMemberStatusDialogComponent } from '@perun-web-apps/perun/dialogs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-member-overview-groups',
  templateUrl: './member-overview-groups.component.html',
  styleUrls: ['./member-overview-groups.component.css']
})
export class MemberOverviewGroupsComponent implements OnChanges {

  constructor(private groupsManager: GroupsManagerService,
              public authResolver: GuiAuthResolver,
              private translate: TranslateService,
              private dialog: MatDialog,) { }

  @Input()
  vo: Vo;

  @Input()
  member: RichMember;

  loading: boolean;
  initLoading: boolean;
  groups: RichGroup[];
  recentIds: number[];
  filterValue: string;
  selectedGroup: RichGroup;
  selectedMember: Member;

  groupMembershipDataSource = new MatTableDataSource<string>();
  expiration = '';
  expirationAtt: Attribute;
  displayedColumns = ['attName', 'attValue'];

  ngOnChanges(): void {
    this.loading = true;
    this.initLoading = true;
    this.groupMembershipDataSource = new MatTableDataSource<string>(['Status', 'Expiration']);
    this.groupsManager.getMemberRichGroupsWithAttributesByNames(this.member.id, [Urns.MEMBER_DEF_GROUP_EXPIRATION]).subscribe(groups => {
      this.groups = groups;
      this.findRecentGroup();
    });
  }

  findRecentGroup() {
    this.recentIds = getRecentlyVisitedIds('groups');
    this.groupIsSelected(this.groups.find(group => group.id === this.recentIds[0]));
    this.initLoading = false;
  }


  groupIsSelected(event: RichGroup) {
    this.loading = true;
    this.selectedGroup = event;
    this.expirationAtt = this.selectedGroup.attributes.find(att => att.baseFriendlyName === 'groupMembershipExpiration');
    if (!!this.expirationAtt) {
      this.groupMembershipDataSource = new MatTableDataSource<string>(['Status', 'Expiration']);
      this.expiration = !this.expirationAtt.value ? this.translate.instant('MEMBER_DETAIL.OVERVIEW.NEVER_EXPIRES') : this.expirationAtt.value;
    } else {
      this.groupMembershipDataSource = new MatTableDataSource<string>(['Status']);
    }
    this.groupsManager.getGroupMemberById(this.selectedGroup.id, this.member.id).subscribe(member => {
      this.selectedMember = member;
      this.loading = false;
    });
  }

  changeExpiration() {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {
      memberId: this.member.id,
      groupId: this.selectedGroup.id,
      expirationAttr: this.expirationAtt,
      mode: 'group'
    }

    const dialogRef = this.dialog.open(ChangeExpirationDialogComponent, config);
    dialogRef.afterClosed().subscribe(success => {
      if (success) {
        this.groupIsSelected(this.selectedGroup);
      }
    });
  }

  changeStatus() {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {member: this.member,
      voId: this.vo.id,
      groupId: this.selectedGroup.id
    };
    const oldStatus = this.member.status;

    const dialogRef = this.dialog.open(ChangeMemberStatusDialogComponent, config);
    dialogRef.afterClosed().subscribe( member => {
      if (member) {
        this.selectedMember = member;
        if ((oldStatus === 'VALID' && (member.status === 'EXPIRED' || member.status === 'DISABLED')) || member.status === 'VALID') {
          this.changeExpiration();
        }
      }
    });
  }
}
