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
import { GuiAuthResolver, StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-resources-list',
  templateUrl: './resources-list.component.html',
  styleUrls: ['./resources-list.component.scss']
})
export class ResourcesListComponent implements AfterViewInit, OnChanges {

  @Input()
  displayedColumns: string[] = ['select', 'id', 'role', 'name', 'vo', 'facility', 'tags', 'description'];

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
  supportedEntities = ['Vo','Facility', 'Resource'];
  @Input()
  groupToResource: Group;

  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  private sort: MatSort;

  dataSource: MatTableDataSource<RichResource>;

  exporting = false;

  removeAuth = false;

  addAuth = false;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  roles = this.store.getPerunPrincipal().roles;

  constructor(private guiAuthResolver: GuiAuthResolver,
              private store: StoreService) { }

  ngOnChanges(changes: SimpleChanges) {
    this.dataSource = new MatTableDataSource<RichResource>(this.resources);
    this.setDataSource();
    this.dataSource.filter = this.filterValue;
    this.setAuth();
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
