import { Component, Input, OnInit} from '@angular/core';
import { AuthService, StoreService } from '@perun-web-apps/perun/services';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSidenav } from '@angular/material/sidenav';
import { PerunPrincipal } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor( private storeService: StoreService,
               private authService: AuthService,
               private sanitizer: DomSanitizer) { }

  @Input()
  sideNav: MatSidenav;

  principal: PerunPrincipal;

  bgColor = this.storeService.get('theme', 'nav_bg_color');
  textColor = this.storeService.get('theme', 'nav_text_color');
  iconColor = this.storeService.get('theme', 'nav_icon_color');

  logo: any;

  ngOnInit() {
    this.principal = this.storeService.getPerunPrincipal();
    this.logo = this.sanitizer.bypassSecurityTrustHtml(this.storeService.get('logo'));
  }

  onLogOut() {
    this.authService.logout();
  }

}
