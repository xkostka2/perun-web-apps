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
import { AttributesManagerService, MemberWithSponsors, Vo } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  customDataSourceFilterPredicate, customDataSourceSort,
  getDefaultDialogConfig,
  parseFullName,
  TABLE_ITEMS_COUNT_OPTIONS
} from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import {  EditMemberSponsorsDialogComponent } from '../dialogs/edit-member-sponsors-dialog/edit-member-sponsors-dialog.component';
import { GuiAuthResolver, StoreService, TableCheckbox } from '@perun-web-apps/perun/services';
import { PasswordResetRequestDialogComponent } from '../dialogs/password-reset-request-dialog/password-reset-request-dialog.component';

@Component({
  selector: 'app-sponsored-members-list',
  templateUrl: './sponsored-members-list.component.html',
  styleUrls: ['./sponsored-members-list.component.scss']
})
export class SponsoredMembersListComponent implements OnChanges, AfterViewInit {

  constructor(private dialog: MatDialog,
              private authResolver: GuiAuthResolver,
              private storeService: StoreService,
              private attributesManager: AttributesManagerService,
              private tableCheckbox: TableCheckbox) { }

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @Input()
  sponsoredMembers: MemberWithSponsors[] = [];

  @Input()
  selection: SelectionModel<MemberWithSponsors>;

  @Input()
  filterValue = "";

  @Input()
  displayedColumns: string[] = ['id', 'name', 'sponsors', 'menu'];

  @Input()
  disableRouting = false;

  @Input()
  pageSize = 10;

  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @Output()
  refreshTable = new EventEmitter<void>();

  dataSource: MatTableDataSource<MemberWithSponsors>;
  private sort: MatSort;
  exporting = false;
  loading = false;

  routingStrategy = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.dataSource = new MatTableDataSource<MemberWithSponsors>(this.sponsoredMembers);
    this.setDataSource();
    this.dataSource.filter = this.filterValue;
    this.routingStrategy = this.disableRouting;
  }

  getDataForColumn(data: MemberWithSponsors, column: string): string{
    switch (column) {
      case 'id':
        return data.member.id.toString();
      case 'name':
        if(data.member.user){
          return data.member.user.lastName ? data.member.user.lastName : data.member.user.firstName ?? ''
        }
        return ''
      case 'sponsors':
        return data.sponsors.map(s => parseFullName(s.user)).join();
      default:
        return '';
    }
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.sort = this.sort;

      this.dataSource.filterPredicate = (data: MemberWithSponsors, filter: string) => {
        return customDataSourceFilterPredicate(data, filter, this.displayedColumns, this.getDataForColumn, this)
      };
      this.dataSource.sortData = (data: MemberWithSponsors[], sort: MatSort) => {
        return customDataSourceSort(data, sort, this.getDataForColumn, this);
      };
      this.dataSource.filter = this.filterValue;

      this.dataSource.paginator = this.paginator;
    }
  }

  showSponsors(member: MemberWithSponsors){
    const config = getDefaultDialogConfig();
    config.width = "650px";
    config.data = {
      sponsors: member.sponsors,
      member: member.member,
      theme: "vo-theme"
    };
    const dialogRef = this.dialog.open(EditMemberSponsorsDialogComponent, config);
    dialogRef.afterClosed().subscribe(() => {
      this.refreshTable.emit();
    });
  }

  isAllSelected() {
    return this.tableCheckbox.isAllSelected(this.selection.selected.length, this.filterValue, this.pageSize, this.paginator.hasNextPage(), this.dataSource);
  }

  masterToggle() {
    this.tableCheckbox.masterToggle(this.isAllSelected(), this.selection, this.filterValue, this.dataSource, this.sort, this.pageSize, this.paginator.pageIndex,false);
  }

  checkboxLabel(row?: MemberWithSponsors): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.member.id + 1}`;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  resetPassword(sponsoredMember: MemberWithSponsors) {
    this.loading = true;
    const attUrns = this.storeService.get('password_namespace_attributes').map(urn => {
      urn = urn.split(':');
      return urn[urn.length - 1];
    });
    this.attributesManager.getLogins(sponsoredMember.member.userId).subscribe(logins => {
      const filteredLogins = logins.filter(login => attUrns.includes(login.friendlyNameParameter));

      const config = getDefaultDialogConfig();
      config.width = '400px';
      config.data = {
        userId: sponsoredMember.member.userId,
        memberId: sponsoredMember.member.id,
        logins: filteredLogins
      };

      const dialogRef = this.dialog.open(PasswordResetRequestDialogComponent, config);

      dialogRef.afterClosed().subscribe(() => {
        this.loading = false;
      });
    }, () => this.loading = false);
  }

  passwdResetAuth(sponsoredMember: MemberWithSponsors) {
    const vo: Vo = {
      id: sponsoredMember.member.voId,
      beanName: "Vo"
    };

    return this.authResolver.isAuthorized('sendPasswordResetLinkEmail_Member_String_String_String_String_policy', [vo, sponsoredMember.member]);
  }
}
