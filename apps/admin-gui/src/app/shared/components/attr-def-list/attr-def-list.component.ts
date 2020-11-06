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
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { AttributeDefinition } from '@perun-web-apps/perun/openapi';
import { EditAttributeDefinitionDialogComponent } from '../dialogs/edit-attribute-definition-dialog/edit-attribute-definition-dialog.component';
import { getDefaultDialogConfig, TABLE_ITEMS_COUNT_OPTIONS } from '@perun-web-apps/perun/utils';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-attr-def-list',
  templateUrl: './attr-def-list.component.html',
  styleUrls: ['./attr-def-list.component.scss']
})
export class AttrDefListComponent implements OnChanges, AfterViewInit {

  constructor(private dialog: MatDialog,
              private authResolver: GuiAuthResolver) { }

  @Input()
  definitions: AttributeDefinition[];
  @Input()
  selection = new SelectionModel<AttributeDefinition>(true, []);
  @Input()
  hideColumns: string[] = [];
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

  exporting = false;

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = ['select', 'id', 'friendlyName', 'entity', 'namespace', 'type', 'unique'];
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
    this.dataSource.paginator = this.paginator;
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.filter = this.filterValue;

      this.dataSource.sort = this.sort;
      this.dataSource.sortingDataAccessor = (item, property) => {
        if (property === 'namespace') {
          return item.namespace.substring(item.namespace.lastIndexOf(':') + 1, item.namespace.length);
        } else if (property === 'friendlyName') {
          return item[property].toLowerCase();
        }
        else {
          return item[property];
        }
      };

      this.dataSource.paginator = this.paginator;
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
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

  pageChanged(event: PageEvent) {
    this.page.emit(event);
  }
}
