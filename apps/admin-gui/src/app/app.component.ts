import { Component, HostListener, OnInit } from '@angular/core';
import { CacheHelperService } from './core/services/common/cache-helper.service';
import { StoreService } from '@perun-web-apps/perun/services';
import { PerunPrincipal } from '@perun-web-apps/perun/openapi';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private cache: CacheHelperService,
    private store: StoreService
  ) {

    this.cache.init();
    this.getScreenSize(null);
  }

  public static minWidth = 992;

  sidebarMode: 'over' | 'push' | 'side' = 'side';
  lastScreenWidth: number;

  principal: PerunPrincipal;
  isProduction = false;
  navBackgroundColor = this.store.get('theme', 'nav_bg_color');
  sideBarBorderColor = this.store.get('theme', 'sidemenu_border_color');
  contentBackgroundColor = this.store.get('theme', 'content_bg_color');

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.sidebarMode = this.isMobile() ? 'over' : 'side';

    this.lastScreenWidth = window.innerWidth;
  }

  isMobile(): boolean {
    return window.innerWidth <= AppComponent.minWidth;
  }

  ngOnInit(): void {
    this.isProduction = environment.production;
    this.principal = this.store.getPerunPrincipal();
  }

  getTopGap() {
    return environment.production ? 112 : 64;
  }

  getSideNavMarginTop() {
    return environment.production ? '112px' : '64px';
  }

  getSideNavMinHeight() {
    return environment.production ? 'calc(100vh - 112px)' : 'calc(100vh - 64px)';
  }

  getNavMenuTop() {
    return environment.production ? '48px' : '0';
  }

  getContentInnerMinHeight() {
    // 64 for nav (+48) when alert is shown
    // 210 for footer, 510 for footer on mobile

    let footerSpace = this.isMobile() ? '510' : '210';
    footerSpace = '0';
    return environment.production ? 'calc((100vh - 112px) + ' + footerSpace + 'px)' : 'calc((100vh - 64px) + ' + footerSpace + 'px)';
  }
}
