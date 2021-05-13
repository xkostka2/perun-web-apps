import { Component, OnInit } from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-profile-login-screen-base',
  templateUrl: './profile-login-screen-base.component.html',
  styleUrls: ['./profile-login-screen-base.component.scss']
})
export class ProfileLoginScreenBaseComponent implements OnInit {
  contentBackgroundColor = this.store.get('theme', 'content_bg_color');

  constructor(
    private store:StoreService,
  ) { }

  ngOnInit(): void {
  }

  getContentHeight() {
    return 'calc(100vh - 64px - 180px)';
  }
}
