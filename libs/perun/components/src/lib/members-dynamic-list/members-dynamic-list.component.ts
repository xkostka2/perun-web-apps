import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input, OnChanges,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {SelectionModel} from '@angular/cdk/collections';
import { MemberGroupStatus, RichMember, VoMemberStatuses } from '@perun-web-apps/perun/openapi';
import {
  downloadData, getDataForExport,
  getDefaultDialogConfig, parseEmail, parseFullName, parseLogins, parseOrganization,
  TABLE_ITEMS_COUNT_OPTIONS
} from '@perun-web-apps/perun/utils';
import { ChangeMemberStatusDialogComponent } from '@perun-web-apps/perun/dialogs';
import {
  DynamicPaginatingService,
  GuiAuthResolver,
  MembersDataSource,
  TableCheckbox
} from '@perun-web-apps/perun/services';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'perun-web-apps-members-dynamic-list',
  templateUrl: './members-dynamic-list.component.html',
  styleUrls: ['./members-dynamic-list.component.css']
})
export class MembersDynamicListComponent implements AfterViewInit, OnInit, OnChanges {

  constructor(private dialog: MatDialog,
              private authResolver: GuiAuthResolver,
              private tableCheckbox: TableCheckbox,
              private dynamicPaginatingService: DynamicPaginatingService) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input()
  selection: SelectionModel<RichMember>;

  @Input()
  hideColumns: string[] = [];

  @Input()
  pageSize = 10;

  @Input()
  voId: number;

  @Input()
  groupId: number;

  @Input()
  selectedGroupStatuses: MemberGroupStatus[] = [];

  @Input()
  attrNames: string[];

  @Input()
  searchString: string;

  @Input()
  selectedStatuses: VoMemberStatuses[];

  @Input()
  updateTable: boolean;

  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  exporting = false;

  displayedColumns: string[] = ['checkbox', 'id', 'fullName', 'status', 'groupStatus', 'organization', 'email', 'logins'];
  dataSource: MembersDataSource;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadMembersPage())
      )
      .subscribe();
  }

  ngOnInit() {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.displayedColumns = this.displayedColumns.filter(x => !this.hideColumns.includes(x));

    this.dataSource = new MembersDataSource(this.dynamicPaginatingService, this.authResolver);
    this.dataSource.loadMembers(this.voId, this.attrNames,'ASCENDING', 0, this.pageSize,
      'NAME', this.selectedStatuses, this.searchString, this.groupId, this.selectedGroupStatuses);
  }

  ngOnChanges() {
    if (!!this.dataSource) {
      this.paginator.pageIndex = 0;
      this.loadMembersPage();
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.pageSize;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.getData().forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: RichMember): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  changeStatus(event: any, member: RichMember) {
    event.stopPropagation();
    if (member.status === 'INVALID') {
      const config = getDefaultDialogConfig();
      config.width = '500px';
      config.data = {member: member};

      const dialogRef = this.dialog.open(ChangeMemberStatusDialogComponent, config);
      dialogRef.afterClosed().subscribe( success => {
        if (success) {
          this.loadMembersPage();
        }
      });
    }
  }

  pageChanged(event: PageEvent) {
    this.page.emit(event);
  }

  loadMembersPage() {
    const sortDirection = this.sort.direction === 'asc' ? 'ASCENDING' : 'DESCENDING';
    const sortColumn = this.sort.active === 'fullName' ? 'NAME' : 'ID';
    this.dataSource.loadMembers(this.voId, this.attrNames, sortDirection, this.paginator.pageIndex,
      this.paginator.pageSize, sortColumn,  this.selectedStatuses, this.searchString, this.groupId, this.selectedGroupStatuses);
  }

  exportData(format: string) {
    downloadData(getDataForExport(this.dataSource.getData(), this.displayedColumns, this.getExportDataForColumn, this), format);
  }

  getExportDataForColumn(data: RichMember, column: string, outerThis: MembersDynamicListComponent): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'fullName':
        if (data.user) {
          return parseFullName(data.user)
        }
        return ''
      case 'status':
        return data.status;
      case 'groupStatus':
        return data.groupStatus;
      case 'organization':
        return parseOrganization(data);
      case 'email':
        return parseEmail(data);
      case 'logins':
        return parseLogins(data);
      default:
        return '';
    }
  }
}
