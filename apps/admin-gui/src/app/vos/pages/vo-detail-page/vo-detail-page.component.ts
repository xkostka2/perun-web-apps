import { Component, OnInit } from '@angular/core';
import { SideMenuService } from '../../../core/services/common/side-menu.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SideMenuItemService } from '../../../shared/side-menu/side-menu-item.service';
import { fadeIn } from '@perun-web-apps/perun/animations';
import { Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { addRecentlyVisited, addRecentlyVisitedObject, getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import {
  EditFacilityResourceGroupVoDialogComponent,
  EditFacilityResourceGroupVoDialogOptions
} from '@perun-web-apps/perun/dialogs';
import { RemoveVoDialogComponent } from '../../../shared/components/dialogs/remove-vo-dialog/remove-vo-dialog.component';
import {
  DeleteEntityDialogComponent,
  DeleteEntityType
} from '../../../shared/components/dialogs/delete-entity-dialog/delete-entity-dialog.component';

@Component({
  selector: 'app-vo-detail-page',
  templateUrl: './vo-detail-page.component.html',
  styleUrls: ['./vo-detail-page.component.scss'],
  animations: [
    fadeIn
  ]
})
export class VoDetailPageComponent implements OnInit {

  constructor(
    private sideMenuService: SideMenuService,
    private voService: VosManagerService,
    private route: ActivatedRoute,
    private router: Router,
    private sideMenuItemService: SideMenuItemService,
    private dialog: MatDialog,
    private authResolver: GuiAuthResolver
  ) {
  }

  vo: Vo;
  editAuth: boolean;
  loading = false;
  removeAuth: boolean;

  ngOnInit() {
    this.loading = true;
    this.route.params.subscribe(params => {
      const voId = params['voId'];

      this.voService.getVoById(voId).subscribe(vo => {
        this.vo = vo;
        this.editAuth = this.authResolver.isAuthorized('updateVo_Vo_policy', [this.vo]);
        this.removeAuth = this.authResolver.isAuthorized('deleteVo_Vo_policy', [this.vo]);

        const sideMenuItem = this.sideMenuItemService.parseVo(vo);

        this.sideMenuService.setAccessMenuItems([sideMenuItem]);

        addRecentlyVisited('vos', this.vo);
        addRecentlyVisitedObject(this.vo);

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

  removeVo() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      theme: 'vo-theme',
      entity: this.vo,
      entityType: DeleteEntityType.VO
    };
    const dialogRef = this.dialog.open(DeleteEntityDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['']);
      }
    });
  }
}
