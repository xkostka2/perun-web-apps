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
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import { GuiAuthResolver, NotificatorService, TableCheckbox } from '@perun-web-apps/perun/services';
import {TranslateService} from '@ngx-translate/core';
import { ResourcesManagerService, ResourceTag} from '@perun-web-apps/perun/openapi';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort, downloadData, getDataForExport,
  TABLE_ITEMS_COUNT_OPTIONS, TableWrapperComponent
} from '@perun-web-apps/perun/utils';

@Component({
  selector: 'app-resources-tags-list',
  templateUrl: './resources-tags-list.component.html',
  styleUrls: ['./resources-tags-list.component.scss']
})
export class ResourcesTagsListComponent implements OnChanges, AfterViewInit {

  constructor( private resourceManager: ResourcesManagerService,
               private notificator: NotificatorService,
               private translator: TranslateService,
               private authResolver: GuiAuthResolver,
               private tableCheckbox: TableCheckbox) { }

  @Input()
  resourceTags: ResourceTag[] = [];
  @Input()
  filterValue: string;
  @Input()
  selection = new SelectionModel<ResourceTag>(true, []);
  @Input()
  pageSize = 10;
  @Input()
  displayedColumns = ['select', 'id', 'name', 'edit'];

  @Output()
  page = new EventEmitter<PageEvent>();

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @ViewChild(TableWrapperComponent, {static: true}) child: TableWrapperComponent;

  private sort: MatSort;

  dataSource: MatTableDataSource<ResourceTag>;


  isChanging = new SelectionModel<ResourceTag>(true, []);
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.dataSource = new MatTableDataSource<ResourceTag>(this.resourceTags);
    this.setDataSource();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.child.paginator;
  }

  getDataForColumn(data: ResourceTag, column: string): string{
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'name':
        return data.tagName;
      default:
        return '';
    }
  }

  exportData(format: string){
    downloadData(getDataForExport(this.dataSource.filteredData, this.displayedColumns, this.getDataForColumn, this), format);
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.filterPredicate = (data: ResourceTag, filter: string) => {
        return customDataSourceFilterPredicate(data, filter, this.displayedColumns, this.getDataForColumn, this)
      };
      this.dataSource.sortData = (data: ResourceTag[], sort: MatSort) => {
        return customDataSourceSort(data, sort, this.getDataForColumn, this);
      };
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.child.paginator;
      this.dataSource.filter = this.filterValue;
    }
  }

  isAllSelected() {
    return this.tableCheckbox.isAllSelected(this.selection.selected.length, this.filterValue, this.pageSize, this.child.paginator.hasNextPage(), this.dataSource);
  }

  masterToggle() {
    this.tableCheckbox.masterToggle(this.isAllSelected(), this.selection, this.filterValue, this.dataSource, this.sort, this.pageSize, this.child.paginator.pageIndex,false);
  }

  checkboxLabel(row?: ResourceTag): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  save(tag: ResourceTag) {
    this.resourceManager.updateResourceTag({resourceTag: tag}).subscribe( () => {
      this.translator.get('SHARED.COMPONENTS.RESOURCES_TAGS_LIST.EDIT_SUCCESS').subscribe( text => {
        this.notificator.showSuccess(text);
      });
      this.isChanging.deselect(tag);
    });
  }

  edit(row?: ResourceTag) {
    this.isChanging.select(row);
  }
}
