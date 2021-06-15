import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { TABLE_ITEMS_COUNT_OPTIONS } from '../perun-utils';

@Component({
  selector: 'perun-web-apps-table-wrapper',
  templateUrl: './table-wrapper.component.html',
  styleUrls: ['./table-wrapper.component.css']
})
export class TableWrapperComponent {

  public paginator: MatPaginator;
  @Input()
  hideExport = false;
  @Output()
  page = new EventEmitter<PageEvent>();
  @Input()
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  @Input()
  pageSize = 5
  @Input()
  dataLength = 0;
  @Output()
  exportData = new EventEmitter<any>()

  constructor() { }

  @ViewChild(MatPaginator, { static: true }) set matPaginator(pg: MatPaginator) {
    this.paginator = pg;
  };

  pageChanged(event: PageEvent) {
    this.paginator.pageSize = event.pageSize;
    this.paginator.pageIndex = event.pageIndex;
    this.page.emit(event);
    this.paginator.page.emit(event);
  }
}
