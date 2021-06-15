import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { Owner, ThanksForGUI } from '@perun-web-apps/perun/openapi';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort, downloadData, getDataForExport,
  TABLE_ITEMS_COUNT_OPTIONS, TableWrapperComponent
} from '@perun-web-apps/perun/utils';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { TableCheckbox } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-thanks-list',
  templateUrl: './thanks-list.component.html',
  styleUrls: ['./thanks-list.component.scss']
})
export class ThanksListComponent implements AfterViewInit, OnChanges {

  constructor(private tableCheckbox: TableCheckbox) { }

  @Input()
  thanks: ThanksForGUI[] = [];
  @Input()
  filterValue = '';
  @Input()
  pageSize = 10;
  @Input()
  displayedColumns = ['select', 'id', 'name', 'createdBy'];
  @Input()
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  @Input()
  selection = new SelectionModel<Owner>(true, []);

  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  private sort: MatSort;
  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  dataSource: MatTableDataSource<ThanksForGUI>;

  @ViewChild(TableWrapperComponent, {static: true}) child: TableWrapperComponent;

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource<ThanksForGUI>(this.thanks);
    this.setDataSource();
    this.dataSource.filter = this.filterValue;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.child.paginator;
  }

  isAllSelected() {
    return this.tableCheckbox.isAllSelected(this.selection.selected.length, this.filterValue, this.pageSize, this.child.paginator.hasNextPage(), this.dataSource);
  }

  getDataForColumn(data: ThanksForGUI, column: string):string {
    switch (column) {
      case 'id':
        return data.ownerId.toString();
      case 'name':
        return data.ownerName;
      default:
        return data[column];
    }
  }

  exportData(format: string){
    downloadData(getDataForExport(this.dataSource.filteredData, this.displayedColumns, this.getDataForColumn, this), format);
  }

  masterToggle() {
    this.tableCheckbox.masterToggle(this.isAllSelected(), this.selection, this.filterValue, this.dataSource, this.sort, this.pageSize, this.child.paginator.pageIndex,false);
  }

  private setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.filterPredicate = (data: ThanksForGUI, filter: string) => {
        return customDataSourceFilterPredicate(data, filter, this.displayedColumns, this.getDataForColumn, this)
      };
      this.dataSource.sortData = (data: ThanksForGUI[], sort: MatSort) => {
        return customDataSourceSort(data, sort, this.getDataForColumn, this);
      };
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
    }
  }

  checkboxLabel(row?: Owner): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }
}
