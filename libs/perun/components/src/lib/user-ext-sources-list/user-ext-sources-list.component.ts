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
import { RichUserExtSource, UserExtSource } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { TABLE_ITEMS_COUNT_OPTIONS } from '@perun-web-apps/perun/utils';

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

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'id' : {
            if (item.userExtSource) {
              return item.userExtSource.id;
            }
            break;
          }
          case 'extSourceName': {
            if (item.userExtSource) {
              return item.userExtSource.extSource.name.toLowerCase();
            }
            break;
          }
          case 'login': {
            if (item.userExtSource) {
              return item.userExtSource.login.toLowerCase();
            }
            break;
          }
          case 'lastAccess': {
            if (item.userExtSource) {
              return item.userExtSource.lastAccess;
            }
            break;
          }
          default: return item[property];
        }
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
