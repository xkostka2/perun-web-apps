import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Application, Group, Member, RegistrarManagerService} from '@perun-web-apps/perun/openapi';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  downloadData, getDataForExport,
  parseFullName,
  TABLE_ITEMS_COUNT_OPTIONS
} from '@perun-web-apps/perun/utils';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-perun-web-apps-application-list-details',
  templateUrl: './application-list-details.component.html',
  styleUrls: ['./application-list-details.component.scss']
})
export class ApplicationListDetailsComponent implements OnChanges {

  constructor(private router: Router,
              private authResolver: GuiAuthResolver,
              private registrarManager: RegistrarManagerService) { }

  @Input()
  applications: Application[] = [];

  @Input()
  group: Group;

  @Input()
  member: Member;

  @Input()
  filterValue: string;

  @Input()
  pageSize = 10;

  @Input()
  disableRouting = false;

  @Output()
  page = new EventEmitter<PageEvent>();

  displayedColumns: string[] = ['id', 'voId', 'voName', 'groupId', 'groupName', 'type',
    'state', 'extSourceName', 'extSourceType', 'user', 'createdBy', 'createdAt',
    'modifiedBy', 'modifiedAt', 'fedInfo'];

  dataSource: MatTableDataSource<any>;

  loading = false;

  table = [];

  addedColumns = new Set<string>();

  public paginator: MatPaginator;

  @ViewChild(MatPaginator, { static: true }) set matPaginator(pg: MatPaginator) {
    this.paginator = pg;
  };

  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.loading = true;
    this.table = [];
    this.getApplicationsData(0);
  }

  getExportDataForColumn(data: Application, column: string): string{
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'voId':
        return data.vo.id.toString();
      case 'voName':
        return data.vo.name;
      case 'groupId':
        return  data.group?.id.toString() ?? ''
      case 'groupName':
        return  data.group?.name ?? ''
      case 'type':
        return data.type;
      case 'fedInfo':
        return data.fedInfo;
      case 'state':
        return data.state;
      case 'extSourceName':
        return data.extSourceName;
      case 'extSourceType':
        return data.extSourceType;
      case 'user':
        return data.user ? parseFullName(data.user) : '';
      case 'createdBy':
        return data.createdBy;
      case 'createdAt':
        return data.createdAt;
      case 'modifiedBy':
        return data.modifiedBy;
      case 'modifiedAt':
        return data.modifiedAt;
      default:
        return data[column];
    }
  }

  exportData(format: string){
    downloadData(getDataForExport(this.dataSource.filteredData, this.displayedColumns, this.getExportDataForColumn, this), format);
  }

  getApplicationsData(index: number) {
    if (this.applications.length === index) {
      this.initialize();
      return;
    }
    const application: Application = this.applications[index];
    const obj = {};
    obj['id'] = application.id;
    obj['vo'] = application.vo;
    obj['group'] = application.group;
    obj['type'] = application.type;
    obj['fedInfo'] = application.fedInfo;
    obj['state'] = application.state;
    obj['extSourceName'] = application.extSourceName;
    obj['extSourceType'] = application.extSourceType;
    obj['extSourceLoa'] = application.extSourceLoa;
    obj['user'] = application.user;
    obj['createdBy'] = application.createdBy;
    obj['createdAt'] = application.createdAt;
    obj['modifiedBy'] = application.modifiedBy;
    obj['modifiedAt'] = application.modifiedAt;
    this.registrarManager.getApplicationDataById(application.id).subscribe( data => {
      for (const item of data) {
        if (item.formItem.i18n['en'].label !== null && item.formItem.i18n['en'].label.length !== 0) {
          obj[item.formItem.i18n['en'].label] = item.value;
          this.addedColumns.add(item.formItem.i18n['en'].label);
        } else {
          obj[item.shortname] = item.value;
          this.addedColumns.add(item.shortname);
        }
      }
      this.table.push(obj);
      this.getApplicationsData(index + 1);
    });
  }

  initialize() {
    for (const val of this.addedColumns) {
      this.displayedColumns.push(val);
    }
    this.dataSource = new MatTableDataSource(this.table);
    this.dataSource.paginator = this.paginator;
    this.dataSource.filter = this.filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.loading = false;
  }

  getFriendlyName(modifiedBy: string) {
    const index = modifiedBy.lastIndexOf('/CN=');
    if (index !== -1) {
      const string =  modifiedBy.slice(index + 4, modifiedBy.length)
        .replace('/unstructuredName=', ' ');
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
        return['/organizations', application.vo.id, 'groups', this.group.id, 'applications', application.id];
      } else if (this.member) {
        return ['/organizations', application.vo.id, 'members', this.member.id, 'applications', application.id];
      } else {
        return ['/organizations', application.vo.id, 'applications', application.id];
      }
    }
    return null;
  }

  pageChanged(event: PageEvent) {
    this.paginator.pageSize = event.pageSize;
    this.paginator.pageIndex = event.pageIndex;
    this.page.emit(event);
    this.paginator.page.emit(event);
  }
}
