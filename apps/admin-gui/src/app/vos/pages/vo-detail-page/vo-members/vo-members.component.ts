import { Component, HostBinding, OnInit } from '@angular/core';
import { SideMenuService } from '../../../../core/services/common/side-menu.service';
import { ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import {
  ApiRequestConfigurationService,
  GuiAuthResolver,
  NotificatorService,
  StoreService
} from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { RemoveMembersDialogComponent } from '../../../../shared/components/dialogs/remove-members-dialog/remove-members-dialog.component';
import { AddMemberDialogComponent } from '../../../../shared/components/dialogs/add-member-dialog/add-member-dialog.component';
import {
  AttributesManagerService,
  MembersManagerService,
  RichMember,
  Vo,
  VosManagerService
} from '@perun-web-apps/perun/openapi';
import { Urns } from '@perun-web-apps/perun/urns';
import { FormControl, Validators } from '@angular/forms';
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
    private membersService: MembersManagerService,
    private sideMenuService: SideMenuService,
    private voService: VosManagerService,
    private route: ActivatedRoute,
    private notificator: NotificatorService,
    private translate: TranslateService,
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
  searchControl: FormControl;
  firstSearchDone = false;

  loading = false;

  private attrNames = [
    Urns.MEMBER_DEF_ORGANIZATION,
    Urns.MEMBER_DEF_MAIL,
    Urns.USER_DEF_ORGANIZATION,
    Urns.USER_DEF_PREFERRED_MAIL,
    Urns.MEMBER_DEF_EXPIRATION
  ];

  statuses = new FormControl();
  statusList = ['VALID', 'INVALID', 'EXPIRED', 'DISABLED'];
  selectedStatuses: string[] = ['VALID', 'INVALID', 'EXPIRED', 'DISABLED'];
  pageSize: number;
  tableId = TABLE_VO_MEMBERS;
  hideColumns = [];

  addAuth: boolean;
  removeAuth: boolean;
  inviteAuth: boolean;
  routeAuth: boolean;
  count: number;
  blockManualMemberAdding: boolean;

  ngOnInit() {
    this.loading = true;
    this.searchControl = new FormControl('', [Validators.required, Validators.pattern('.*[\\S]+.*')]);
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.statuses.setValue(this.statusList);
    this.attrNames = this.attrNames.concat(this.storeService.getLoginAttributeNames());
    this.route.parent.params.subscribe(parentParams => {
      const voId = parentParams['voId'];

      this.isManualAddingBlocked(voId).then(() => {
        this.voService.getVoById(voId).subscribe(vo => {
          this.vo = vo;
          this.setAuthRights();
          this.membersService.getMembersCount(this.vo.id).subscribe(count => {
            this.count = count;
            if (count < 400) {
              this.onListAll();
            }
            this.loading = false;
          });
        });
      });
    });
  }

  setAuthRights(){
    this.addAuth = this.authzService.isAuthorized('createMember_Vo_User_List<Group>_policy', [this.vo]) &&
      this.authzService.isAuthorized('createMember_Vo_Candidate_List<Group>_policy', [this.vo]);

    this.removeAuth = this.authzService.isAuthorized('deleteMembers_List<Member>_policy', [this.vo]);

    this.hideColumns = this.removeAuth ? ['groupStatus', 'sponsored'] : ['checkbox', 'groupStatus', 'sponsored'];

    if(this.members !== null && this.members.length !== 0){
      this.routeAuth = this.authzService.isAuthorized('getMemberById_int_policy', [this.vo, this.members[0]]);
    }

    this.inviteAuth = this.authzService.isAuthorized('vo-sendInvitation_Vo_Group_String_String_String_policy', [this.vo]);
  }

  onSearchByString() {
    if (this.searchControl.invalid) {
      this.searchControl.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.firstSearchDone = true;

    this.selection.clear();

    this.membersService.findCompleteRichMembersForVo(this.vo.id, this.attrNames, this.searchControl.value, this.selectedStatuses).subscribe(
      members => {
        this.members = members;
        this.setAuthRights();
        this.loading = false;
      },
      () => this.loading = false
    );
  }

  onListAll() {
    this.loading = true;
    this.firstSearchDone = true;

    this.selection.clear();
    this.membersService.getCompleteRichMembersForVo(this.vo.id, this.selectedStatuses, this.attrNames).subscribe(
      members => {
        this.members = members;
        this.setAuthRights();
        this.loading = false;
      },
      () => this.loading = false
    );
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
      if (this.firstSearchDone || success) {
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
      members: this.selection.selected,
      theme: 'vo-theme'
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
    config.data = { voId: this.vo.id, theme: 'vo-theme' };

    const dialogRef = this.dialog.open(InviteMemberDialogComponent, config);

    dialogRef.afterClosed().subscribe(inviteSent => {
      if (inviteSent) {
        this.refreshTable();
      }
    });
  }

  refreshTable() {
    if (this.searchControl.value.trim().length > 0) {
      this.onSearchByString();
    } else {
      this.onListAll();
    }
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
    return new Promise((resolve, reject) => {
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
}
