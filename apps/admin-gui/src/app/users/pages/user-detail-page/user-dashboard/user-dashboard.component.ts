import { Component, HostBinding, OnInit } from '@angular/core';
import {
  FacilitiesManagerService,
  ResourcesManagerService,
  User,
  UsersManagerService
} from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver, StoreService } from '@perun-web-apps/perun/services';
import { SideMenuService } from '../../../../core/services/common/side-menu.service';

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
              private sideMenuService: SideMenuService) { }


  user: User;
  roles: { [key: string]: { [key: string]: Array<number>; }; } = {};
  userProfileUrl = '';
  roleNames: string[];
  isOnlySelfRole = false;
  rightSettingOpened = false;
  recentlyViewedShow = true;
  rolesToShow: string[] = [];
  allowedRoles = ['VOADMIN', 'GROUPADMIN', 'FACILITYADMIN', 'SPONSOR', 'RESOURCEADMIN', 'TOPGROUPCREATOR',
    'VOOBSERVER', 'GROUPOBSERVER', 'FACILITYOBSERVER', 'RESOURCEOBSERVER'];

  ngOnInit() {
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

  goToUserProfile() {
    window.open(this.userProfileUrl);
  }

  recentlyViewedChanged() {
    localStorage.setItem('showRecentlyViewed', JSON.stringify(this.recentlyViewedShow));
  }

  private getDashboardSettings() {
    const recentlyViewedShow = JSON.parse(localStorage.getItem('showRecentlyViewed'));
    (recentlyViewedShow === null) ? this.recentlyViewedShow = true : this.recentlyViewedShow = recentlyViewedShow;

    const rolesToShow = JSON.parse(localStorage.getItem('rolesToShow'));
    (rolesToShow === null) ? this.rolesToShow = this.roleNames : this.rolesToShow = rolesToShow;
  }

  changeRoleView(roleName: string) {
    if (this.isRoleShowed(roleName)) {
      this.rolesToShow = this.rolesToShow.filter(obj => obj !== roleName);
    } else {
      const newRolesToShow = [];
      for (const role of this.roleNames) {
        if (this.isRoleShowed(role)) {
          newRolesToShow.push(role);
        }
        if (role === roleName) {
          newRolesToShow.push(role);
        }
      }
      this.rolesToShow = newRolesToShow;
    }
    localStorage.setItem('rolesToShow', JSON.stringify(this.rolesToShow));
  }

  isRoleShowed(roleName: string): boolean {
    for (const role of this.rolesToShow) {
      if (role === roleName) {
        return true;
      }
    }
    return false;
  }
}
