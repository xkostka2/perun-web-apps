import {Component, HostBinding, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {MenuItem} from '@perun-web-apps/perun/models';
import { GuiAuthResolver} from '@perun-web-apps/perun/services';
import { MembersManagerService, RichMember, Vo } from '@perun-web-apps/perun/openapi';
import { Urns } from '@perun-web-apps/perun/urns';
import { getDefaultDialogConfig, parseFullName, parseStatusColor, parseStatusIcon } from '@perun-web-apps/perun/utils';
import { AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { MatDialog } from '@angular/material/dialog';
import { ChangeExpirationDialogComponent } from '@perun-web-apps/perun/dialogs';

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
    private translate: TranslateService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    public authResolver: GuiAuthResolver,
  ) { }

  fullName = '';
  statusIcon = '';
  statusIconColor = '';
  expiration = '';

  member: RichMember = null;
  navItems: MenuItem[] = [];

  vo: Vo;
  loading = false;

  ngOnInit() {
    this.loading = true;
    this.route.parent.params.subscribe(parentParams => {
      const memberId = parentParams['memberId'];

      this.membersService.getRichMemberWithAttributes(memberId).subscribe(member => {
        this.member = member;
        this.fullName = parseFullName(this.member.user);
        this.statusIcon = parseStatusIcon(this.member);
        this.statusIconColor = parseStatusColor(this.member);

        this.vo = {
          id: member.voId,
          beanName: "Vo"
        };
        this.initNavItems();
        this.refreshData();
      }, () => this.loading = false);
    });
  }

  changeExpiration() {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = this.member;

    const dialogRef = this.dialog.open(ChangeExpirationDialogComponent, config);
    dialogRef.afterClosed().subscribe(success => {
      if (success){
        this.refreshData();
      }
    });
  }

  private initNavItems() {
    this.navItems = [];

    if(this.authResolver.isAuthorized('getMemberGroups_Member_policy', [this.vo])){
      this.navItems.push( {
        cssIcon: 'perun-group',
        url: `/organizations/${this.member.voId}/members/${this.member.id}/groups`,
        label: 'MENU_ITEMS.MEMBER.GROUPS',
        style: 'member-btn'
      });
    }
    if(this.authResolver.isAuthorized('vo-getApplicationsForMember_Group_Member_policy', [this.vo])){
      this.navItems.push( {
        cssIcon: 'perun-applications',
        url: `/organizations/${this.member.voId}/members/${this.member.id}/applications`,
        label: 'MENU_ITEMS.MEMBER.APPLICATIONS',
        style: 'member-btn'
      });
    }
    if(this.authResolver.isAuthorized('getAssignedRichResources_Member_policy', [this.vo])){
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
    this.attributesManager.getMemberAttributeByName(this.member.id, Urns.MEMBER_DEF_EXPIRATION).subscribe(attr => {
      this.expiration = !attr.value ? this.translate.instant('MEMBER_DETAIL.OVERVIEW.NEVER_EXPIRES') : attr.value;
      this.membersService.getRichMemberWithAttributes(this.member.id).subscribe(member => {
        this.member = member;
        this.loading = false;
      }, () => this.loading = false);
    }, () => this.loading = false);
  }
}
