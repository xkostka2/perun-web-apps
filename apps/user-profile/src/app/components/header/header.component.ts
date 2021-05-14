import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'perun-web-apps-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor( private storeService: StoreService,
               private sanitizer: DomSanitizer) { }

  @Output()
  sidenavToggle = new EventEmitter();

  @Input()
  hideToggle = false;

  @Input()
  disableLogo = false;

  bgColor = this.storeService.get('theme', 'header_bg_color');
  textColor = this.storeService.get('theme', 'header_text_color');
  iconColor = this.storeService.get('theme', 'header_icon_color');

  label = this.storeService.get('header_label');
  logo: any;

  ngOnInit() {
    this.logo = this.sanitizer.bypassSecurityTrustHtml(this.storeService.get('logo'));
  }

  onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }
}
