import {Component, HostBinding, OnInit} from '@angular/core';
import {MenuItem} from '@perun-web-apps/perun/models';
import { ActivatedRoute } from '@angular/router';
import { UsersManagerService } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-user-settings-overview',
  templateUrl: './user-settings-overview.component.html',
  styleUrls: ['./user-settings-overview.component.scss']
})
export class UserSettingsOverviewComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(private route: ActivatedRoute,
              private userManager: UsersManagerService
  ) { }

  navItems: MenuItem[] = [];
  path: string;
  isServiceUser: boolean;
  loading = false;

  ngOnInit() {
    if(window.location.pathname.startsWith('/admin')){
      this.loading = true;
      this.route.parent.parent.params.subscribe(params => {
        const userId = params["userId"];

        this.userManager.getUserById(userId).subscribe(user => {
          this.isServiceUser = user.serviceUser;
          this.initNavItems();
          this.loading = false;
        }, () => this.loading = false);
      });
    } else {
      this.initNavItems();
    }
  }

  private initNavItems() {
    this.navItems = [
    ];
    // if at user profile, add user gui config item
    // if at admin profile, add service identities
    if (!window.location.pathname.startsWith('/admin')) {
      this.navItems.push(
        {
          cssIcon: 'perun-settings2',
          url: 'passwordReset',
          label: 'MENU_ITEMS.USER.PASSWORD_RESET',
          style: 'user-btn'
        },
        {
          cssIcon: 'perun-settings2',
          url: 'guiConfig',
          label: 'MENU_ITEMS.USER.GUI_CONFIG',
          style: 'user-btn'
        });
    } else {
      if(this.isServiceUser){
        this.navItems.push({
          cssIcon: 'perun-service-identity',
          url:`associated-users`,
          label: 'MENU_ITEMS.USER.ASSOCIATED_USERS',
          style: 'user-btn'
        });
      } else {
        this.navItems.push({
          cssIcon: 'perun-service-identity',
          url:`service-identities`,
          label: 'MENU_ITEMS.USER.SERVICE_IDENTITIES',
          style: 'user-btn'
        });
      }
    }
  }
}
