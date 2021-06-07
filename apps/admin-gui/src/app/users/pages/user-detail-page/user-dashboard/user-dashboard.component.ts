import { Component, HostBinding, OnInit } from '@angular/core';
import {
  FacilitiesManagerService,
  ResourcesManagerService,
  User,
  UsersManagerService
} from '@perun-web-apps/perun/openapi';
import {
  ApiRequestConfigurationService,
  GuiAuthResolver,
  NotificatorService,
  StoreService
} from '@perun-web-apps/perun/services';
import { SideMenuService } from '../../../../core/services/common/side-menu.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MailChangeFailedDialogComponent } from '@perun-web-apps/perun/dialogs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-perun-web-apps-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(private userManager: UsersManagerService,
              private storeService: StoreService,
              private guiAuthResolver: GuiAuthResolver,
              private facilitiesService: FacilitiesManagerService,
              private resourcesService: ResourcesManagerService,
              private sideMenuService: SideMenuService,
              private route: ActivatedRoute,
              private router: Router,
              private notificator: NotificatorService,
              public translateService: TranslateService,
              private dialog: MatDialog,
              private apiRequestConfiguration: ApiRequestConfigurationService
  ) {
    translateService.get('USER_DETAIL.DASHBOARD.MAIL_CHANGE_SUCCESS').subscribe(res => this.mailSuccessMessage = res);
  }


  user: User;
  roles: { [key: string]: { [key: string]: Array<number>; }; } = {};
  userProfileUrl = '';
  roleNames: string[];
  isOnlySelfRole = false;
  rightSettingOpened = false;
  recentlyViewedShow = true;
  rolesToHide: string[] = [];
  allowedRoles = ['VOADMIN', 'GROUPADMIN', 'FACILITYADMIN', 'SPONSOR', 'RESOURCEADMIN', 'TOPGROUPCREATOR',
    'VOOBSERVER', 'GROUPOBSERVER', 'FACILITYOBSERVER', 'RESOURCEOBSERVER'];
  mailSuccessMessage: string;

  ngOnInit() {
    this.validatePreferredMailChange();

    this.user = this.storeService.getPerunPrincipal().user;
    this.roles = this.storeService.getPerunPrincipal().roles;
    this.userProfileUrl = this.storeService.get('user_profile_url');
    const allUserRoles = Object.keys(this.roles);
    this.isOnlySelfRole = allUserRoles.toString() === ['SELF'].toString();
    this.roleNames = this.allowedRoles.filter(value => {
      return allUserRoles.includes(value);
    });
    this.getDashboardSettings();
    this.sideMenuService.setHomeItems([]);
  }

  private validatePreferredMailChange() {
    const params = this.route.snapshot.queryParamMap;
    const token = params.get('token');
    const u = params.get('u');
    if (token && u) {
      this.apiRequestConfiguration.dontHandleErrorForNext();
      this.userManager.validatePreferredEmailChangeWithToken(token, Number.parseInt(u, 10)).subscribe(() => {
        this.notificator.showSuccess(this.mailSuccessMessage);
        this.router.navigate([], { replaceUrl: true });
      }, () => {
        const config = getDefaultDialogConfig();
        config.width = '600px';

        const dialogRef = this.dialog.open(MailChangeFailedDialogComponent, config);
        dialogRef.afterClosed().subscribe(() => {
          this.getDashboardSettings();
        });
      });
    }
  }

  goToUserProfile() {
    window.open(this.userProfileUrl);
  }

  recentlyViewedChanged() {
    localStorage.setItem('showRecentlyViewed', JSON.stringify(this.recentlyViewedShow));
  }

  private getDashboardSettings() {
    const recentlyViewedShow = JSON.parse(localStorage.getItem('showRecentlyViewed'));
    (recentlyViewedShow === null) ? this.recentlyViewedShow = true : this.recentlyViewedShow = recentlyViewedShow;

    const rolesToHide = JSON.parse(localStorage.getItem('rolesToHide'));
    (rolesToHide === null) ? this.rolesToHide = [] : this.rolesToHide = rolesToHide;
  }

  changeRoleView(roleName: string) {
    if (!this.isRoleShowed(roleName)) {
      this.rolesToHide = this.rolesToHide.filter(obj => obj !== roleName);
    } else {
      const newRolesTohide = [];
      for (const role of this.roleNames) {
        if (!this.isRoleShowed(role)) {
          newRolesTohide.push(role);
        }
        if (role === roleName) {
          newRolesTohide.push(role);
        }
      }
      this.rolesToHide = newRolesTohide;
    }
    localStorage.setItem('rolesToHide', JSON.stringify(this.rolesToHide));
  }

  isRoleShowed(roleName: string): boolean {
    for (const role of this.rolesToHide) {
      if (role === roleName) {
        return false;
      }
    }
    return true;
  }
}
