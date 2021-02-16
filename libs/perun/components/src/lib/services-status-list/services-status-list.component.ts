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
import { ServiceState } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  TABLE_ITEMS_COUNT_OPTIONS
} from '@perun-web-apps/perun/utils';
import { GuiAuthResolver, TableCheckbox } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-services-status-list',
  templateUrl: './services-status-list.component.html',
  styleUrls: ['./services-status-list.component.css']
})
export class ServicesStatusListComponent implements OnChanges, AfterViewInit {

  constructor(private authResolver: GuiAuthResolver,
              private tableCheckbox: TableCheckbox) {
  }

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @Input()
  servicesStatus: ServiceState[] = [];
  @Input()
  hideColumns: string[] = [];
  @Input()
  selection = new SelectionModel<ServiceState>(true, []);
  @Input()
  filterValue: string;
  @Input()
  pageSize = 10;
  @Input()
  disableRouting = true;

  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @Output()
  selectionChange: EventEmitter<any> = new EventEmitter<any>();

  private sort: MatSort;

  displayedColumns: string[] = ['select', 'task.id', 'service.name', 'status', 'blocked', 'task.startTime', 'task.endTime'];
  dataSource: MatTableDataSource<ServiceState>;

  exporting = false;

  private paginator: MatPaginator;

  @ViewChild(MatPaginator, { static: true }) set matPaginator(pg: MatPaginator) {
    this.paginator = pg;
  };
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'task.id');
    }
    this.displayedColumns = this.displayedColumns.filter(x => !this.hideColumns.includes(x));
    this.dataSource = new MatTableDataSource<ServiceState>(this.servicesStatus);
    this.setDataSource();
    this.dataSource.filterPredicate = (data, filter) => {
      const transformedFilter = filter.trim().toLowerCase();

      const listAsFlatString = (obj): string => {
        let returnVal = '';

        Object.values(obj).forEach((val) => {
          if (typeof val !== 'object') {
            returnVal = returnVal + ' ' + val;
          } else if (val !== null) {
            returnVal = returnVal + ' ' + listAsFlatString(val);
          }
        });

        return returnVal.trim().toLowerCase();
      };

      return listAsFlatString(data).includes(transformedFilter);
    };
    this.dataSource.filter = this.filterValue;
  }

  getDataForColumn(data: ServiceState, column: string): string{
    switch (column) {
      case 'task.id':
        return data.task ? data.task.id.toString() : data[column];
      case 'service.name':
        return data.service.name;
      case 'status':
         return data.status;
      case 'blocked':
        if (data.blockedOnFacility) { return 'BLOCKED' }
        if (data.blockedGlobally) {return 'BLOCKED GLOBALLY'}
        return 'ALLOWED';
      case 'task.startTime':
        return data.task && data.task.startTime ? data.task.startTime : data[column];
      case 'task.endTime':
        return data.task && data.task.endTime ? data.task.endTime : data[column];
      default:
        return data[column];
    }
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.filterPredicate = (data: ServiceState, filter: string) => {
        return customDataSourceFilterPredicate(data, filter, this.displayedColumns, this.getDataForColumn, this)
      };
      this.dataSource.sortData = (data: ServiceState[], sort: MatSort) => {
        return customDataSourceSort(data, sort, this.getDataForColumn, this);
      };
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    return this.tableCheckbox.isAllSelected(this.selection.selected.length, this.filterValue, this.pageSize, this.paginator.hasNextPage(), this.dataSource);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.tableCheckbox.masterToggle(this.isAllSelected(), this.selection, this.filterValue, this.dataSource, this.sort, this.pageSize, this.paginator.pageIndex,false);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: ServiceState): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.service.id + 1}`;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

}
