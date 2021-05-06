import { Component, OnInit } from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'perun-web-apps-login-screen-base',
  templateUrl: './login-screen-base.component.html',
  styleUrls: ['./login-screen-base.component.scss']
})
export class LoginScreenBaseComponent implements OnInit {

  constructor(
    private store: StoreService,
    private sanitizer: DomSanitizer,
  ) { }

  navBackgroundColor = this.store.get('theme', 'nav_bg_color');
  logoPadding = this.store.get('logo_padding');
  contentBackgroundColor = this.store.get('theme', 'content_bg_color');
  logo: any;

  ngOnInit(): void {
    this.logo = this.sanitizer.bypassSecurityTrustHtml(this.store.get('logo'));
  }

  getContentInnerMinHeight() {
    // 64 for nav (+48) when alert is shown
    // 210 for footer, 510 for footer on mobile

    const footerSpace = '0';
    return 'calc((100vh - 64px) + ' + footerSpace + 'px)';
  }
}
