import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { AttributeDefinition} from '@perun-web-apps/perun/openapi';
import { EditAttributeDefinitionDialogComponent } from '../dialogs/edit-attribute-definition-dialog/edit-attribute-definition-dialog.component';
import {
  customDataSourceFilterPredicate, customDataSourceSort, downloadData, getDataForExport,
  getDefaultDialogConfig, TABLE_ITEMS_COUNT_OPTIONS, TableWrapperComponent
} from '@perun-web-apps/perun/utils';
import { GuiAuthResolver, TableCheckbox } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-attr-def-list',
  templateUrl: './attr-def-list.component.html',
  styleUrls: ['./attr-def-list.component.scss']
})
export class AttrDefListComponent implements OnChanges, AfterViewInit {

  constructor(private dialog: MatDialog,
              private authResolver: GuiAuthResolver,
              private tableCheckbox: TableCheckbox) { }

  @Input()
  definitions: AttributeDefinition[];
  @Input()
  selection = new SelectionModel<AttributeDefinition>(true, []);
  @Input()
  displayedColumns: string[] = ['select', 'id', 'friendlyName', 'entity', 'namespace', 'type', 'unique'];
  @Input()
  filterValue: string;
  @Input()
  pageSize = 10;
  @Input()
  disableRouting = false;

  @Output()
  refreshEvent = new EventEmitter<void>();
  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @ViewChild(TableWrapperComponent, {static: true}) child: TableWrapperComponent;

  dataSource: MatTableDataSource<AttributeDefinition>;

  private sort: MatSort;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.dataSource = new MatTableDataSource<AttributeDefinition>(this.definitions);
    this.setDataSource();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.child.paginator;
  }

  getDataForColumn(data: AttributeDefinition, column: string): string{
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'friendlyName':
        return data.friendlyName;
      case 'entity':
        return  data.entity;
      case 'namespace':
        if (data.namespace) {
          const stringValue = <string>data.namespace;
          return stringValue.substring(stringValue.lastIndexOf(':') + 1, stringValue.length);
        }
        return '';
      case 'type':
        if (data.type) {
          const stringValue = <string>data.type;
          return stringValue.substring(stringValue.lastIndexOf('.') + 1, stringValue.length);
        }
        return '';
      case 'unique':
        return data.unique ? 'true' : 'false';
      default:
        return '';
    }
  }

  exportData(format: string){
    downloadData(getDataForExport(this.dataSource.filteredData, this.displayedColumns, this.getDataForColumn, this), format);
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.filter = this.filterValue;

      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = (data: AttributeDefinition, filter: string) => {
        return customDataSourceFilterPredicate(data, filter, this.displayedColumns, this.getDataForColumn, this)
      };
      this.dataSource.sortData = (data: AttributeDefinition[], sort: MatSort) => {
        return customDataSourceSort(data, sort, this.getDataForColumn, this);
      };
      this.dataSource.paginator = this.child.paginator;
    }
  }

  isAllSelected() {
    return this.tableCheckbox.isAllSelected(this.selection.selected.length, this.filterValue, this.pageSize, this.child.paginator.hasNextPage(), this.dataSource);
  }

  masterToggle() {
    this.tableCheckbox.masterToggle(this.isAllSelected(), this.selection, this.filterValue, this.dataSource, this.sort, this.pageSize, this.child.paginator.pageIndex, false);
  }

  checkboxLabel(row?: AttributeDefinition): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  onRowClick(attDef: AttributeDefinition) {
    if(!this.disableRouting){
      const config = getDefaultDialogConfig();
      config.width = '700px';
      config.data = {
        attDef: attDef
      };

      const dialogRef = this.dialog.open(EditAttributeDefinitionDialogComponent, config);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.selection.clear();
          this.refreshEvent.emit();
        }
      });
    }
  }
}
