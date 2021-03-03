import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input, OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { Facility } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import {
  customDataSourceFilterPredicate, customDataSourceSort,
  TABLE_ITEMS_COUNT_OPTIONS
} from '@perun-web-apps/perun/utils';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'perun-web-apps-simple-facility-list',
  templateUrl: './simple-facility-list.component.html',
  styleUrls: ['./simple-facility-list.component.scss']
})
export class SimpleFacilityListComponent implements OnChanges {

  constructor(
    public authResolver: GuiAuthResolver,
    private cd: ChangeDetectorRef
  ) { }

  @Input()
  facilities: Facility[] = [];

  @Input()
  recentIds: number[];

  @Input()
  filterValue: string;

  @Input()
  pageSize = 10;

  @Input()
  displayedColumns: string[] = ['select', 'id', 'recent', 'name', 'description'];

  @Input()
  selection: SelectionModel<Facility>;

  @Input()
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  exporting = false;

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @ViewChild(MatPaginator) set matPaginator(pg: MatPaginator) {
    this.paginator = pg;
    this.setDataSource();
    this.cd.detectChanges();
  }

  private sort: MatSort;
  private paginator: MatPaginator;

  dataSource: MatTableDataSource<Facility>;
  disableRouting: boolean;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.setDataSource();
  }

  getDataForColumn(data: Facility, column: string, otherThis: SimpleFacilityListComponent): string{
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'name':
        return  data.name;
      case 'description':
        return data.description;
      case 'recent':
        if (otherThis.recentIds) {
          if (otherThis.recentIds.indexOf(data.id) > -1) {
            return '#'.repeat(otherThis.recentIds.indexOf(data.id));
          }
        }
        return data['name'];
      default:
        return data[column];
    }
  }

  setDataSource() {
    if (!this.paginator) {
      return;
    }
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource<Facility>();
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource.filterPredicate = (data: Facility, filter: string) => {
        return customDataSourceFilterPredicate(data, filter, this.displayedColumns, this.getDataForColumn, this)
      };
      this.dataSource.sortData = (data: Facility[], sort: MatSort) => {
        return customDataSourceSort(data, sort, this.getDataForColumn, this);
      };
    }
    this.dataSource.filter = this.filterValue;
    this.dataSource.data = this.facilities;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Facility): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  pageChanged(event: PageEvent) {
    this.page.emit(event);
  }

}
