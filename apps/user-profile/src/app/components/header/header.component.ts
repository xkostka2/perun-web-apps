import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'perun-web-apps-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  label = this.storeService.get('header_label_en');

  @Output()
  sidenavToggle = new EventEmitter();

  @Input()
  hideToggle = false;

  @Input()
  disableLogo = false;

  bgColor = this.storeService.get('theme', 'nav_bg_color');
  textColor = this.storeService.get('theme', 'nav_text_color');
  iconColor = this.storeService.get('theme', 'nav_icon_color');

  constructor( private storeService: StoreService,
               private sanitizer: DomSanitizer,
               private translate: TranslateService) { }
  logo: any;

  ngOnInit() {
    this.translate.onLangChange.subscribe(lang => {
      this.label = this.storeService.get(`header_label_${lang.lang}`)
    })
    this.logo = this.sanitizer.bypassSecurityTrustHtml(this.storeService.get('logo'));
  }

  onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }
}
