import {Component, Input} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';
import { PerunPrincipal } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-perun-nav-menu',
  templateUrl: './perun-nav.component.html',
  styleUrls: ['./perun-nav.component.scss']
})
export class PerunNavComponent {

  constructor() { }

  @Input()
  sideNav: MatSidenav;

  @Input()
  principal: PerunPrincipal;
}
