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
import { Group, RichResource } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_ITEMS_COUNT_OPTIONS } from '@perun-web-apps/perun/utils';
import { GuiAuthResolver, TableCheckbox } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-resources-list',
  templateUrl: './resources-list.component.html',
  styleUrls: ['./resources-list.component.scss']
})
export class ResourcesListComponent implements AfterViewInit, OnChanges {

  constructor(private guiAuthResolver: GuiAuthResolver,
              private tableCheckbox: TableCheckbox) { }

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @Input()
  resources: RichResource[] = [];
  @Input()
  selection = new SelectionModel<RichResource>(true, []);
  @Input()
  filterValue: string;
  @Input()
  pageSize = 10;
  @Input()
  disableRouting = false;
  @Input()
  routingVo = false;
  @Input()
  displayedColumns: string[] = ['select', 'id', 'recent', 'name', 'vo', 'facility', 'tags', 'description'];
  @Input()
  groupToResource: Group;
  @Input()
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  @Input()
  recentIds: number[];

  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  private sort: MatSort;

  dataSource: MatTableDataSource<RichResource>;

  exporting = false;

  removeAuth = false;

  addAuth = false;

  private paginator: MatPaginator;

  @ViewChild(MatPaginator, { static: true }) set matPaginator(pg: MatPaginator) {
    this.paginator = pg;
  };

  ngOnChanges(changes: SimpleChanges) {
    if (!this.guiAuthResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.dataSource = new MatTableDataSource<RichResource>(this.resources);
    this.setDataSource();
    this.dataSource.filter = this.filterValue;
    this.setAuth();
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
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    return this.tableCheckbox.isAllSelected(this.selection.selected.length, this.filterValue, this.pageSize, this.paginator.hasNextPage(), this.dataSource);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.tableCheckbox.masterToggle(this.isAllSelected(), this.selection, this.filterValue, this.dataSource, this.sort, this.pageSize, this.paginator.pageIndex, false);
    this.setAuth();
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: RichResource): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  setAuth() {
    this.removeAuth = this.selection.selected.reduce((acc, res) => acc &&
      this.guiAuthResolver.isAuthorized('removeGroupFromResources_Group_List<Resource>_policy', [res, this.groupToResource]), true);
    this.addAuth = this.selection.selected.reduce((acc, res) => acc &&
      this.guiAuthResolver.isAuthorized('assignGroupToResources_Group_List<Resource>_policy', [res, this.groupToResource]), true);
  }

  itemSelectionToggle(item: RichResource) {
    this.selection.toggle(item);
    this.setAuth();
  }
}
