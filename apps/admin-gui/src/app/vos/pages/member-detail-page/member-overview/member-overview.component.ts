import { Component, HostBinding, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {MenuItem} from '@perun-web-apps/perun/models';
import { MatDialog } from '@angular/material/dialog';
import { ChangeExpirationDialogComponent } from '@perun-web-apps/perun/dialogs';
import { MatTableDataSource } from '@angular/material/table';
import { PasswordResetRequestDialogComponent } from '../../../../shared/components/dialogs/password-reset-request-dialog/password-reset-request-dialog.component';
import {
  Attribute,
  AttributesManagerService,
  MembersManagerService, RichMember, Sponsor,
  UsersManagerService, Vo
} from '@perun-web-apps/perun/openapi';
import {
  ApiRequestConfigurationService,
  GuiAuthResolver,
  NotificatorService,
  StoreService
} from '@perun-web-apps/perun/services';
import { getDefaultDialogConfig, parseFullName, parseStatusColor, parseStatusIcon } from '@perun-web-apps/perun/utils';
import { Urns } from '@perun-web-apps/perun/urns';
import { EditMemberSponsorsDialogComponent } from '../../../../shared/components/dialogs/edit-member-sponsors-dialog/edit-member-sponsors-dialog.component';

@Component({
  selector: 'app-member-overview',
  templateUrl: './member-overview.component.html',
  styleUrls: ['./member-overview.component.scss']
})
export class MemberOverviewComponent implements OnInit {

  // used for router animation
  @HostBinding('class.router-component') true;

  constructor(
    private attributesManager: AttributesManagerService,
    private membersService: MembersManagerService,
    private usersManager: UsersManagerService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    public authResolver: GuiAuthResolver,
    private storeService: StoreService,
    private apiRequest: ApiRequestConfigurationService,
    private notificator: NotificatorService,
  ) {
  }

  fullName = '';
  statusIcon = '';
  statusIconColor = '';
  expiration = '';
  logins: Attribute[] = [];
  member: RichMember = null;
  navItems: MenuItem[] = [];

  attributeNames: Array<string> = [];
  attributes: Map<string, string[]> = new Map<string, string[]>();
  dataSource = new MatTableDataSource<string>();
  membershipDataSource = new MatTableDataSource<string>();
  displayedColumns = ['attName', 'attValue'];
  sponsors: Sponsor[] = [];
  sponsorsDataSource = new MatTableDataSource<Sponsor>();

  vo: Vo;
  loading = false;
  expirationAtt: Attribute;
  pwdResetAuth: boolean;

  ngOnInit() {
    this.loading = true;
    this.route.parent.params.subscribe(parentParams => {
      const memberId = parentParams['memberId'];
      this.attributeNames = this.storeService.getMemberProfileAttributeNames();

      this.membersService.getRichMemberWithAttributes(memberId).subscribe(member => {
        const attUrns = this.storeService.get('password_namespace_attributes').map(urn => {
          urn = urn.split(':');
          return urn[urn.length - 1];
        });
        this.attributesManager.getLogins(member.userId).subscribe(logins => {
          this.logins = logins.filter(login => attUrns.includes(login.friendlyNameParameter));
          this.member = member;
          this.fullName = parseFullName(this.member.user);
          this.statusIcon = parseStatusIcon(this.member);
          this.statusIconColor = parseStatusColor(this.member);

        this.initAttributes();
        this.dataSource = new MatTableDataSource<string>(Array.from(this.attributes.keys()));
        this.membershipDataSource = new MatTableDataSource<string>(['Status', 'Expiration']);

        this.vo = {
          id: member.voId,
          beanName: "Vo"
        };
        this.pwdResetAuth = this.authResolver.isAuthorized('sendPasswordResetLinkEmail_Member_String_String_String_String_policy', [this.vo, this.member]);
        if (this.member.sponsored &&
          this.authResolver.isAuthorized('getSponsorsForMember_Member_List<String>_policy', [this.member])) {

          this.usersManager.getSponsorsForMember(this.member.id, null).subscribe(sponsors => {
            this.sponsors = sponsors;
            this.sponsorsDataSource = new MatTableDataSource<Sponsor>(this.sponsors);

            this.initNavItems();
            this.refreshData();
          });
        } else {
          this.initNavItems();
          this.refreshData();
        }

      }, () => this.loading = false);
    });
  });
  }

  changeExpiration() {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {
      memberId: this.member.id,
      expirationAttr: this.expirationAtt,
      mode: 'vo'
    }

    const dialogRef = this.dialog.open(ChangeExpirationDialogComponent, config);
    dialogRef.afterClosed().subscribe(success => {
      if (success) {
        this.refreshData();
      }
    });
  }

  private initAttributes() {
    this.attributeNames.forEach(name => {
      this.attributes.set(name, [null ,'-']);
    })
    this.filterAttributes();
  }

  private filterAttributes() {
    if (this.member.memberAttributes !== null){
      this.member.memberAttributes.forEach(att => {
        if(this.attributeNames.includes(att.friendlyName)){
          this.attributes.set(att.friendlyName, [att.displayName, att.value.toString()]);
        }
      });
    }

    if (this.member.userAttributes !== null){
      this.member.userAttributes.forEach(att => {
        if(this.attributeNames.includes(att.friendlyName)){
          this.attributes.set(att.friendlyName, [att.displayName, att.value.toString()]);
        }
      });
    }
  }

  private initNavItems() {
    this.navItems = [];

    if (this.authResolver.isAuthorized('getMemberGroups_Member_policy', [this.vo])) {
      this.navItems.push({
        cssIcon: 'perun-group',
        url: `/organizations/${this.member.voId}/members/${this.member.id}/groups`,
        label: 'MENU_ITEMS.MEMBER.GROUPS',
        style: 'member-btn'
      });
    }
    if (this.authResolver.isAuthorized('vo-getApplicationsForMember_Group_Member_policy', [this.vo])) {
      this.navItems.push({
        cssIcon: 'perun-applications',
        url: `/organizations/${this.member.voId}/members/${this.member.id}/applications`,
        label: 'MENU_ITEMS.MEMBER.APPLICATIONS',
        style: 'member-btn'
      });
    }
    if (this.authResolver.isAuthorized('getAssignedRichResources_Member_policy', [this.vo])) {
      this.navItems.push({
        cssIcon: 'perun-resource',
        url: `/organizations/${this.member.voId}/members/${this.member.id}/resources`,
        label: 'MENU_ITEMS.MEMBER.RESOURCES',
        style: 'member-btn'
      });
    }
    this.navItems.push({
      cssIcon: 'perun-attributes',
      url: `/organizations/${this.vo.id}/members/${this.member.id}/attributes`,
      label: 'MENU_ITEMS.MEMBER.ATTRIBUTES',
      style: 'member-btn'
    });

    // this.navItems.push({
    //   cssIcon: 'perun-settings2',
    //   url: `/organizations/${this.member.voId}/members/${this.member.id}/settings`,
    //   label: 'MENU_ITEMS.MEMBER.SETTINGS',
    //   style: 'member-btn'
    // });

  }

  private refreshData() {
    this.loading = true;
    this.membersService.getRichMemberWithAttributes(this.member.id).subscribe(member => {
      this.member = member;
      this.apiRequest.dontHandleErrorForNext();
      this.attributesManager.getMemberAttributeByName(this.member.id, Urns.MEMBER_DEF_EXPIRATION).subscribe(attr => {
        this.expirationAtt = attr;
        this.expiration = !attr.value ? this.translate.instant('MEMBER_DETAIL.OVERVIEW.NEVER_EXPIRES') : attr.value;
        this.loading = false;
      }, error => {
        if (error.error.name !== 'PrivilegeException') {
          this.notificator.showError(error);
        } else {
          this.membershipDataSource = new MatTableDataSource<string>(['Status']);
        }
        this.loading = false
      });
    }, () => this.loading = false);
  }

  requestPwdReset() {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {
      userId: this.member.userId,
      memberId: this.member.id,
      logins: this.logins
    };

    this.dialog.open(PasswordResetRequestDialogComponent, config);
  }

  changeSponsors() {
    const config = getDefaultDialogConfig();
    config.width = "650px";
    config.data = {
      sponsors: this.sponsors,
      member: this.member,
      theme: "member-theme"
    };
    const dialogRef = this.dialog.open(EditMemberSponsorsDialogComponent, config);
    dialogRef.afterClosed().subscribe(() => {
      this.usersManager.getSponsorsForMember(this.member.id, null).subscribe(sponsors => {
        this.sponsors = sponsors;
        this.sponsorsDataSource = new MatTableDataSource<Sponsor>(this.sponsors);
      });
    });
  }
}
