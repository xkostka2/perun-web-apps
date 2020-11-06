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
import { TaskResult } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TABLE_ITEMS_COUNT_OPTIONS } from '@perun-web-apps/perun/utils';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-task-results-list',
  templateUrl: './task-results-list.component.html',
  styleUrls: ['./task-results-list.component.css']
})
export class TaskResultsListComponent implements AfterViewInit, OnChanges {

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  constructor(private authResolver: GuiAuthResolver) { }

  @Input()
  taskResults: TaskResult[] = [];
  @Input()
  selection = new SelectionModel<TaskResult>(true, []);
  @Input()
  filterValue: string;
  @Input()
  pageSize = 10;
  @Input()
  displayedColumns: string[] = ['select', 'id', 'destination', 'type', 'service', 'status', 'time', 'returnCode', 'standardMessage', 'errorMessage'];

  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  private sort: MatSort;
  dataSource: MatTableDataSource<TaskResult>;
  exporting = false;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.dataSource = new MatTableDataSource<TaskResult>(this.taskResults);
    this.setDataSource();
    this.dataSource.filter = this.filterValue;
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'status' :{
            if (item.status) {
              return item.status;
            }
            break;
          }
          case 'destination' :{
            if (item.destination) {
              return item.destination.destination;
            }
            break;
          }
          case 'time' :{
            if (item.timestamp) {
              return item.timestamp;
            }
            break;
          }
          default: return item[property];
        }
      };
      this.dataSource.paginator = this.paginator;
      this.dataSource.filter = this.filterValue;
      this.dataSource.filterPredicate = (result, filter) => {
        return result.id.toString().includes(filter) || result.destination.destination.toLowerCase().includes(filter) ||
          result.destination.type.includes(filter) || result.service.name.includes(filter) || result.status.includes(filter);
      };
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

  checkboxLabel(row?: TaskResult): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

}
