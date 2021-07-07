import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import {
  ApiRequestConfigurationService,
  GuiAuthResolver,
  NotificatorService,
  StoreService
} from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';
import { RemoveMembersDialogComponent } from '../../../../shared/components/dialogs/remove-members-dialog/remove-members-dialog.component';
import { AddMemberDialogComponent } from '../../../../shared/components/dialogs/add-member-dialog/add-member-dialog.component';
import {
  AttributesManagerService,
  RichMember,
  Vo,
  VosManagerService
} from '@perun-web-apps/perun/openapi';
import { Urns } from '@perun-web-apps/perun/urns';
import { FormControl } from '@angular/forms';
import { TABLE_VO_MEMBERS, TableConfigService } from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { InviteMemberDialogComponent } from '../../../../shared/components/dialogs/invite-member-dialog/invite-member-dialog.component';

@Component({
  selector: 'app-vo-members',
  templateUrl: './vo-members.component.html',
  styleUrls: ['./vo-members.component.scss']
})
export class VoMembersComponent implements OnInit {

  static id = 'VoMembersComponent';

  @HostBinding('class.router-component') true;

  constructor(
    private voService: VosManagerService,
    private route: ActivatedRoute,
    private notificator: NotificatorService,
    private tableConfigService: TableConfigService,
    private dialog: MatDialog,
    private authzService: GuiAuthResolver,
    private storeService: StoreService,
    private attributesManager: AttributesManagerService,
    private apiRequest: ApiRequestConfigurationService,
  ) { }

  vo: Vo;

  members: RichMember[] = null;

  selection = new SelectionModel<RichMember>(true, []);
  loading = false;

  attrNames = [
    Urns.MEMBER_DEF_ORGANIZATION,
    Urns.MEMBER_DEF_MAIL,
    Urns.USER_DEF_ORGANIZATION,
    Urns.USER_DEF_PREFERRED_MAIL,
    Urns.MEMBER_DEF_EXPIRATION
  ];

  statuses = new FormControl();
  statusList = ['VALID', 'INVALID', 'EXPIRED', 'DISABLED'];
  selectedStatuses: string[] = [];
  pageSize: number;
  tableId = TABLE_VO_MEMBERS;
  displayedColumns = ['checkbox', 'id', 'fullName', 'status', 'organization', 'email', 'logins'];
  searchString: string;
  updateTable = false;

  addAuth: boolean;
  removeAuth: boolean;
  inviteAuth: boolean;
  routeAuth: boolean;
  blockManualMemberAdding: boolean;

  ngOnInit() {
    this.loading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.statuses.setValue(this.selectedStatuses);
    this.attrNames = this.attrNames.concat(this.storeService.getLoginAttributeNames());
    this.route.parent.params.subscribe(parentParams => {
      const voId = parentParams['voId'];

      this.isManualAddingBlocked(voId).then(() => {
        this.voService.getVoById(voId).subscribe(vo => {
          this.vo = vo;
          this.setAuthRights();
          this.loading = false;
        });
      });
    });
  }

  setAuthRights(){
    this.addAuth = this.authzService.isAuthorized('createMember_Vo_User_List<Group>_policy', [this.vo]) &&
      this.authzService.isAuthorized('createMember_Vo_Candidate_List<Group>_policy', [this.vo]);

    this.removeAuth = this.authzService.isAuthorized('deleteMembers_List<Member>_policy', [this.vo]);

    this.displayedColumns = this.removeAuth ? this.displayedColumns : ['id', 'fullName', 'status', 'organization', 'email', 'logins'];

    if(this.members !== null && this.members.length !== 0){
      this.routeAuth = this.authzService.isAuthorized('getMemberById_int_policy', [this.vo, this.members[0]]);
    }

    this.inviteAuth = this.authzService.isAuthorized('vo-sendInvitation_Vo_Group_String_String_String_policy', [this.vo]);
  }

  onSearchByString(filter: string) {
    this.searchString = filter;
    this.updateTable = !this.updateTable;
  }

  onAddMember() {
    const config = getDefaultDialogConfig();
    config.width = '1000px';
    config.data = {
      entityId: this.vo.id,
      voId: this.vo.id,
      theme: 'vo-theme',
      type: 'vo'
    };

    const dialogRef = this.dialog.open(AddMemberDialogComponent, config);

    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.updateTable = !this.updateTable;
        this.selection.clear();
      }
    });
  }

  onRemoveMembers() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      members: this.selection.selected,
      theme: 'vo-theme'
    };

    const dialogRef = this.dialog.open(RemoveMembersDialogComponent, config);

    dialogRef.afterClosed().subscribe(wereMembersDeleted => {
      if (wereMembersDeleted) {
        this.updateTable = !this.updateTable;
        this.selection.clear();
      }
    });
  }

  onInviteMember(){
    const config = getDefaultDialogConfig();
    config.width = '650px';
    config.data = { voId: this.vo.id, theme: 'vo-theme' };

    this.dialog.open(InviteMemberDialogComponent, config);
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

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  isManualAddingBlocked(voId: number): Promise<void> {
    return new Promise((resolve) => {
      this.apiRequest.dontHandleErrorForNext();
      this.attributesManager.getVoAttributeByName(voId, "urn:perun:vo:attribute-def:def:blockManualMemberAdding").subscribe(attrValue => {
        this.blockManualMemberAdding = attrValue.value !== null;
        resolve();
      }, error => {
        if (error.error.name !== 'PrivilegeException') {
          this.notificator.showError(error);
        }
        resolve();
      });
    });
  }

  changeStatuses() {
    this.selectedStatuses = this.statuses.value;
  }
}
