import { Component, Input, OnInit } from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';
import { NavigationEnd, Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { SideMenuItem, SideMenuItemsService } from '../../services/side-menu-items.service';

@Component({
  selector: 'perun-web-apps-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnInit {

  constructor(private sideMenuItemService: SideMenuItemsService,
              private storeService: StoreService,
              private router: Router) {
    this.currentUrl = router.url;

    router.events.subscribe((_: NavigationEnd) => {
      if (_ instanceof NavigationEnd) {
        this.currentUrl = _.url;
      }
    });
  }

  ngOnInit() {
    this.items = this.sideMenuItemService.getSideMenuItems();
  }

  private currentUrl: string;
  @Input()
  sideNav: MatSidenav;

  items: SideMenuItem[] = [];
  textColor = this.storeService.get('theme', 'sidemenu_text_color');
  iconColor = this.storeService.get('theme', 'sidemenu_item_icon_color');

  isActive(regexValue: string) {
    const regexp = new RegExp(regexValue);

    return regexp.test(this.currentUrl);
  }

  shouldHideMenu() {
    if (this.sideNav.mode === 'over') {
      this.sideNav.close();
    }
  }
}
