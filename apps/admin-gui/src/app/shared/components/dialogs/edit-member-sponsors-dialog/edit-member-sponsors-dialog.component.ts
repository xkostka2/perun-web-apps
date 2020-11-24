import { Component, Inject, OnInit } from '@angular/core';
import { Member, MembersManagerService, Sponsor, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { ChangeExpirationDialogComponent } from '@perun-web-apps/perun/dialogs';

export interface EditMemberSponsorsDialogComponent {
  theme: string;
  sponsors: Sponsor[];
  member: Member;
}

@Component({
  selector: 'app-edit-member-sponsors-dialog',
  templateUrl: './edit-member-sponsors-dialog.component.html',
  styleUrls: ['./edit-member-sponsors-dialog.component.scss']
})
export class EditMemberSponsorsDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<EditMemberSponsorsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: EditMemberSponsorsDialogComponent,
              private memberService: MembersManagerService,
              private userService: UsersManagerService,
              private notificator: NotificatorService,
              private authResolver: GuiAuthResolver,
              private translate: TranslateService,
              private dialog: MatDialog) { }

  theme: string;
  sponsors: Sponsor[];
  displayedColumns: string[] = ['id', 'name', 'expiration', 'remove'];
  dataSource: MatTableDataSource<Sponsor>;
  loading = false;

  sponsorsToRemove: Set<number> = new Set<number>();

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.sponsors = this.data.sponsors;
    this.dataSource = new MatTableDataSource<Sponsor>(this.data.sponsors);
  }

  markSponsor(sponsor: Sponsor) {
    if (this.sponsorsToRemove.has(sponsor.user.id)){
      this.sponsorsToRemove.delete(sponsor.user.id);
    } else {
      this.sponsorsToRemove.add(sponsor.user.id);
    }
  }

  removeSponsors(sponsorIds: number[]){
    if (sponsorIds.length === 0){
      this.notificator.showSuccess(this.translate.instant('DIALOGS.EDIT_MEMBER_SPONSORS.SUCCESS'));
      this.loading = false;
      this.dialogRef.close(true);
    }

    const sponsorId = sponsorIds.pop();
    this.memberService.removeSponsor(this.data.member.id, sponsorId).subscribe(() => {
      this.removeSponsors(sponsorIds);
    }, () => this.loading = false);
  }

  onSubmit(){
    this.loading = true;
    const sponsorIds = Array.from(this.sponsorsToRemove);
    this.removeSponsors(sponsorIds);
  }

  onCancel(){
    this.dialogRef.close(false);
  }

  isRemoveAuthorized(sponsor: Sponsor) {
    return this.authResolver.isAuthorized('sponsored-removeSponsor_Member_User_policy', [this.data.member])
    && this.authResolver.isAuthorized('sponsor-removeSponsor_Member_User_policy', [sponsor.user]);
  }

  isExpirationAuthorized(sponsor: Sponsor){
    return this.authResolver.isAuthorized('updateSponsorshipValidity_Member_User_LocalDate', [this.data.member, sponsor.user]);
  }

  parseDate(date){
    if (date === null){
      return "Never expire";
    }
   const [year, month, day] = date.split('-');

    return `${day}-${month}-${year}`;
  }

  changeExpiration(sponsor) {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {
      memberId: this.data.member.id,
      sponsor: sponsor,
      mode: 'sponsor'
    };

    const dialogRef = this.dialog.open(ChangeExpirationDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.loading = true;
        this.userService.getSponsorsForMember(this.data.member.id, []).subscribe(sponsors => {
          this.sponsors = sponsors;
          this.dataSource = new MatTableDataSource<Sponsor>(this.sponsors);
          this.loading = false;
        });
      }
    });
  }
}
