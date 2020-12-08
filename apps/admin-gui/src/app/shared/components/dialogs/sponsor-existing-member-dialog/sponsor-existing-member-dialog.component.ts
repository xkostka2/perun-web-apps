import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { MembersManagerService, RichMember } from '@perun-web-apps/perun/openapi';
import { TranslateService } from '@ngx-translate/core';
import { formatDate } from '@angular/common';
import { FormControl, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { Urns } from '@perun-web-apps/perun/urns';

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
              private translate: TranslateService) {
  }

  loading = false;
  processing = false;
  theme: string;

  expiration = 'never';
  searchCtrl: FormControl = new FormControl('', [Validators.required]);
  firstSearchDone = false;

  members: RichMember[] = [];
  selection: SelectionModel<RichMember> = new SelectionModel<RichMember>(true, []);

  ngOnInit(): void {
    this.theme = this.data.theme;
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
    }

    const member = members.pop();

    // this.membersService.setSponsorshipForMember(
    //   member.id,
    //   this.store.getPerunPrincipal().user.id,
    //   this.expiration).subscribe( () => {
    //     this.sponsor(members);
    // }, () => this.loading = false);
  }

  onSubmit() {
    this.loading = true;
    const members = this.selection.selected;

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
      return;
    }
    this.firstSearchDone = true;
    this.processing = true;

    this.selection.clear();

    this.membersService.findCompleteRichMembers(
      this.data.voId,
      [Urns.MEMBER_DEF_EXPIRATION, Urns.USER_DEF_PREFERRED_MAIL],
      this.searchCtrl.value,
      false).subscribe(members => {
      this.members = members;
      this.processing = false;
    }, () => this.loading = false);
  }
}
