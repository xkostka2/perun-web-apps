import { Component, HostListener, OnInit } from '@angular/core';
import { InitAuthService, StoreService } from '@perun-web-apps/perun/services';
import { AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'perun-web-apps-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public static minWidth = 992;
  sidebarMode: 'over' | 'push' | 'side' = 'side';

  constructor(private store:StoreService,
              private attributesManagerService: AttributesManagerService,
              private translateService:TranslateService,
              private initAuth: InitAuthService) {
    this.getScreenSize();
  }

  sideMenuBgColor = this.store.get('theme', 'sidemenu_bg_color');
  contentBackgroundColor = this.store.get('theme', 'content_bg_color');
  footerHeight = 180;
  isLoginScreenShown: boolean;

  ngOnInit(): void {
    this.isLoginScreenShown = this.initAuth.isLoginScreenShown();
    if (this.isLoginScreenShown) {
      return;
    }
    this.attributesManagerService.getUserAttributes(this.store.getPerunPrincipal().userId).subscribe(atts =>{
     const prefLang = atts.find(elem => elem.friendlyName === 'preferredLanguage');
      if(prefLang && prefLang.value) {
        // @ts-ignore
        this.translateService.use(prefLang.value);
      }
    });
  }

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
