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
import { Group, ResourceTag, RichResource } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  TABLE_ITEMS_COUNT_OPTIONS
} from '@perun-web-apps/perun/utils';
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
  @Output()
  allSelected = new EventEmitter();

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

  getDataForColumn(data: RichResource, column: string, otherThis: ResourcesListComponent): string{
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'vo':
        return data.vo.name;
      case 'name':
        return  data.name;
      case 'facility':
        return data.facility.name;
      case 'description':
        return  data.description;
      case 'recent':
        if (otherThis.recentIds) {
          if (otherThis.recentIds.indexOf(data.id) > -1) {
            return '#'.repeat(otherThis.recentIds.indexOf(data.id));
          }
        }
        return data['name'];
      case 'tags':
        if (!data.resourceTags) {
          return data[column];
        }
        const tags = <[ResourceTag]>data.resourceTags;
        let result = '';
        tags.forEach(function (tag) {
          result = result.concat(tag.tagName);
        });
        return result;
      default:
        return data[column];
    }
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.filterPredicate = (data: RichResource, filter: string) => {
        return customDataSourceFilterPredicate(data, filter, this.displayedColumns, this.getDataForColumn, this)
      };
      this.dataSource.sortData = (data: RichResource[], sort: MatSort) => {
        return customDataSourceSort(data, sort, this.getDataForColumn, this);
      };
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const isAllSelected = this.tableCheckbox.isAllSelected(this.selection.selected.length, this.filterValue, this.pageSize, this.paginator.hasNextPage(), this.dataSource);
    this.allSelected.emit(isAllSelected)
    return isAllSelected;
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
