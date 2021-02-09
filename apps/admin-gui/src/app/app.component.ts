import { Component, HostListener, OnInit } from '@angular/core';
import { CacheHelperService } from './core/services/common/cache-helper.service';
import { StoreService } from '@perun-web-apps/perun/services';
import { PerunPrincipal } from '@perun-web-apps/perun/openapi';
import { interval } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { NewVersionDialogComponent } from './shared/components/dialogs/new-version-dialog/new-version-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { version } from '../../../../package.json';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private cache: CacheHelperService,
    private store: StoreService,
    private http: HttpClient,
    private dialog:MatDialog,
    private router: Router
  ) {

    this.cache.init();
    this.getScreenSize(null);
  }

  public static minWidth = 992;

  sidebarMode: 'over' | 'push' | 'side' = 'side';
  lastScreenWidth: number;

  principal: PerunPrincipal;
  navBackgroundColor = this.store.get('theme', 'nav_bg_color');
  sideBarBorderColor = this.store.get('theme', 'sidemenu_border_color');
  contentBackgroundColor = this.store.get('theme', 'content_bg_color');
  sideMenubackgroundColor = this.store.get('theme', 'sidemenu_bg_color');

  displayWarning: boolean = this.store.get('display_warning');
  warningMessage: string = this.store.get('warning_message');

  version = version;

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.sidebarMode = this.isMobile() ? 'over' : 'side';

    this.lastScreenWidth = window.innerWidth;
  }

  isMobile(): boolean {
    return window.innerWidth <= AppComponent.minWidth;
  }

  ngOnInit(): void {
    if (sessionStorage.getItem("initPage") === null) {
      sessionStorage.setItem("initPage", location.pathname);
      sessionStorage.setItem("onInitPage", 'true');
    }
    this.store.setInitialPageId(1);
    this.principal = this.store.getPerunPrincipal();
    this.loadAppVersion();
    interval(30000).subscribe(() => {
      this.loadAppVersion();
    });
    this.router.events
      .pipe(
        filter(
          ( event ) => {
            return( event instanceof NavigationStart );
          }
        )
      )
      .subscribe(
        ( event: NavigationStart ) => {
          //TODO FIX this method
          this.updateInitAccessedPage(event);
        });
  }

  //TODO fix this method
  // only relevant in situation when user enters app on other than home page
  // this method can falsely evaluate page as initial in this scenario:
  // user accesses page A with url 'abc', page A is the initial page,
  // user than navigates through application
  // to page B with same url 'abc', user reloads application on page B
  // continues to navigate through application
  // if he accesses page B before page A (using forward/back buttons)
  // page B will be falsely evaluated as initial
  updateInitAccessedPage(event) {
    if (event.url === sessionStorage.getItem("initPage")) {
      if (event.navigationTrigger === "imperative" && event.id !== this.store.getInitialPageId()) {
        sessionStorage.setItem("onInitPage", 'false');
      }
      if(event.navigationTrigger === 'popstate'){
        if(event.restoredState.navigationId === this.store.getInitialPageId()) {
          sessionStorage.setItem("onInitPage", 'true');
          this.store.setInitialPageId(event.id);
        } else {
          sessionStorage.setItem("onInitPage", 'false');
        }
      }
    } else {
      sessionStorage.setItem("onInitPage", 'false');
    }
  }

  loadAppVersion() {
    const httpHeaders = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    this.http.get('/assets/config/version.json', { headers: httpHeaders })
      .subscribe(result => {
        const recentVersion = result['version'];
        if (recentVersion) {
          if (this.version && recentVersion !== 'SNAPSHOT' && this.version !== recentVersion) {
            const config = getDefaultDialogConfig();
            this.dialog.open(NewVersionDialogComponent,config);
          } else {
            this.version = recentVersion;
          }
        }
      }, () => {
      });
  }

  getTopGap() {
    return this.displayWarning ? 112 : 64;
  }

  getSideNavMarginTop() {
    return this.displayWarning ? '112px' : '64px';
  }

  getSideNavMinHeight() {
    return this.displayWarning ? 'calc(100vh - 112px)' : 'calc(100vh - 64px)';
  }

  getNavMenuTop() {
    return this.displayWarning ? '48px' : '0';
  }

  getContentInnerMinHeight() {
    // 64 for nav (+48) when alert is shown
    // 210 for footer, 510 for footer on mobile

    const footerSpace = '0';
    return this.displayWarning ? 'calc((100vh - 112px) + ' + footerSpace + 'px)' : 'calc((100vh - 64px) + ' + footerSpace + 'px)';
  }
}
