import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { PublicationSystem } from '@perun-web-apps/perun/openapi';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort, downloadData, getDataForExport,
  TABLE_ITEMS_COUNT_OPTIONS, TableWrapperComponent
} from '@perun-web-apps/perun/utils';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'perun-web-apps-publication-systems-list',
  templateUrl: './publication-systems-list.component.html',
  styleUrls: ['./publication-systems-list.component.scss']
})
export class PublicationSystemsListComponent implements AfterViewInit, OnChanges {

  constructor() { }

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @Input()
  publicationSystems: PublicationSystem[] = [];
  @Input()
  filterValue: string;
  @Input()
  pageSize = 10;
  @Input()
  displayedColumns: string[] = ['id', 'friendlyName', 'loginNamespace', 'url', 'type'];
  @Input()
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  private sort: MatSort;

  dataSource: MatTableDataSource<PublicationSystem>;

  @ViewChild(TableWrapperComponent, {static: true}) child: TableWrapperComponent;

  ngOnChanges() {
    this.dataSource = new MatTableDataSource<PublicationSystem>(this.publicationSystems);
    this.setDataSource();
    this.dataSource.filter = this.filterValue;
  }

  getDataForColumn(data: PublicationSystem, column: string): string{
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'friendlyName':
        return  data.friendlyName;
      case 'url':
        return data.url;
      case 'loginNamespace':
        return data.loginNamespace;
      case 'type':
        return data.type;
      default:
        return data[column];
    }
  }

  exportData(format: string){
    downloadData(getDataForExport(this.dataSource.filteredData, this.displayedColumns, this.getDataForColumn, this), format);
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.filterPredicate = (data: PublicationSystem, filter: string) => {
        return customDataSourceFilterPredicate(data, filter, this.displayedColumns, this.getDataForColumn, this)
      };
      this.dataSource.sortData = (data: PublicationSystem[], sort: MatSort) => {
        return customDataSourceSort(data, sort, this.getDataForColumn, this);
      };
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.child.paginator;
  }
}
