import {Component, HostBinding, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import {TranslateService} from '@ngx-translate/core';
import { AttributesListComponent } from '@perun-web-apps/perun/components';
import {SelectionModel} from '@angular/cdk/collections';
import {
  DeleteAttributeDialogComponent
} from '../../../../shared/components/dialogs/delete-attribute-dialog/delete-attribute-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import {
  Attribute,
  AttributesManagerService, Resource, ResourcesManagerService
} from '@perun-web-apps/perun/openapi';
import { PageEvent } from '@angular/material/paginator';
import {
  TABLE_ATTRIBUTES_SETTINGS,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { EditAttributeDialogComponent } from '@perun-web-apps/perun/dialogs';
import { CreateAttributeDialogComponent } from '../../../../shared/components/dialogs/create-attribute-dialog/create-attribute-dialog.component';

@Component({
  selector: 'app-resource-attributes',
  templateUrl: './resource-attributes.component.html',
  styleUrls: ['./resource-attributes.component.scss']
})
export class ResourceAttributesComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(private attributesManager: AttributesManagerService,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private notificator: NotificatorService,
              private tableConfigService: TableConfigService,
              private translate: TranslateService,
              private authResolver: GuiAuthResolver,
              private resourceManager: ResourcesManagerService) {
    this.translate.get('RESOURCE_DETAIL.SETTINGS.ATTRIBUTES.SUCCESS_SAVE').subscribe(value => this.saveSuccessMessage = value);
    this.translate.get('RESOURCE_DETAIL.SETTINGS.ATTRIBUTES.SUCCESS_DELETE').subscribe(value => this.deleteSuccessMessage = value);
  }

  @ViewChild('list')
  list: AttributesListComponent;

  attributes: Attribute[] = [];
  selection = new SelectionModel<Attribute>(true, []);
  resourceId: number;
  resource: Resource;
  saveSuccessMessage: string;
  deleteSuccessMessage: string;

  resourceGroupAttAuth: boolean;
  resourceMemberAttAuth: boolean;

  loading: boolean;
  filterValue = '';
  tableId = TABLE_ATTRIBUTES_SETTINGS;
  pageSize: number;

  ngOnInit() {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.route.parent.params.subscribe(params => {
      this.resourceId = parseInt(params['resourceId'], 10);

      this.resourceManager.getResourceById(this.resourceId).subscribe(resource => {
        this.resource = resource;

        this.resourceGroupAttAuth = this.authResolver.isAuthorized('getAssignedGroups_Resource_policy', [this.resource]);
        this.resourceMemberAttAuth = this.authResolver.isAuthorized('getAssignedRichMembers_Resource_policy', [this.resource]);

        this.refreshTable();
      });
    });
  }

  onDelete() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      entityId: this.resourceId,
      entity: 'resource',
      attributes: this.selection.selected,
      theme: 'resource-theme'
    };

    const dialogRef = this.dialog.open(DeleteAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  onSave() {
    // have to use this to update attribute with map in it, before saving it
    this.list.updateMapAttributes();

    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      entityId: this.resourceId,
      entity: 'resource',
      attributes: this.selection.selected
    };

    const dialogRef = this.dialog.open(EditAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  onCreate() {
    const config = getDefaultDialogConfig();
    config.width = '1050px';
    config.data = {
      entityId: this.resourceId,
      entity: 'resource',
      notEmptyAttributes: this.attributes,
      style: 'resource-theme'
    };

    const dialogRef = this.dialog.open(CreateAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') {
       this.refreshTable();
      }
    });
  }

  refreshTable() {
    this.loading = true;
    this.attributesManager.getResourceAttributes(this.resourceId).subscribe(attributes => {
      this.attributes = attributes;
      this.selection.clear();
      this.loading = false;
    });
  }

  applyFilter(filterValue: string) {
   this.filterValue = filterValue;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
