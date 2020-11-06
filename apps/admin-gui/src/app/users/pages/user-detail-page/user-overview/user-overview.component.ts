import { Component, HostBinding, OnInit } from '@angular/core';
import {MenuItem} from '@perun-web-apps/perun/models';
import {
  User
} from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-user-overview',
  templateUrl: './user-overview.component.html',
  styleUrls: ['./user-overview.component.scss']
})
export class UserOverviewComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor() { }

  navItems: MenuItem[] = [];
  user: User;
  path: string;

  ngOnInit() {
    this.initNavItems();
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
        style: 'user-btn'
      });
  }
}
