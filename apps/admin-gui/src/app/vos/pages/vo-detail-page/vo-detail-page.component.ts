import { Component, OnInit } from '@angular/core';
import { SideMenuService } from '../../../core/services/common/side-menu.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SideMenuItemService } from '../../../shared/side-menu/side-menu-item.service';
import { fadeIn } from '@perun-web-apps/perun/animations';
import { Resource, Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import {
  EditFacilityResourceGroupVoDialogComponent,
  EditFacilityResourceGroupVoDialogOptions
} from '../../../shared/components/dialogs/edit-facility-resource-group-vo-dialog/edit-facility-resource-group-vo-dialog.component';
import { GuiAuthResolver, StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-vo-detail-page',
  templateUrl: './vo-detail-page.component.html',
  styleUrls: ['./vo-detail-page.component.scss'],
  animations: [
    fadeIn
  ]
})
export class VoDetailPageComponent implements OnInit {

  supportedEntities = ['Vo', 'Resource', 'Group', 'Member'];
  roles = this.store.getPerunPrincipal().roles;

  vo: Vo;
  editAuth: boolean;
  loading = false;

  constructor(
    private sideMenuService: SideMenuService,
    private voService: VosManagerService,
    private route: ActivatedRoute,
    private router: Router,
    private sideMenuItemService: SideMenuItemService,
    private dialog: MatDialog,
    private authResolver: GuiAuthResolver,
    private store: StoreService
  ) {
  }

  ngOnInit() {
    this.loading = true;
    console.log(this.store.getPerunPrincipal().roles);

    this.route.params.subscribe(params => {
      const voId = params['voId'];

      this.voService.getVoById(voId).subscribe(vo => {
        this.vo = vo;
        this.editAuth = this.authResolver.isAuthorized('updateVo_Vo_policy', [this.vo]);

        const sideMenuItem = this.sideMenuItemService.parseVo(vo);

        this.sideMenuService.setAccessMenuItems([sideMenuItem]);

        this.loading = false;
      }, () => this.loading = false);
    });
  }

  editVo() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = { theme: 'vo-theme', vo: this.vo, dialogType: EditFacilityResourceGroupVoDialogOptions.VO };
    const dialogRef = this.dialog.open(EditFacilityResourceGroupVoDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.voService.getVoById(this.vo.id).subscribe(vo => {
          this.vo = vo;
        });
      }
    });
  }
}
