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
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RichFacility } from '@perun-web-apps/perun/openapi';
import { parseTechnicalOwnersNames, TABLE_ITEMS_COUNT_OPTIONS } from '@perun-web-apps/perun/utils';
import { SelectionModel } from '@angular/cdk/collections';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-facility-select-table',
  templateUrl: './facility-select-table.component.html',
  styleUrls: ['./facility-select-table.component.scss']
})
export class FacilitySelectTableComponent implements AfterViewInit, OnChanges {

  constructor(private authResolver: GuiAuthResolver) { }

  @Input()
  facilities: RichFacility[];

  @Input()
  recentIds: number[];

  @Input()
  filterValue: string;

  @Input()
  pageSize = 10;

  @Input()
  displayedColumns: string[] = ['select', 'id', 'recent', 'name', 'description', 'technicalOwners'];

  @Input()
  selection: SelectionModel<RichFacility>;

  @Input()
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  @Input()
  checkAuth: boolean;

  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  exporting = false;

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  private sort: MatSort;

  dataSource: MatTableDataSource<RichFacility>;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.dataSource = new MatTableDataSource<RichFacility>(this.facilities);
    this.setDataSource();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'id': {
            return +item.id;
          }
          case 'recent': {
            if (this.recentIds) {
              if (this.recentIds.indexOf(item.id) > -1) {
                return '#'.repeat(this.recentIds.indexOf(item.id));
              }
            }
            return item.name.toLocaleLowerCase();
          }
          case 'name' : {
            return item.name.toLocaleLowerCase();
          }
          default: return item[property];
        }
      };
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource.filterPredicate = ((data, filter) => {
        const lowerCaseFilter = filter.trim().toLowerCase();
        if (data.name.trim().toLowerCase().indexOf(lowerCaseFilter) !== -1) {
          return true;
        }
        if (data.description !== null && data.description.trim().toLowerCase().indexOf(lowerCaseFilter) !== -1) {
          return true;
        }
        if (data.id.toString(10).startsWith(filter)) {
          return true;
        }
        if (this.displayedColumns.indexOf('technicalOwners') !== -1) {
          return parseTechnicalOwnersNames(data.facilityOwners).toLowerCase().indexOf(lowerCaseFilter) !== -1;
        }
        return false;
      });
      this.dataSource.filter = this.filterValue;
    }
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
  checkboxLabel(row?: RichFacility): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  pageChanged(event: PageEvent) {
    this.page.emit(event);
  }
}
