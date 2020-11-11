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
import { ExtSource } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TABLE_ITEMS_COUNT_OPTIONS } from '@perun-web-apps/perun/utils';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-ext-sources-list',
  templateUrl: './ext-sources-list.component.html',
  styleUrls: ['./ext-sources-list.component.scss']
})
export class ExtSourcesListComponent implements AfterViewInit, OnChanges {

  constructor(private authResolver: GuiAuthResolver) {
  }

  @Input()
  extSources: ExtSource[];
  @Input()
  selection: SelectionModel<ExtSource> = new SelectionModel<ExtSource>();
  @Input()
  filterValue = '';
  @Input()
  hideColumns: string[] = [];
  @Input()
  pageSize = 5;

  @Output()
  page = new EventEmitter<PageEvent>();

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  private sort: MatSort;

  displayedColumns: string[] = ['select', 'id', 'name', 'type'];
  dataSource: MatTableDataSource<ExtSource>;
  exporting = false;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngAfterViewInit() {
    this.setDataSource();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.displayedColumns = this.displayedColumns.filter(x => !this.hideColumns.includes(x));
    this.dataSource = new MatTableDataSource<ExtSource>(this.extSources);
    this.setDataSource();
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource.filter = this.filterValue;
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

  checkboxLabel(row?: ExtSource): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  pageChanged(event: PageEvent) {
    this.page.emit(event);
  }
}
