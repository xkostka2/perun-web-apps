import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Group, GroupsManagerService, Member, MembersManagerService, RichGroup } from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Urns } from '@perun-web-apps/perun/urns';

export interface AddMemberGroupDialogData {
  theme: string;
  memberId: number;
  membersGroups: Set<number>;
}

@Component({
  selector: 'app-add-member-group-dialog',
  templateUrl: './add-member-group-dialog.component.html',
  styleUrls: ['./add-member-group-dialog.component.scss']
})
export class AddMemberGroupDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<AddMemberGroupDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: AddMemberGroupDialogData,
              private groupManager: GroupsManagerService,
              private memberManager: MembersManagerService,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private authResolver: GuiAuthResolver) {

  }

  theme: string;
  loading = false;

  member: Member;
  membersGroups: Set<number>;
  groups: RichGroup[] = [];
  selection = new SelectionModel<Group>(true, []);

  attrNames = [
    Urns.GROUP_SYNC_ENABLED,
    Urns.GROUP_LAST_SYNC_STATE,
    Urns.GROUP_LAST_SYNC_TIMESTAMP,
    Urns.GROUP_STRUCTURE_SYNC_ENABLED,
    Urns.GROUP_LAST_STRUCTURE_SYNC_STATE,
    Urns.GROUP_LAST_STRUCTURE_SYNC_TIMESTAMP
  ];

  hideColumns = [ 'vo', 'expiration','menu' ];
  filterValue = "";

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.membersGroups = this.data.membersGroups;
    this.loading = true;

    this.memberManager.getMemberById(this.data.memberId).subscribe(member => {
      this.member = member;
      this.groupManager.getAllRichGroupsWithAttributesByNames(this.member.voId, this.attrNames).subscribe(groups => {
        this.groups = groups.filter(grp => this.authResolver.isAuthorized('addMember_Group_Member_policy', [grp]));
        this.loading = false;
      }, () => this.loading = false);
    });
  }

  onAdd() {
    const groupIds = this.selection.selected.map(group => group.id);
    this.loading = true;

    this.groupManager.addMember(groupIds, this.member.id).subscribe(() => {
      this.notificator.showSuccess(this.translate.instant('DIALOGS.ADD_MEMBER_GROUP.SUCCESS'));
      this.dialogRef.close(true);
    }, () => this.loading = false);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

}
