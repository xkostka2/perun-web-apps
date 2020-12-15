 import {Component, HostBinding, OnInit} from '@angular/core';
import {SideMenuService} from '../../../../../core/services/common/side-menu.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MenuItem} from '@perun-web-apps/perun/models';
import { Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-vo-settings-overview',
  templateUrl: './vo-settings-overview.component.html',
  styleUrls: ['./vo-settings-overview.component.scss']
})
export class VoSettingsOverviewComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(
    private sideMenuService: SideMenuService,
    private voService: VosManagerService,
    private authResolver: GuiAuthResolver,
    protected route: ActivatedRoute,
    protected router: Router
  ) { }

  items: MenuItem[] = [];
  vo: Vo;
  loading = false;

  ngOnInit() {
    this.loading = true;
    this.route.parent.parent.params.subscribe(parentParams => {
      const voId = parentParams['voId'];

      this.voService.getVoById(voId).subscribe(vo => {
        this.vo = vo;

        this.initItems();
        this.loading = false;
      }, () => this.loading = false);
    });
  }

  private initItems() {
    this.items = [];

    // Membership
    if (this.authResolver.isThisVoAdminOrObserver(this.vo.id)) {
      this.items.push({
        cssIcon: 'perun-group',
        url: `/organizations/${this.vo.id}/settings/expiration`,
        label: 'MENU_ITEMS.VO.EXPIRATION',
        style: 'vo-btn'
      });
    }
    // Managers
    if (this.authResolver.isManagerPagePrivileged(this.vo)) {
      this.items.push({
        cssIcon: 'perun-manager',
        url: `/organizations/${this.vo.id}/settings/managers`,
        label: 'MENU_ITEMS.VO.MANAGERS',
        style: 'vo-btn'
      });
    }
    // Application forms
    if (this.authResolver.isThisVoAdminOrObserver(this.vo.id)) {
      this.items.push({
        cssIcon: 'perun-application-form',
        url: `/organizations/${this.vo.id}/settings/applicationForm`,
        label: 'MENU_ITEMS.VO.APPLICATION_FORM',
        style: 'vo-btn'
      });
    }
    // Notifications
    if (this.authResolver.isThisVoAdminOrObserver(this.vo.id)) {
      this.items.push({
        cssIcon: 'perun-notification',
        url: `/organizations/${this.vo.id}/settings/notifications`,
        label: 'MENU_ITEMS.VO.NOTIFICATIONS',
        style: 'vo-btn'
      });
    }
    // Ext sources
    if (this.authResolver.isAuthorized('getVoExtSources_Vo_policy', [this.vo])) {
      this.items.push({
        cssIcon: 'perun-external-sources',
        url: `/organizations/${this.vo.id}/settings/extsources`,
        label: 'MENU_ITEMS.VO.EXTSOURCES',
        style: 'vo-btn'
      });
    }
  }
}
