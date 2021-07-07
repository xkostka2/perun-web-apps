import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GuiAuthResolver, NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import {
  Candidate,
  Group,
  GroupsManagerService,
  MemberCandidate, MembersManagerService,
  RegistrarManagerService,
  VosManagerService
} from '@perun-web-apps/perun/openapi';
import { Urns } from '@perun-web-apps/perun/urns';
import { getCandidateEmail } from '@perun-web-apps/perun/utils';
import { PageEvent } from '@angular/material/paginator';
import {
  TABLE_ADD_MEMBER_CANDIDATES_DIALOG,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { MembersCandidatesListComponent } from '../../members-candidates-list/members-candidates-list.component';
import { FormControl, Validators } from '@angular/forms';

export interface AddMemberDialogData {
  voId?: number;
  entityId: number;
  group?: Group;
  theme: string;
  type: 'vo' | 'group';
}

@Component({
  selector: 'app-add-member-dialog',
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.scss']
})
export class AddMemberDialogComponent implements OnInit {

  languages = ['en'];

  title: string;

  selection = new SelectionModel<MemberCandidate>(false, []);
  loading: boolean;
  processing: boolean;
  members: MemberCandidate[] = [];

  firstSearchDone = false;

  theme: string;
  pageSize: number;
  tableId = TABLE_ADD_MEMBER_CANDIDATES_DIALOG;

  @ViewChild('list', {})
  list: MembersCandidatesListComponent;

  inviteAuth = false;
  searchCtrl: FormControl;

  constructor(
    private dialogRef: MatDialogRef<AddMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddMemberDialogData,
    private membersManagerService: MembersManagerService,
    private groupService: GroupsManagerService,
    private voService: VosManagerService,
    private registrarManager: RegistrarManagerService,
    private translate: TranslateService,
    private notificator: NotificatorService,
    protected route: ActivatedRoute,
    private tableConfigService: TableConfigService,
    protected router: Router,
    private guiAuthResolver: GuiAuthResolver,
    private store: StoreService
  ) {
    translate.get('DIALOGS.ADD_MEMBERS.TITLE').subscribe(value => this.title = value);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onAdd(): void {
    this.processing = true;
    // TODO Adds only one member at the time. In the future there would be need to add more
    const selectedMemberCandidate = this.selection.selected[0];

    if (this.data.type === 'vo') {
      if (!!selectedMemberCandidate.richUser) {
        this.addUserToVo(selectedMemberCandidate);
      } else {
        this.addCandidateToVo(selectedMemberCandidate);
      }
    } else if (this.data.type === 'group') {
      if (!!selectedMemberCandidate.member) {
        this.addMemberToGroup(selectedMemberCandidate);
      } else if (!!selectedMemberCandidate.richUser) {
        this.addUserToGroup(selectedMemberCandidate);
      } else if (!!selectedMemberCandidate.candidate) {
        this.addCandidateToGroup(selectedMemberCandidate);
      }
    }
  }

  onInvite(lang: string): void {
    this.processing = true;
    // TODO Was not tested properly. Need to be tested on devel.
    if (this.selection.selected[0].richUser) {
      if (this.data.type === 'vo') {
        this.registrarManager.sendInvitationToExistingUser(this.selection.selected[0].richUser.id, this.data.entityId).subscribe(() => {
          this.onInviteSuccess();
        }, () => this.onError());
      } else if (this.data.type === 'group') {
        this.registrarManager.sendInvitationGroupToExistingUser(this.selection.selected[0].richUser.id, this.data.voId, this.data.group.id).subscribe(() => {
          this.onInviteSuccess();
        }, () => this.onError());
      }
    } else {
      if (this.data.type === 'vo') {
        this.registrarManager.sendInvitation(
          getCandidateEmail(this.selection.selected[0].candidate), lang, this.data.voId).subscribe(() => {
          this.onInviteSuccess();
        }, () => this.onError());
      } else if (this.data.type === 'group') {
        this.registrarManager.sendInvitationForGroup(getCandidateEmail(this.selection.selected[0].candidate), lang,
          this.data.voId, this.data.group.id).subscribe(() => {
          this.onInviteSuccess();
        }, () => this.onError());
      }
    }

  }

  onSearchByString() {
    if (this.searchCtrl.invalid) {
      this.searchCtrl.markAllAsTouched();
      return;
    }
    this.loading = true;

    this.selection.clear();

    // TODO properly test it on devel when possible.
    if (this.data.type === 'vo') {
      this.voService.getCompleteCandidatesForVo(this.data.entityId,
        [Urns.USER_DEF_ORGANIZATION, Urns.USER_DEF_PREFERRED_MAIL],
        this.searchCtrl.value).subscribe(members => {
        this.members = members;
        this.loading = false;
        this.firstSearchDone = true;
      }, () => this.loading = false);
    } else {
      this.voService.getCompleteCandidatesForGroup(this.data.entityId,
        [Urns.USER_DEF_ORGANIZATION, Urns.USER_DEF_PREFERRED_MAIL],
        this.searchCtrl.value).subscribe(members => {
        this.members = members;
        this.loading = false;
        this.firstSearchDone = true;
      }, () => this.loading = false);
    }
  }

  ngOnInit(): void {
    this.languages = this.store.get('supportedLanguages');
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.theme = this.data.theme;
    if (this.data.type === 'group') {
      this.inviteAuth = this.guiAuthResolver.isAuthorized('group-sendInvitation_Vo_Group_User_policy', [this.data.group]);
    }
    this.searchCtrl = new FormControl('', [Validators.required, Validators.pattern('.*[\\S]+.*')]);
  }

  private addUserToVo(selectedMemberCandidate: MemberCandidate) {
    this.membersManagerService.createMemberForUser({vo: this.data.entityId, user: selectedMemberCandidate.richUser.id}).subscribe(member => {
      this.onAddSuccess();
      this.membersManagerService.validateMemberAsync(member.id).subscribe(() => {
        this.onValidateSuccess();
      }, () => this.onCancel());
    }, () => this.onError());
  }

  private addCandidateToVo(selectedMemberCandidate: MemberCandidate) {
    this.membersManagerService.createMemberForCandidate(
      { vo: this.data.entityId, candidate: this.createCandidate(selectedMemberCandidate.candidate) }).subscribe(member => {
      this.onAddSuccess();
      this.membersManagerService.validateMemberAsync(member.id).subscribe(() => {
        this.onValidateSuccess();
      }, () => this.onCancel());
    }, () => this.onError());
  }

  private addUserToGroup(selectedMemberCandidate: MemberCandidate) {
    const group = {
      id: this.data.group.id,
      beanName: this.data.group.beanName,
      name: this.data.group.name,
      voId: this.data.group.voId
    }
    this.membersManagerService.createMemberForUser(
      {vo: this.data.voId, user: selectedMemberCandidate.richUser.id, groups: [group]}).subscribe(member => {
      this.onAddSuccess();
      this.membersManagerService.validateMemberAsync(member.id).subscribe(() => {
        this.onValidateSuccess();
      }, () => this.onCancel());
    }, () => this.onError());
  }

  private addMemberToGroup(selectedMemberCandidate: MemberCandidate) {
    this.groupService.addMembers(this.data.entityId, [selectedMemberCandidate.member.id]).subscribe(() => {
      this.onAddSuccess();
    }, () => this.onError());
  }

  private addCandidateToGroup(selectedMemberCandidate: MemberCandidate) {
    const group = {
      id: this.data.group.id,
      beanName: this.data.group.beanName,
      name: this.data.group.name,
      voId: this.data.group.voId
    }
    this.membersManagerService.createMemberForCandidate({
      vo: this.data.voId,
      candidate: this.createCandidate(selectedMemberCandidate.candidate),
      groups: [group]}).subscribe(member => {
      this.onAddSuccess();
      this.membersManagerService.validateMemberAsync(member.id).subscribe(() => {
        this.onValidateSuccess();
      }, () => this.onCancel());
    }, () => this.onError());
  }

  private onAddSuccess() {
    this.translate.get('DIALOGS.ADD_MEMBERS.SUCCESS').subscribe(msg => {
      this.notificator.showSuccess(msg);
      this.dialogRef.close(true);
    });
  }

  private onError() {
    this.selection.clear();
    this.processing = false;
  }

  private onInviteSuccess() {
    this.translate.get('DIALOGS.ADD_MEMBERS.SUCCESS_INVITE').subscribe(msg => {
      this.notificator.showSuccess(msg);
      this.dialogRef.close(true);
    });
  }

  private onValidateSuccess() {
    this.dialogRef.close(true);
    // this.translate.get('DIALOGS.ADD_MEMBERS.VALIDATION_SUCCESS').subscribe(msg => {
    //   this.notificator.showSuccess(msg);
    //   this.dialogRef.close(true);
    // });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  //perun is expecting precisely this set of values that will be in the object Candidate
  private createCandidate(candidate: Candidate): any {
    return { userExtSource: candidate.userExtSource,
      additionalUserExtSources: candidate.additionalUserExtSources,
      attributes: candidate.attributes,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      middleName: candidate.middleName,
      titleBefore: candidate.titleBefore,
      titleAfter: candidate.titleAfter,
      id: candidate.id};
  }
}
