import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {SideMenuItem} from '../side-menu.component';
import {NavigationEnd, Router} from '@angular/router';
import {openClose, rollInOut} from '../../animations/Animations';
import {MatSidenav} from '@angular/material/sidenav';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-side-menu-item',
  templateUrl: './side-menu-item.component.html',
  styleUrls: ['./side-menu-item.component.scss'],
  animations: [
    openClose,
    rollInOut
  ]
})
export class SideMenuItemComponent implements OnInit, OnChanges {

  private currentUrl: string;

  constructor(
    private router: Router,
    private store: StoreService
  ) {
    this.currentUrl = router.url;

    router.events.subscribe((_: NavigationEnd) => {
      if (_ instanceof NavigationEnd) {
        this.currentUrl = _.url;
      }
    });
  }

  @Input()
  item: SideMenuItem;

  @Input()
  index: number;

  @Input()
  showLinks: boolean;

  @ViewChild('collapse') collapseDiv: ElementRef;

  expanded = true;
  linkBgColor = this.store.get('theme', 'sidemenu_item_links_bg_color');
  linkTextColor = this.store.get('theme', 'sidemenu_item_links_text_color');
  iconColor = this.store.get('theme', 'sidemenu_item_icon_color');

  @Input()
  sideNav: MatSidenav;

  ngOnInit() {
    // this.expanded = this.showOpen;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // this.expanded = this.showOpen;
  }

  toggle() {
    if (this.item.baseLink !== undefined) {
      this.navigate(this.item.baseLink);
      // this.router.navigate(this.item.baseLink);
      // this.closeOnSmallDevice();
    } else {
      // this.expanded = !this.expanded;
    }
  }

  isActive(currentUrl: string, regexValue: string) {
    const regexp = new RegExp(regexValue);

    return regexp.test(currentUrl);
  }

  navigate(url) {
    if (this.sideNav.mode === 'over') {
      this.sideNav.close().then(() => this.router.navigate(url));
    } else {
      this.router.navigate(url);
    }
  }
}
