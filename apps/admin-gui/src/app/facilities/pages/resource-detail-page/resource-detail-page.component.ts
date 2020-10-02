import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fadeIn } from '@perun-web-apps/perun/animations';
import { SideMenuService } from '../../../core/services/common/side-menu.service';
import { SideMenuItemService } from '../../../shared/side-menu/side-menu-item.service';
import {
  FacilitiesManagerService,
  ResourcesManagerService,
  RichResource,
  VosManagerService
} from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import {
  EditFacilityResourceGroupVoDialogComponent,
  EditFacilityResourceGroupVoDialogOptions
} from '../../../shared/components/dialogs/edit-facility-resource-group-vo-dialog/edit-facility-resource-group-vo-dialog.component';
import { Resource } from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver, StoreService } from '@perun-web-apps/perun/services';
import { GetResourceRoutePipe } from '@perun-web-apps/perun/pipes';

@Component({
  selector: 'app-resource-detail-page',
  templateUrl: './resource-detail-page.component.html',
  styleUrls: ['./resource-detail-page.component.scss'],
  animations: [
    fadeIn
  ]
})
export class ResourceDetailPageComponent implements OnInit {

  supportedEntities = ['Vo','Facility', 'Resource'];

  resource: RichResource;
  facilityLinkAuth: boolean;
  editResourceAuth: boolean;
  voLinkAuth: boolean;
  baseUrl = '';
  loading = false;
  roles = this.store.getPerunPrincipal().roles;

  constructor(
    private route: ActivatedRoute,
    private facilityManager: FacilitiesManagerService,
    private vosManagerService: VosManagerService,
    private resourcesManager: ResourcesManagerService,
    private sideMenuService: SideMenuService,
    private sideMenuItemService: SideMenuItemService,
    private dialog: MatDialog,
    public guiAuthResolver:GuiAuthResolver,
    private store: StoreService
  ) {
  }

  ngOnInit() {
    this.loading = true;
    this.route.params.subscribe(params => {
      const resourceId = params['resourceId'];

      this.resourcesManager.getRichResourceById(resourceId).subscribe(resource => {
        this.resource = resource;
        this.setAuth();
        if (this.route.parent.snapshot.url[0].path === 'facilities') {
          this.baseUrl = new GetResourceRoutePipe().transform(resource, false);
          this.facilityManager.getFacilityById(resource.facilityId).subscribe(facility => {
            const facilityItem = this.sideMenuItemService.parseFacility(facility);
            const resourceItem = this.sideMenuItemService.parseResource(resource, false);
            this.sideMenuService.setFacilityMenuItems([facilityItem, resourceItem]);
            this.loading = false;
          }, () => this.loading = false);
        } else {
          this.baseUrl = new GetResourceRoutePipe().transform(resource, true);
          this.vosManagerService.getVoById(resource.voId).subscribe(vo => {
            const voItem = this.sideMenuItemService.parseVo(vo);
            const resourceItem = this.sideMenuItemService.parseResource(resource, true);

            this.sideMenuService.setAccessMenuItems([voItem, resourceItem]);
            this.loading = false;
          }, () => this.loading = false);
        }
      });
    });
  }

  private setAuth() {
    this.facilityLinkAuth = this.guiAuthResolver.isAuthorized('getFacilityById_int_policy',[this.resource]);
    this.editResourceAuth = this.guiAuthResolver.isAuthorized('updateResource_Resource_policy',[this.resource]);
    this.voLinkAuth = this.guiAuthResolver.isAuthorized('getVoById_int_policy',[this.resource]);
  }

  editResource() {
    let resourceForEdit: Resource;
    this.resourcesManager.getResourceById(this.resource.id).subscribe(resource => {
      resourceForEdit = resource;
      const config = getDefaultDialogConfig();
      config.width = '450px';
      config.data = {
        theme: 'resource-theme',
        resource: resourceForEdit,
        dialogType: EditFacilityResourceGroupVoDialogOptions.RESOURCE
      };
      const dialogRef = this.dialog.open(EditFacilityResourceGroupVoDialogComponent, config);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.resourcesManager.getRichResourceById(this.resource.id).subscribe(newResource => {
            this.resource = newResource;
          });
        }
      });
    });
  }
}
