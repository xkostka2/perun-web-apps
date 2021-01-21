import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fadeIn } from '@perun-web-apps/perun/animations';
import { SideMenuService } from '../../../core/services/common/side-menu.service';
import { SideMenuItemService } from '../../../shared/side-menu/side-menu-item.service';
import { FacilitiesManagerService, Facility } from '@perun-web-apps/perun/openapi';
import { addRecentlyVisited, addRecentlyVisitedObject, getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import {
  EditFacilityResourceGroupVoDialogComponent,
  EditFacilityResourceGroupVoDialogOptions
} from '@perun-web-apps/perun/dialogs';

@Component({
  selector: 'app-facility-detail-page',
  templateUrl: './facility-detail-page.component.html',
  styleUrls: ['./facility-detail-page.component.scss'],
  animations: [
    fadeIn
  ]
})
export class FacilityDetailPageComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private facilityManager: FacilitiesManagerService,
    private route: ActivatedRoute,
    private sideMenuService: SideMenuService,
    private sideMenuItemService: SideMenuItemService,
    public guiAuthResolver:GuiAuthResolver
  ) {
  }

  facility: Facility;
  editFacilityAuth = false;
  loading = false;

  ngOnInit() {
    this.loading = true;
    this.route.params.subscribe(params => {
      const facilityId = params['facilityId'];

      this.facilityManager.getFacilityById(facilityId).subscribe(facility => {
        this.facility = facility;
        const facilityItem = this.sideMenuItemService.parseFacility(facility);

        this.sideMenuService.setFacilityMenuItems([facilityItem]);

        this.editFacilityAuth = this.guiAuthResolver.isAuthorized('updateFacility_Facility_policy',[this.facility]);

        addRecentlyVisited('facilities', this.facility);
        addRecentlyVisitedObject(this.facility);
        this.loading = false;
      }, () => this.loading = false);
    });
  }

  editFacility() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      theme: 'facility-theme',
      facility: this.facility,
      dialogType: EditFacilityResourceGroupVoDialogOptions.FACILITY
    };
    const dialogRef = this.dialog.open(EditFacilityResourceGroupVoDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.facilityManager.getFacilityById(this.facility.id).subscribe(facility => {
          this.facility = facility;
        });
      }
    });
  }
}
