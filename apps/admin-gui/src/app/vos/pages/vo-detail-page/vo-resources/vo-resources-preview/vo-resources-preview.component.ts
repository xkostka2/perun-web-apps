import {Component, HostBinding, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SelectionModel} from '@angular/cdk/collections';
import { ResourcesManagerService, RichResource, Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { RemoveResourceDialogComponent } from '../../../../../shared/components/dialogs/remove-resource-dialog/remove-resource-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TABLE_VO_RESOURCES_LIST, TableConfigService } from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-vo-resources-preview',
  templateUrl: './vo-resources-preview.component.html',
  styleUrls: ['./vo-resources-preview.component.scss']
})
export class VoResourcesPreviewComponent implements OnInit {

  static id = 'VoResourcesPreviewComponent';

  @HostBinding('class.router-component') true;

  constructor(private resourcesManager: ResourcesManagerService,
              private voService: VosManagerService,
              private route: ActivatedRoute,
              private tableConfigService: TableConfigService,
              private dialog: MatDialog,
              private authResolver: GuiAuthResolver) {
  }

  vo: Vo;
  resources: RichResource[] = [];
  selected = new SelectionModel<RichResource>(true, []);

  loading: boolean;
  filterValue = '';
  pageSize: number;
  displayedColumns = [];

  tableId = TABLE_VO_RESOURCES_LIST;

  removeAuth: boolean;
  routeAuth = false;

  ngOnInit() {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);

    this.route.parent.parent.params.subscribe(parentParams => {
      const voId = parentParams['voId'];

      this.voService.getVoById(voId).subscribe(vo => {
        this.vo = vo;

        this.refreshTable();
      });
    });
  }

  setAuthRights() {
    this.removeAuth = this.authResolver.isAuthorized('deleteResource_Resource_policy',[this.vo]);

    if(this.resources.length !== 0){
      this.routeAuth = this.authResolver.isAuthorized('getResourceById_int_policy', [this.vo, this.resources[0]]);
    }

    this.displayedColumns = this.removeAuth ? ['select', 'id', 'role', 'name', 'facility', 'tags', 'description'] : ['id', 'role', 'name', 'facility', 'tags', 'description'];
  }

  refreshTable() {
    this.loading = true;
    this.resourcesManager.getRichResources(this.vo.id).subscribe(resources => {
      this.resources = resources;
      this.selected.clear();
      this.setAuthRights();
      this.loading = false;
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  deleteSelectedResources() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {theme: 'vo-theme', resources: this.selected.selected};

    const dialogRef = this.dialog.open(RemoveResourceDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
