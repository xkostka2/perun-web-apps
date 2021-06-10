import { AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { downloadData, getDataForExport } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-string-list',
  templateUrl: './string-list.component.html',
  styleUrls: ['./string-list.component.scss']
})
export class StringListComponent implements OnChanges, AfterViewInit {

  constructor() {
  }

  @Input()
  values: string[] = [];

  @Input()
  selection = new SelectionModel<string>(false, []);

  @Input()
  alertText = '';

  @Input()
  headerColumnText = '';

  private sort: MatSort;

  displayedColumns: string[] = ['select', 'value'];
  dataSource: MatTableDataSource<string>;
  pageSize = 5;

  public paginator: MatPaginator;

  @ViewChild(MatPaginator, { static: true }) set matPaginator(pg: MatPaginator) {
    this.paginator = pg;
  };

  ngOnChanges(changes: SimpleChanges) {
    this.values = this.values ? this.values : [];
    this.dataSource = new MatTableDataSource<string>(this.values);
    this.setDataSource();
  }
  getExportDataForColumn(data: string, column: string){
    return data;
  }

  exportData(format: string){
    downloadData(getDataForExport(this.dataSource.filteredData, this.displayedColumns, this.getExportDataForColumn, this), format);
  }


  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  checkboxLabel(row?: string): string {
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  ngAfterViewInit(): void {
    this.setDataSource();
  }

  pageChanged(event: PageEvent) {
    this.paginator.pageSize = event.pageSize;
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.page.emit(event);
  }
}
