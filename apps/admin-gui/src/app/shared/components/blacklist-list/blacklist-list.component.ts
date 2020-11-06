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
import { MatSort } from '@angular/material/sort';
import { BanOnFacility, User } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { parseFullName, TABLE_ITEMS_COUNT_OPTIONS } from '@perun-web-apps/perun/utils';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-perun-web-apps-blacklist-list',
  templateUrl: './blacklist-list.component.html',
  styleUrls: ['./blacklist-list.component.scss']
})
export class BlacklistListComponent implements AfterViewInit, OnChanges {

  private sort: MatSort;

  constructor(private authResolver: GuiAuthResolver) {
  }

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @Input()
  bansOnFacilitiesWithUsers: [BanOnFacility, User][] = [];
  @Input()
  selection = new SelectionModel<[BanOnFacility, User]>(true, []);
  @Input()
  filterValue: string;

  @Input()
  pageSize = 10;

  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  displayedColumns: string[] = ['select', 'userId', 'name', 'reason'];
  dataSource: MatTableDataSource<[BanOnFacility, User]>;

  exporting = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'userId');
    }
    this.dataSource = new MatTableDataSource<[BanOnFacility, User]>(this.bansOnFacilitiesWithUsers);
    this.setDataSource();
    this.dataSource.filter = this.filterValue;
  }


  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
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
  checkboxLabel(row?: [BanOnFacility, User]): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row[0].userId + 1}`;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
}

