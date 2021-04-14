import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { ThanksForGUI } from '@perun-web-apps/perun/openapi';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort, downloadData, getDataForExport,
  TABLE_ITEMS_COUNT_OPTIONS
} from '@perun-web-apps/perun/utils';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'perun-web-apps-thanks-list',
  templateUrl: './thanks-list.component.html',
  styleUrls: ['./thanks-list.component.scss']
})
export class ThanksListComponent implements AfterViewInit, OnChanges {

  constructor() { }

  @Input()
  thanks: ThanksForGUI[] = [];
  @Input()
  filterValue = '';
  @Input()
  pageSize = 10;
  @Input()
  displayedColumns = ['id', 'name'];
  @Input()
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  @Output()
  pageChanged: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  private sort: MatSort;
  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  dataSource: MatTableDataSource<ThanksForGUI>;

  private paginator: MatPaginator;

  @ViewChild(MatPaginator, { static: true }) set matPaginator(pg: MatPaginator) {
    this.paginator = pg;
  };


  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource<ThanksForGUI>(this.thanks);
    this.setDataSource();
    this.dataSource.filter = this.filterValue;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
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
      this.dataSource.paginator = this.paginator;
    }
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
}
