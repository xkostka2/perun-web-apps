import { Component, OnInit, Input } from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'perun-web-apps-login-screen-base',
  templateUrl: './login-screen-base.component.html',
  styleUrls: ['./login-screen-base.component.scss']
})
export class LoginScreenBaseComponent implements OnInit {

  constructor(
    private storeService: StoreService,
    private sanitizer: DomSanitizer,
  ) { }

  @Input()
  application: string;

  @Input()
  headerColorConfigLabel: string;

  @Input()
  headerTitle: string;

  textColor: string;

  headerBackgroundColor: string;
  logoPadding: string;
  contentBackgroundColor = this.storeService.get('theme', 'content_bg_color');
  logo: any;

  ngOnInit(): void {
    this.headerBackgroundColor = this.storeService.get('theme', this.headerColorConfigLabel);
    this.logo = this.sanitizer.bypassSecurityTrustHtml(this.storeService.get('logo'));
    !!this.headerTitle ? this.textColor = this.storeService.get('theme', 'header_text_color') : this.textColor = '';
    this.application === 'admin-gui' ? this.logoPadding = this.storeService.get('logo_padding'): this.logoPadding = '';
  }

  getContentInnerMinHeight() {
    // 64 for nav (+48) when alert is shown
    // 210 for footer, 510 for footer on mobile

    const footerSpace = '0';
    return 'calc((100vh - 64px) + ' + footerSpace + 'px)';
  }
}
