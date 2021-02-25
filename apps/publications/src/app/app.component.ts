import { Component, HostListener } from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  constructor(private store:StoreService) {
  }

  public static minWidth = 992;
  sidebarMode: 'over' | 'push' | 'side' = 'side';
  footerHeight = 180;

  sideMenuBgColor = this.store.get('theme', 'sidemenu_bg_color');
  contentBackgroundColor = this.store.get('theme', 'content_bg_color');

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.sidebarMode = this.isMobile() ? 'over' : 'side';
  }

  isMobile(): boolean {
    return window.innerWidth <= AppComponent.minWidth;
  }

  getContentHeight() {
    return 'calc(100vh - 64px - ' + this.footerHeight + 'px)';
  }
}
