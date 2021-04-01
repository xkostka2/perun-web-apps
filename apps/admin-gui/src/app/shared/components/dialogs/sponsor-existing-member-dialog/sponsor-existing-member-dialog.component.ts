import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { MembersManagerService, RichMember } from '@perun-web-apps/perun/openapi';
import { TranslateService } from '@ngx-translate/core';
import { formatDate } from '@angular/common';
import { FormControl, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { Urns } from '@perun-web-apps/perun/urns';
import { PageEvent } from '@angular/material/paginator';
import { TableConfigService, TABLE_ADD_SPONSORED_MEMBERS } from '@perun-web-apps/config/table-config';

export interface SponsorExistingMemberDialogData {
  voId: number
  theme: string;
}

@Component({
  selector: 'app-sponsor-existing-member-dialog',
  templateUrl: './sponsor-existing-member-dialog.component.html',
  styleUrls: ['./sponsor-existing-member-dialog.component.scss']
})
export class SponsorExistingMemberDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<SponsorExistingMemberDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: SponsorExistingMemberDialogData,
              private store: StoreService,
              private membersService: MembersManagerService,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private tableConfigService: TableConfigService) {
  }

  loading = false;
  theme: string;

  pageSize: number;
  tableId = TABLE_ADD_SPONSORED_MEMBERS;

  expiration = 'never';
  searchCtrl: FormControl = new FormControl('', [Validators.required]);
  firstSearchDone = false;

  members: RichMember[] = [];
  selection: SelectionModel<RichMember> = new SelectionModel<RichMember>(true, []);

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  sponsor(members: RichMember[]) {
    this.loading = true;
    if (members.length === 0){
      this.notificator.showSuccess(this.translate.instant('DIALOGS.SPONSOR_EXISTING_MEMBER.SUCCESS'));
      this.loading = false;
      this.dialogRef.close(true);
      return
    }

    const member = members.pop();

    if (member.sponsored) {
      this.membersService.sponsorMember(
        member.id,
        this.store.getPerunPrincipal().user.id,
        this.expiration).subscribe( () => {
        this.sponsor(members);
      }, () => this.loading = false);
    } else {
      this.membersService.setSponsorshipForMember(
        member.id,
        this.store.getPerunPrincipal().user.id,
        this.expiration).subscribe( () => {
        this.sponsor(members);
      }, () => this.loading = false);
    }
  }

  onSubmit() {
    this.loading = true;
    const members = Array.from(this.selection.selected);
    this.expiration = this.expiration === 'never' ? null : this.expiration;

    this.sponsor(members);
  }

  setExpiration(newExpiration) {
    if(newExpiration === 'never'){
      this.expiration = 'never';
    } else {
      this.expiration = formatDate(newExpiration,'yyyy-MM-dd','en-GB');
    }
  }

  onSearchByString() {
    if (this.searchCtrl.invalid) {
      this.searchCtrl.markAllAsTouched();
      return
    }
    this.firstSearchDone = true;
    this.loading = true;

    this.selection.clear();

    const attrNames  = [Urns.MEMBER_DEF_EXPIRATION, Urns.USER_DEF_PREFERRED_MAIL]
    this.membersService.findCompleteRichMembersForVo(
      this.data.voId, attrNames, this.searchCtrl.value).subscribe(members => {
      this.members = members;
      this.loading = false;
    }, () => this.loading = false);
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
