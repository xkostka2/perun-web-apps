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
import { RichUserExtSource, UserExtSource} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort,
  TABLE_ITEMS_COUNT_OPTIONS
} from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-user-ext-sources-list',
  templateUrl: './user-ext-sources-list.component.html',
  styleUrls: ['./user-ext-sources-list.component.scss']
})
export class UserExtSourcesListComponent implements AfterViewInit, OnChanges {

  constructor(private route: ActivatedRoute,
              private authResolver: GuiAuthResolver) {
  }

  @Input()
  userExtSources: RichUserExtSource[];
  @Input()
  selection: SelectionModel<UserExtSource> = new SelectionModel<UserExtSource>();
  @Input()
  filterValue = '';
  @Input()
  hideColumns: string[] = [];
  @Input()
  pageSize = 5;
  @Input()
  extSourceNameHeader: string;
  @Input()
  loginHeader: string;
  @Input()
  disableRouting: boolean;
  @Output()
  page = new EventEmitter<PageEvent>();

  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  private sort: MatSort;

  displayedColumns: string[] = ['select', 'id', 'mail', 'extSourceName', 'login', 'lastAccess'];
  dataSource: MatTableDataSource<RichUserExtSource>;
  exporting = false;
  userId: number;

  ngAfterViewInit() {
    if(!this.disableRouting){
      this.route.parent.params.subscribe(params => {
        this.userId = params["userId"];
      });
    }
    this.setDataSource();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.displayedColumns = this.displayedColumns.filter(x => !this.hideColumns.includes(x));
    this.dataSource = new MatTableDataSource<RichUserExtSource>(this.userExtSources);
    this.setDataSource();
  }

  getDataForColumn(data: RichUserExtSource, column: string): string{
    switch (column) {
      case 'id':
        return data.userExtSource.id.toString();
      case 'mail':
        const attribute = data.attributes.find(att => att.friendlyName === 'mail');
        return attribute ? attribute.value.toString() : 'N/A';
      case 'extSourceName':
        return  data.userExtSource.extSource.name;
      case 'login':
        return  data.userExtSource.login;
      case 'lastAccess':
        return  data.userExtSource.lastAccess.split('.')[0];
      default:
        return '';
    }
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.filterPredicate = (data: RichUserExtSource, filter: string) => {
        return customDataSourceFilterPredicate(data, filter, this.displayedColumns, this.getDataForColumn, this)
      };
      this.dataSource.sortData = (data: RichUserExtSource[], sort: MatSort) => {
        return customDataSourceSort(data, sort, this.getDataForColumn, this);
      };
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource.filter = this.filterValue;
    }
  }

  checkboxLabel(row?: RichUserExtSource): string {
    return `${this.selection.isSelected(row.userExtSource) ? 'deselect' : 'select'} row ${row.userExtSource.id + 1}`;
  }

  pageChanged(event: PageEvent) {
    this.page.emit(event);
  }
}
