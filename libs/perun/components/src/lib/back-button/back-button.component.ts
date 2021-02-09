import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent implements OnInit {

  constructor(
    private location: Location,
    private storeService: StoreService
  ) { }

  backButtonColor: string;

  ngOnInit() {
    this.backButtonColor = this.storeService.get('theme', 'backButtonColor');
  }

  goBack() {
    if (sessionStorage.getItem("onInitPage") === 'false'){
      this.location.back();
    }
  }
}
