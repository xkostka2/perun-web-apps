import { Component, OnInit } from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'perun-web-apps-footer-user-profile',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor(private storeService:StoreService,
              private translateService: TranslateService) { }

  items = [];
  copyrightItems = [];
  currentYear = (new Date()).getFullYear();

  headersTextColor = this.storeService.get('theme', 'footer_headers_text_color');
  linksTextColor = this.storeService.get('theme', 'footer_links_text_color');
  iconColor = this.storeService.get('theme', 'footer_icon_color');
  bgColor = this.storeService.get('theme', 'footer_bg_color');

  language = 'en';

  ngOnInit() {
    this.translateService.onLangChange.subscribe(lang => {
      this.language = lang.lang
    });
    this.items = this.storeService.get('footer', 'columns');
    this.copyrightItems = this.storeService.get('footer', 'copyright_items');
  }
}
