import { Component, HostBinding, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
// tslint:disable-next-line:max-line-length
import { DeleteAttributeDefinitionDialogComponent } from '../../../../shared/components/dialogs/delete-attribute-definition-dialog/delete-attribute-definition-dialog.component';
import { MatDialog } from '@angular/material/dialog';
// tslint:disable-next-line:max-line-length
import { CreateAttributeDefinitionDialogComponent } from '../../../../shared/components/dialogs/create-attribute-definition-dialog/create-attribute-definition-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AttributeDefinition, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { PageEvent } from '@angular/material/paginator';
import { TABLE_ADMIN_ATTRIBUTES, TableConfigService } from '@perun-web-apps/config/table-config';
import { AttributeImportDialogComponent } from '../../../../shared/components/dialogs/attribute-import-dialog/attribute-import-dialog.component';

@Component({
  selector: 'app-admin-attributes',
  templateUrl: './admin-attributes.component.html',
  styleUrls: ['./admin-attributes.component.scss']
})
export class AdminAttributesComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(
    private dialog: MatDialog,
    private attributesManager: AttributesManagerService,
    private tableConfigService: TableConfigService
  ) {
  }

  attrDefinitions: AttributeDefinition[] = [];

  selected = new SelectionModel<AttributeDefinition>(true, []);
  filterValue = '';

  loading: boolean;
  pageSize: number;
  tableId = TABLE_ADMIN_ATTRIBUTES;

  ngOnInit() {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.refreshTable();
  }

  onCreate() {
    const config = getDefaultDialogConfig();
    config.width = '500px';

    const dialogRef = this.dialog.open(CreateAttributeDefinitionDialogComponent, config);

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
      attributes: this.selected.selected,
      theme: 'admin-theme'
    };

    const dialogRef = this.dialog.open(DeleteAttributeDefinitionDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
        this.selected.clear();
      }
    });
  }

  refreshTable() {
    this.loading = true;
    this.attributesManager.getAllAttributeDefinitions().subscribe(attrDefs => {
      this.attrDefinitions = attrDefs;
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

  onImport() {
    const config = getDefaultDialogConfig();
    config.width = '700px';

    const dialogRef = this.dialog.open(AttributeImportDialogComponent, config);

    dialogRef.afterClosed().subscribe(value => {
      if (value === true) {
        this.refreshTable();
      }
    })
  }
}
