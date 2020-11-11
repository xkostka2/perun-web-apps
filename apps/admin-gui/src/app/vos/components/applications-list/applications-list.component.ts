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
import {Router} from '@angular/router';
import { Application, Group, Member } from '@perun-web-apps/perun/openapi';
import { TABLE_ITEMS_COUNT_OPTIONS } from '@perun-web-apps/perun/utils';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-applications-list',
  templateUrl: './applications-list.component.html',
  styleUrls: ['./applications-list.component.scss']
})
export class ApplicationsListComponent implements OnChanges, AfterViewInit {

  constructor(private authResolver: GuiAuthResolver) { }

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @Input()
  applications: Application[] = [];

  @Input()
  group: Group;

  @Input()
  member: Member;

  @Input()
  displayedColumns: string[] = [];

  @Input()
  filterValue: string;

  @Input()
  pageSize = 10;

  @Input()
  disableRouting = false;

  @Output()
  page = new EventEmitter<PageEvent>();

  dataSource: MatTableDataSource<Application>;

  exporting = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  private sort: MatSort;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngAfterViewInit(): void {
    this.setDataSource();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.dataSource = new MatTableDataSource<Application>(this.applications);
    this.setDataSource();
    this.dataSource.filter = this.filterValue;
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'user': {
            if (item.user) {
              return item.user.firstName + '' + item.user.lastName;
            }
            return item.createdBy.slice(item.createdBy.lastIndexOf('=') + 1, item.createdBy.length);
          }
          case 'group': {
            if (item.group) {
              return item.group.name;
            }
            return '-';
          }
          case 'modifiedBy': {
            const index = item.modifiedBy.lastIndexOf('/CN=');
            if (index !== -1) {
              const string =  item.modifiedBy.slice(index + 4, item.modifiedBy.length).replace('/unstructuredName=', ' ').toLowerCase();
              if (string.lastIndexOf('\\') !== -1) {
                return item.modifiedBy.slice(item.modifiedBy.lastIndexOf('=') + 1, item.modifiedBy.length);
              }
              return string;
            }
            return item.modifiedBy.toLowerCase();
          }
          default: return item[property];
        }
      };
      this.dataSource.paginator = this.paginator;
    }
  }


  getFriendlyName(modifiedBy: string) {
    const index = modifiedBy.lastIndexOf('/CN=');
    if (index !== -1) {
      const string =  modifiedBy.slice(index + 4, modifiedBy.length).replace('/unstructuredName=', ' ');
      if (string.lastIndexOf('\\') !== -1) {
        return modifiedBy.slice(modifiedBy.lastIndexOf('=') + 1, modifiedBy.length);
      }
      return string;
    }
    return modifiedBy;
  }

  selectApplication(application: Application) {
    if (!this.disableRouting) {
      if (this.group) {
        return ['/organizations', application.vo.id, 'groups', this.group.id, 'applications', application.id];
      } else if (this.member) {
        return ['/organizations', application.vo.id, 'members', this.member.id, 'applications', application.id];
      } else {
        return ['/organizations', application.vo.id, 'applications', application.id];
      }
    }
    return null;
  }

  pageChanged(event: PageEvent) {
    this.page.emit(event);
  }
}
