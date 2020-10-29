import { Component, HostBinding, OnInit } from '@angular/core';
import {MenuItem} from '@perun-web-apps/perun/models';
import {
  User, UsersManagerService
} from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-overview',
  templateUrl: './user-overview.component.html',
  styleUrls: ['./user-overview.component.scss']
})
export class UserOverviewComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(private userService: UsersManagerService,
              private route: ActivatedRoute) { }

  navItems: MenuItem[] = [];
  user: User;
  path: string;

  ngOnInit() {
    this.route.params.subscribe(params => {
      if(params['userId'] !== undefined) {
        this.userService.getUserById(params['userId']).subscribe(user => {
          this.user = user;

          this.initNavItems();
        });
      } else {
        this.initNavItems();
      }
    });
  }

  private initNavItems() {
    this.navItems = [
      {
        cssIcon: 'perun-vo',
        url: `organizations`,
        label: 'MENU_ITEMS.ADMIN.ORGANIZATIONS',
        style: 'user-btn'
      },
      {
        cssIcon: 'perun-group',
        url: `groups`,
        label: 'MENU_ITEMS.ADMIN.GROUPS',
        style: 'user-btn'
      },
      ];
    if (window.location.pathname.startsWith('/admin')) {
      this.navItems.push({
          cssIcon: 'perun-group',
          url: `identities`,
          label: 'MENU_ITEMS.USER.IDENTITIES',
          style: 'user-btn'
        },
        {
          cssIcon: 'perun-resource',
          url: `resources`,
          label: "MENU_ITEMS.USER.RESOURCES",
          style: 'user-btn'
        });
    }
    this.navItems.push({
      cssIcon: 'perun-attributes',
      url: `attributes`,
      label: 'MENU_ITEMS.USER.ATTRIBUTES',
      style: 'user-btn'
    });
    this.navItems.push(
      {
        cssIcon: 'perun-settings2',
        url: `settings`,
        label: 'MENU_ITEMS.ADMIN.SETTINGS',
        style: 'user-btn',
        intermediateBtn: true,
        children: this.getChildren()
      });
  }

  getChildren(): {label: string, url: string}[]{
    const children: {label: string, url: string}[] = [];

    if (window.location.pathname.startsWith('/admin')){
      if(this.user.serviceUser){
        children.push({
          label: 'MENU_ITEMS.USER.ASSOCIATED_USERS',
          url: 'settings/associated-users'
        });
      } else {
        children.push({
          label: 'MENU_ITEMS.USER.SERVICE_IDENTITIES',
          url: 'settings/service-identities'
        });
      }
      children.push({
        label: 'MENU_ITEMS.USER.ROLES',
        url: 'settings/roles'
      })
    } else {
      children.push({
        label: 'MENU_ITEMS.USER.PASSWORD_RESET',
        url: 'settings/passwordReset'
      });
      children.push({
        label: 'MENU_ITEMS.USER.GUI_CONFIG',
        url: 'settings/guiConfig'
      })
    }

    return children
  }
}
