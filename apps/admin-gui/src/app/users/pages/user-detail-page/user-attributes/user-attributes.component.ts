import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { StoreService } from '@perun-web-apps/perun/services';
import {
  User
} from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-user-settings-attributes',
  templateUrl: './user-attributes.component.html',
  styleUrls: ['./user-attributes.component.scss']
})
export class UserAttributesComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(
    private route: ActivatedRoute,
    private store: StoreService,
    private authResolver: GuiAuthResolver
  ) {}

  userId: number;
  userFacilityAttAuth: boolean;

  ngOnInit() {
    this.route.parent.params.subscribe(params => {
      this.userId = params['userId'];
      if (this.userId === undefined) {
        this.userId = this.store.getPerunPrincipal().userId;
      }

      const user: User = {
        id: this.userId,
        beanName: 'User'
      }
      this.userFacilityAttAuth = this.authResolver.isAuthorized('getAssignedFacilities_User_policy', [user]);
    });
  }
}
