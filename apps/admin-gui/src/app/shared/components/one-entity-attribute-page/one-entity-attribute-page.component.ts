import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  Attribute,
  AttributesManagerService
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { CreateAttributeDialogComponent } from '../dialogs/create-attribute-dialog/create-attribute-dialog.component';
import { EditAttributeDialogComponent } from '@perun-web-apps/perun/dialogs';
import { DeleteAttributeDialogComponent } from '../dialogs/delete-attribute-dialog/delete-attribute-dialog.component';
import { AttributesListComponent } from '@perun-web-apps/perun/components';
import {
  TABLE_ATTRIBUTES_SETTINGS,
  TableConfigService
} from '@perun-web-apps/config/table-config';

@Component({
  selector: 'app-one-entity-attribute-page',
  templateUrl: './one-entity-attribute-page.component.html',
  styleUrls: ['./one-entity-attribute-page.component.css']
})
export class OneEntityAttributePageComponent implements OnInit {

  constructor(private attributesManagerService: AttributesManagerService,
              private tableConfigService: TableConfigService,
              private dialog: MatDialog) { }

  @Input()
  entity: string

  @Input()
  entityId: number;

  @ViewChild('list')
  list: AttributesListComponent;

  attributes: Attribute[] = [];
  selection = new SelectionModel<Attribute>(true, []);
  filterValue = '';
  tableId = TABLE_ATTRIBUTES_SETTINGS;
  pageSize: number;

  loading = false;

  ngOnInit(): void {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.refreshTable();
  }

  refreshTable() {
    this.loading = true;
    switch (this.entity) {
      case 'member':
        this.attributesManagerService.getMemberAttributes(this.entityId).subscribe(attributes => {
          this.attributes = attributes;
          this.selection.clear();
          this.loading = false;
        });
        break;
      case 'group':
        this.attributesManagerService.getGroupAttributes(this.entityId).subscribe(attributes => {
          this.attributes = attributes;
          this.selection.clear();
          this.loading = false;
        });
        break;
      case 'user':
        this.attributesManagerService.getUserAttributes(this.entityId).subscribe(attributes => {
          this.attributes = attributes;
          this.selection.clear();
          this.loading = false;
        });
        break;
      case 'resource':
        this.attributesManagerService.getResourceAttributes(this.entityId).subscribe(attributes => {
          this.attributes = attributes;
          this.selection.clear();
          this.loading = false;
        });
        break;
      case 'facility':
        this.attributesManagerService.getFacilityAttributes(this.entityId).subscribe(attributes => {
          this.attributes = attributes;
          this.selection.clear();
          this.loading = false;
        });
        break;
      case 'vo':
        this.attributesManagerService.getVoAttributes(this.entityId).subscribe(attributes => {
          this.attributes = attributes;
          this.selection.clear();
          this.loading = false;
        });
        break;
    }
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  onCreate() {
    const config = getDefaultDialogConfig();
    config.width = '1050px';
    config.data = {
      entityId: this.entityId,
      entity: this.entity,
      notEmptyAttributes: this.attributes,
      style: this.entity + '-theme'
    };

    const dialogRef = this.dialog.open(CreateAttributeDialogComponent, config);

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
      entityId: this.entityId,
      entity: this.entity,
      attributes: this.selection.selected
    };

    const dialogRef = this.dialog.open(EditAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  onDelete() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      entityId: this.entityId,
      entity: this.entity,
      attributes: this.selection.selected
    };

    const dialogRef = this.dialog.open(DeleteAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe(didConfirm => {
      if (didConfirm) {
        this.refreshTable();
      }
    });
  }
}
