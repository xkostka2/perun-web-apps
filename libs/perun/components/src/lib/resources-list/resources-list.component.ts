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
import { Group, GroupResourceStatus, ResourceTag, RichResource } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort, downloadData, getDataForExport,
  TABLE_ITEMS_COUNT_OPTIONS
} from '@perun-web-apps/perun/utils';
import { GuiAuthResolver, TableCheckbox } from '@perun-web-apps/perun/services';


export interface ResourceWithStatus extends RichResource {
  status?: GroupResourceStatus;
}

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
  resources: ResourceWithStatus[] = [];
  @Input()
  selection = new SelectionModel<ResourceWithStatus>(true, []);
  @Input()
  filterValue: string;
  @Input()
  pageSize = 10;
  @Input()
  disableRouting = false;
  @Input()
  routingVo = false;
  @Input()
  displayedColumns: string[] = ['select', 'id', 'recent', 'name', 'vo', 'facility', 'status', 'tags', 'description'];
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

  removeAuth = false;

  addAuth = false;

  public paginator: MatPaginator;

  @ViewChild(MatPaginator, { static: true }) set matPaginator(pg: MatPaginator) {
    this.paginator = pg;
  };

  ngOnChanges(changes: SimpleChanges) {
    if (!this.guiAuthResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.dataSource = new MatTableDataSource<ResourceWithStatus>(this.resources);
    this.setDataSource();
    this.dataSource.filter = this.filterValue;
    this.setAuth();
  }

  getDataForColumn(data: ResourceWithStatus, column: string, otherThis: ResourcesListComponent): string{
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
      case 'status':
        return data.status;
      default:
        return data[column];
    }
  }

  exportData(format: string){
    downloadData(getDataForExport(this.dataSource.filteredData, this.displayedColumns, this.getDataForColumn, this), format);
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
  checkboxLabel(row?: ResourceWithStatus): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  setAuth() {
    const objects = !!this.groupToResource ? [this.groupToResource] : [];
    this.removeAuth = this.selection.selected.reduce((acc, res) => acc &&
      this.guiAuthResolver.isAuthorized('removeGroupFromResources_Group_List<Resource>_policy', objects.concat([res])), true);
    this.addAuth = this.selection.selected.reduce((acc, res) => acc &&
      this.guiAuthResolver.isAuthorized('assignGroupToResources_Group_List<Resource>_policy', objects.concat([res])), true);
  }

  itemSelectionToggle(item: ResourceWithStatus) {
    this.selection.toggle(item);
    this.setAuth();
  }

  pageChanged(event: PageEvent) {
    this.paginator.pageSize = event.pageSize;
    this.paginator.pageIndex = event.pageIndex;
    this.page.emit(event);
    this.paginator.page.emit(event);
  }
}
