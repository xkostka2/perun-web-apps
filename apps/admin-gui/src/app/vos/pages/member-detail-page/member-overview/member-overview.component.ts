import {Component, HostBinding, OnInit} from '@angular/core';
import {parseFullName, parseStatusColor, parseStatusIcon} from '../../../../shared/utils';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {MenuItem} from '../../../../shared/models/MenuItem';
import { AttributesService, MembersService } from '@perun-web-apps/perun/services';
import { RichMember } from '@perun-web-apps/perun/models';
import { Urns } from '@perun-web-apps/perun/urns';

@Component({
  selector: 'app-member-overview',
  templateUrl: './member-overview.component.html',
  styleUrls: ['./member-overview.component.scss']
})
export class MemberOverviewComponent implements OnInit {

  // used for router animation
  @HostBinding('class.router-component') true;

  constructor(
    private attributeService: AttributesService,
    private membersService: MembersService,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) { }

  fullName = '';
  statusIcon = '';
  statusIconColor = '';
  expiration = '';

  member: RichMember = null;
  navItems: MenuItem[] = [];

  ngOnInit() {
    this.route.parent.params.subscribe(parentParams => {
      const memberId = parentParams['memberId'];

      this.membersService.getRichMemberWithAttributes(memberId).subscribe(member => {
        this.member = member;
        this.fullName = parseFullName(this.member.user);
        this.statusIcon = parseStatusIcon(this.member);
        this.statusIconColor = parseStatusColor(this.member);

        this.initNavItems();

        this.attributeService.getAttribute(this.member.id, 'member', Urns.MEMBER_DEF_EXPIRATION).subscribe(attr => {
          this.expiration = attr.value === null ? this.translate.instant('MEMBER_DETAIL.OVERVIEW.NEVER_EXPIRES') : attr.value;
        });
      });
    });
  }

  private initNavItems() {
    this.navItems = [
      {
        icon: 'group-white.svg',
        url: `/organizations/${this.member.voId}/members/${this.member.id}/groups`,
        label: 'MENU_ITEMS.MEMBER.GROUPS',
        style: 'member-btn'
      },
      {
        icon: 'settings2-white.svg',
        url: `/organizations/${this.member.voId}/members/${this.member.id}/settings`,
        label: 'MENU_ITEMS.MEMBER.SETTINGS',
        style: 'member-btn'
      }
    ];
  }
}
