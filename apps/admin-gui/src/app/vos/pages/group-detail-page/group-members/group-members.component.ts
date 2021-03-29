import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import {
  ApiRequestConfigurationService,
  GuiAuthResolver,
  NotificatorService,
  StoreService
} from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { AddMemberDialogComponent } from '../../../../shared/components/dialogs/add-member-dialog/add-member-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { RemoveMembersDialogComponent } from '../../../../shared/components/dialogs/remove-members-dialog/remove-members-dialog.component';
import {
  AttributesManagerService,
  GroupsManagerService,
  MembersManagerService,
  RichGroup,
  RichMember
} from '@perun-web-apps/perun/openapi';
import { PageEvent } from '@angular/material/paginator';
import { TABLE_GROUP_MEMBERS, TableConfigService } from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { InviteMemberDialogComponent } from '../../../../shared/components/dialogs/invite-member-dialog/invite-member-dialog.component';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-group-members',
  templateUrl: './group-members.component.html',
  styleUrls: ['./group-members.component.scss']
})
export class GroupMembersComponent implements OnInit {

  static id = 'GroupMembersComponent';

  // used for router animation
  @HostBinding('class.router-component') true;

  constructor(
    private groupService: GroupsManagerService,
    protected route: ActivatedRoute,
    protected router: Router,
    private tableConfigService: TableConfigService,
    private dialog: MatDialog,
    private guiAuthResolver: GuiAuthResolver,
    private storeService: StoreService,
    private membersManager: MembersManagerService,
    private attributesManager: AttributesManagerService,
    private apiRequest: ApiRequestConfigurationService,
    private notificator: NotificatorService
  ) { }

  group: RichGroup;

  members: RichMember[] = null;
  selection: SelectionModel<RichMember>;
  synchEnabled = false;

  searchControl: FormControl;
  firstSearchDone = false;

  loading = false;
  data: 'search' | 'all';

  tableId = TABLE_GROUP_MEMBERS;

  private memberAttrNames = [
    Urns.MEMBER_DEF_ORGANIZATION,
    Urns.MEMBER_DEF_MAIL,
    Urns.USER_DEF_ORGANIZATION,
    Urns.USER_DEF_PREFERRED_MAIL,
    Urns.MEMBER_DEF_EXPIRATION,
    Urns.MEMBER_DEF_GROUP_EXPIRATION
  ];

  private groupAttrNames = [
    Urns.GROUP_SYNC_ENABLED,
    Urns.GROUP_LAST_SYNC_STATE,
    Urns.GROUP_LAST_SYNC_TIMESTAMP,
    Urns.GROUP_STRUCTURE_SYNC_ENABLED,
    Urns.GROUP_LAST_STRUCTURE_SYNC_STATE,
    Urns.GROUP_LAST_STRUCTURE_SYNC_TIMESTAMP
  ];
  pageSize: number;

  addAuth: boolean;
  removeAuth: boolean;
  routeAuth: boolean;
  inviteAuth: boolean;
  hideColumns: String[] = [];
  blockManualMemberAdding: boolean;

  statuses = new FormControl();
  statusList = ['VALID', 'INVALID', 'EXPIRED', 'DISABLED'];
  selectedStatuses: string[] = ['VALID', 'INVALID'];

  ngOnInit() {
    this.loading = true;
    this.searchControl = new FormControl('', [Validators.required, Validators.pattern('.*[\\S]+.*')]);
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.selection = new SelectionModel<RichMember>(true, []);
    this.statuses.setValue(this.selectedStatuses);
    this.memberAttrNames = this.memberAttrNames.concat(this.storeService.getLoginAttributeNames());
    this.route.parent.params.subscribe(parentParams => {
      const groupId = parentParams['groupId'];
      const voId = parentParams['voId'];
      this.isManualAddingBlocked(voId, groupId).then(() => this.loadPage(groupId));
    });
  }

  loadPage(groupId: number) {
    this.groupService.getRichGroupByIdWithAttributesByNames(groupId, this.groupAttrNames).subscribe(group => {
      this.group = group;
      this.synchEnabled = this.isSynchronized();
      this.setAuthRights();
      this.groupService.getGroupMembersCount(this.group.id).subscribe( count => {
        if(count < 400) {
          this.onListAll();
        }
        this.loading = false;
      });
    });
  }

  isSynchronized() {
    return this.group.attributes.some(att =>
      att.friendlyName === "synchronizationEnabled" && att.value !== null && att.value.toString() === "true");
  }

  setAuthRights() {
    this.addAuth = this.guiAuthResolver.isAuthorized('addMembers_Group_List<Member>_policy', [this.group]);
    this.removeAuth = this.guiAuthResolver.isAuthorized('removeMembers_Group_List<Member>_policy', [this.group]);
    this.routeAuth = this.guiAuthResolver.isAuthorized('getMemberById_int_policy', [this.group]);
    this.inviteAuth = this.guiAuthResolver.isAuthorized('group-sendInvitation_Vo_Group_String_String_String_policy', [this.group]);
    this.hideColumns = this.removeAuth ? ['sponsored'] : ['checkbox', 'sponsored'];
  }


  onSearchByString() {
    if (this.searchControl.invalid) {
      this.searchControl.markAllAsTouched();
      return;
    }
    this.data = 'search';
    this.firstSearchDone = true;

    this.refreshTable();
  }

  onListAll() {
    this.data = 'all';
    this.firstSearchDone = true;

    this.refreshTable();
  }

  onAddMember() {
    const config = getDefaultDialogConfig();
    config.width = '1000px';
    config.data = {
      voId: this.group.voId,
      group: this.group,
      entityId: this.group.id,
      theme: 'group-theme',
      type: 'group',
    };

    const dialogRef = this.dialog.open(AddMemberDialogComponent, config);

    dialogRef.afterClosed().subscribe(() => {
      if (this.firstSearchDone) {
        this.refreshTable();
      }
    });
  }

  onKeyInput(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSearchByString();
    }
  }

  onRemoveMembers() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      groupId: this.group.id,
      members: this.selection.selected,
      theme: 'group-theme'
    };

    const dialogRef = this.dialog.open(RemoveMembersDialogComponent, config);

    dialogRef.afterClosed().subscribe(wereMembersDeleted => {
      if (wereMembersDeleted) {
        this.refreshTable();
      }
    });
  }

  onInviteMember(){
    const config = getDefaultDialogConfig();
    config.width = '650px';
    config.data = {
      voId: this.group.voId,
      groupId: this.group.id,
      theme: 'group-theme'
    };

    const dialogRef = this.dialog.open(InviteMemberDialogComponent, config);

    dialogRef.afterClosed().subscribe(inviteSent => {
      if (inviteSent) {
        this.refreshTable();
      }
    });
  }

  refreshTable() {
    this.loading = true;
    this.selection.clear();
    switch (this.data) {
      case 'all': {
        this.membersManager.getCompleteRichMembersForGroup(this.group.id, false, this.selectedStatuses, this.memberAttrNames).subscribe(
          members => {
          this.members = members;
          this.setAuthRights();
          this.loading = false;
        },
          () => this.loading = false
        );
        break;
      }
      case 'search': {
        this.membersManager.findCompleteRichMembersForGroup(this.group.id, this.memberAttrNames, this.searchControl.value, false, this.selectedStatuses).subscribe(
          members => {
            this.members = members;
            this.setAuthRights();
            this.loading = false;
          },
          () => this.loading = false
        );
        break;
      }
      default: this.loading = false;
    }
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  displaySelectedStatuses(): string {
    if(this.selectedStatuses.length === this.statusList.length){
      return 'ALL';
    }
    if(this.statuses.value){
      return `${this.statuses.value[0]}  ${this.statuses.value.length > 1 ? ('(+' + (this.statuses.value.length - 1) +' '+ (this.statuses.value.length === 2 ? 'other)' : 'others)')) : ''}`;
    }
    return '';
  }

  isManualAddingBlocked(voId: number, groupId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiRequest.dontHandleErrorForNext();
      this.attributesManager.getVoAttributeByName(voId, "urn:perun:vo:attribute-def:def:blockManualMemberAdding").subscribe(attrValue => {
        this.blockManualMemberAdding = attrValue.value !== null;
        if (this.blockManualMemberAdding !== true) {
          this.apiRequest.dontHandleErrorForNext();
          this.attributesManager.getGroupAttributeByName(groupId, "urn:perun:group:attribute-def:def:blockManualMemberAdding").subscribe(groupAttrValue => {
            this.blockManualMemberAdding = groupAttrValue.value !== null;
            resolve();
          }, error => {
            if (error.error.name !== 'PrivilegeException') {
              this.notificator.showError(error);
            }
            resolve();
          });
        } else {
          resolve();
        }
      }, error => {
        if (error.error.name !== 'PrivilegeException') {
          this.notificator.showError(error);
        }
        resolve();
      });
    });
  }
}
