import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Resource,
  ResourcesManagerService, Service
} from '@perun-web-apps/perun/openapi';
import { TABLE_RESOURCE_ASSIGNED_SERVICES, TableConfigService } from '@perun-web-apps/config/table-config';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AssignServiceToResourceDialogComponent } from '../../../../shared/components/dialogs/assign-service-to-resource-dialog/assign-service-to-resource-dialog.component';
import { RemoveServiceFromResourceDialogComponent } from '../../../../shared/components/dialogs/remove-service-from-resource-dialog/remove-service-from-resource-dialog.component';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-perun-web-apps-resource-assigned-services',
  templateUrl: './resource-assigned-services.component.html',
  styleUrls: ['./resource-assigned-services.component.scss']
})
export class ResourceAssignedServicesComponent implements OnInit {

  resourceId: number;
  resource: Resource;
  assignedServices: Service[] = [];
  selected = new SelectionModel<Service>(true, []);
  loading: boolean;
  tableId = TABLE_RESOURCE_ASSIGNED_SERVICES;
  pageSize: number;
  filterValue = '';
  loadingResource: boolean;
  assignServiceAuth: boolean;
  removeServiceAuth: boolean;
  serviceRoutingAuth: boolean;
  displayedColumns = ['select', 'id', 'name', 'enabled', 'script', 'description'];

  constructor(private route: ActivatedRoute,
              private resourcesManager: ResourcesManagerService,
              private tableConfigService: TableConfigService,
              private dialog: MatDialog,
              public guiAuthResolver: GuiAuthResolver) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.route.parent.params.subscribe(parentParams => {
      this.resourceId = parentParams['resourceId'];
      this.resourcesManager.getResourceById(this.resourceId).subscribe(resource => {
        this.resource = resource;
        this.getDataForAuthorization();
        this.loadAllServices();
      });
    });
  }


  loadAllServices() {
    this.loading = true;
    this.resourcesManager.getAssignedServicesToResource(this.resourceId).subscribe(assignedServices => {
      this.assignedServices = assignedServices;
      this.selected.clear();
      this.loading = false;
    });
  }

  addService() {
    const config = getDefaultDialogConfig();
    config.width = '800px';
    config.data = { theme: 'resource-theme', resourceId: this.resourceId };

    const dialogRef = this.dialog.open(AssignServiceToResourceDialogComponent, config);
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.loadAllServices();
      }
    });
  }

  removeServices() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = { theme: 'resource-theme', resourceId: this.resourceId, services: this.selected.selected };

    const dialogRef = this.dialog.open(RemoveServiceFromResourceDialogComponent, config);
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.loadAllServices();
      }
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  getDataForAuthorization() {
    this.assignServiceAuth = this.guiAuthResolver.isAuthorized('assignServices_Resource_List<Service>_policy', [this.resource]);
    this.removeServiceAuth = this.guiAuthResolver.isAuthorized('removeServices_Resource_List<Service>_policy', [this.resource]);
    this.displayedColumns = this.removeServiceAuth ? ['select', 'id', 'name', 'enabled', 'script', 'description'] : ['id', 'name', 'enabled', 'script', 'description'];
    this.serviceRoutingAuth = this.guiAuthResolver.isPerunAdmin();
  }
}
