import {Component, OnInit} from '@angular/core';
import {MenuItem} from '@perun-web-apps/perun/models';
import {InviteMemberDialogComponent} from '../../../../shared/components/dialogs/invite-member-dialog/invite-member-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {SideMenuService} from '../../../../core/services/common/side-menu.service';
import {ActivatedRoute, Router} from '@angular/router';
import {GuiAuthResolver} from '@perun-web-apps/perun/services';
import { MembersManagerService, Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-vo-overview',
  templateUrl: './vo-overview.component.html',
  styleUrls: ['./vo-overview.component.scss']
})
export class VoOverviewComponent implements OnInit {

  // @HostBinding('class.router-component') true;

  constructor(
    private sideMenuService: SideMenuService,
    private voService: VosManagerService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected authResolver: GuiAuthResolver,
    private memberService: MembersManagerService
  ) {
  }

  vo: Vo;
  items: MenuItem[] = [];
  navItems: MenuItem[] = [];

  loading = false;

  dataSource = new MatTableDataSource<string>();
  displayedColumns = ['status', 'count'];

  statuses: string[] = ['VALID', 'INVALID', 'EXPIRED', 'DISABLED'];
  rowNames: string[] = ['Members', 'Valid', 'Invalid', 'Expired', 'Disabled'];
  membersCount: Map<string, number> = new Map<string, number>([
    ['members', 0],
    ['valid', 0],
    ['invalid', 0],
    ['expired', 0],
    ['disabled', 0]
    ]);

  ngOnInit(): void {
    this.loading = true;
    this.route.parent.params.subscribe(parentParams => {
      const voId = parentParams['voId'];

      this.voService.getVoById(voId).subscribe(vo => {
        this.vo = vo;
        this.dataSource = new MatTableDataSource<string>(this.rowNames);

        this.memberService.getMembersCount(this.vo.id).subscribe(count => {
          this.membersCount.set('members', count);
          this.getCount(this.statuses);

        }, () => this.loading = false);
      }, () => this.loading = false);
    });
  }

  getCount(statuses: string[]) {
    this.loading = true;
    if (statuses.length === 0) {
      this.initNavItems();
      this.loading = false;
      return
    }

    const status = statuses.pop();
    this.memberService.getMembersWithStatusCount(this.vo.id, status).subscribe(count => {
      this.membersCount.set(status.toLowerCase(), count);
      this.getCount(statuses);
    }, () => this.loading = false);
  }

  private initNavItems() {
    // Members
    if (this.authResolver.isAuthorized('getCompleteRichMembers_Vo_List<String>_policy', [this.vo])) {
      this.navItems.push({
        cssIcon: 'perun-user',
        url: `/organizations/${this.vo.id}/members`,
        label: 'MENU_ITEMS.VO.MEMBERS',
        style: 'vo-btn'
      });
    }

    // Groups
    if (this.authResolver.isAuthorized('getAllRichGroupsWithAttributesByNames_Vo_List<String>_policy', [this.vo])) {
      this.navItems.push({
        cssIcon: 'perun-group',
        url: `/organizations/${this.vo.id}/groups`,
        label: 'MENU_ITEMS.VO.GROUPS',
        style: 'vo-btn'
      });
    }

    // Resource management
    if (this.authResolver.isAuthorized('getRichResources_Vo_policy', [this.vo])) {
      this.navItems.push({
        cssIcon: 'perun-manage-facility',
        url: `/organizations/${this.vo.id}/resources`,
        label: 'MENU_ITEMS.VO.RESOURCES',
        style: 'vo-btn'
      });
    }

    // Applications
    if (this.authResolver.isAuthorized('getApplicationsForVo_Vo_List<String>_Boolean_policy',[this.vo])) {
      this.navItems.push({
        cssIcon: 'perun-applications',
        url: `/organizations/${this.vo.id}/applications`,
        label: 'MENU_ITEMS.VO.APPLICATIONS',
        style: 'vo-btn'
      });
    }

    // Sponsored members
    if (this.authResolver.isAuthorized('getSponsoredMembersAndTheirSponsors_Vo_policy', [this.vo])) {
      this.navItems.push({
        cssIcon: 'perun-user',
        url: `/organizations/${this.vo.id}/sponsoredMembers`,
        label: 'MENU_ITEMS.VO.SPONSORED_MEMBERS',
        style: 'vo-btn'
      });
    }

    // Attributes
    this.navItems.push({
      cssIcon: 'perun-attributes',
      url: `/organizations/${this.vo.id}/attributes`,
      label: 'MENU_ITEMS.VO.ATTRIBUTES',
      style: 'vo-btn'
    });

    // Settings
    if (this.authResolver.isManagerPagePrivileged(this.vo) ||
      this.authResolver.isAuthorized('getVoExtSources_Vo_policy', [this.vo]) ||
      this.authResolver.isThisVoAdminOrObserver(this.vo.id)) {
      this.navItems.push({
        cssIcon: 'perun-settings2',
        url: `/organizations/${this.vo.id}/settings`,
        label: 'MENU_ITEMS.VO.SETTINGS',
        style: 'vo-btn'
      });
    }
  }

  private initItems() {
    this.items = [
      {
        cssIcon: 'perun-invite-member',
        label: 'VO_DETAIL.OVERVIEW.INVITE_MEMBER',
        style: 'vo-btn',
        url: `/organizations/${this.vo.id}/invite-member`,
        clickAction: function (dialog: MatDialog, voId: number) {
          const config = getDefaultDialogConfig();
          config.width = '450px';
          config.data = {voId: voId};

          dialog.open(InviteMemberDialogComponent, config);
        }
      },
      {
        cssIcon: 'perun-service-identity',
        label: 'VO_DETAIL.OVERVIEW.CREATE_SERVICE_MEMBER',
        style: 'vo-btn',
        url: `/organizations/${this.vo.id}/create-service-member`,
        clickAction: function (dialog: MatDialog, voId: number) {
          return;
        }
      },
      {
        cssIcon: 'perun-manager',
        label: 'VO_DETAIL.OVERVIEW.ADD_MANAGER',
        style: 'vo-btn',
        url: `/organizations/${this.vo.id}/add-manager`,
        clickAction: function (dialog: MatDialog, voId: number) {
          return;
        }
      },
      {
        cssIcon: 'perun-group',
        label: 'VO_DETAIL.OVERVIEW.CREATE_GROUP',
        style: 'vo-btn',
        url: `/organizations/${this.vo.id}/create-group`,
        clickAction: function (dialog: MatDialog, voId: number) {
          return;
        }
      },
      {
        cssIcon: 'perun-create1',
        label: 'VO_DETAIL.OVERVIEW.ADD_MEMBER',
        style: 'vo-btn',
        url: `/organizations/${this.vo.id}/invite-member`,
        clickAction: function (dialog: MatDialog, voId: number) {
          return;
        }
      }
    ];
  }
}
