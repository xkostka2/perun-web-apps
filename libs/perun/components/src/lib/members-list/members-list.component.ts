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
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {SelectionModel} from '@angular/cdk/collections';
import { RichMember } from '@perun-web-apps/perun/openapi';
import {
  getDefaultDialogConfig,
  parseEmail,
  parseFullName, parseOrganization,
  TABLE_ITEMS_COUNT_OPTIONS
} from '@perun-web-apps/perun/utils';
import { ChangeMemberStatusDialogComponent } from '@perun-web-apps/perun/dialogs';

@Component({
  selector: 'perun-web-apps-members-list',
  templateUrl: './members-list.component.html',
  styleUrls: ['./members-list.component.scss']
})
export class MembersListComponent implements OnChanges, AfterViewInit {

  constructor(private dialog: MatDialog) { }

  private sort: MatSort;

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @Input()
  showGroupStatuses: boolean;

  @Input()
  members: RichMember[];

  @Input()
  searchString: string;

  @Input()
  selection: SelectionModel<RichMember>;

  @Input()
  hideColumns: string[] = [];

  @Input()
  pageSize = 10;

  @Input()
  disableRouting = false;

  @Input()
  filter = '';

  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @Output()
  updateTable = new EventEmitter<boolean>();

  exporting = false;

  displayedColumns: string[] = ['checkbox', 'id', 'fullName', 'status', 'organization', 'email', 'logins'];
  dataSource: MatTableDataSource<RichMember>;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  setDataSource() {
    this.displayedColumns = this.displayedColumns.filter(x => !this.hideColumns.includes(x));
    if (!!this.dataSource) {
      this.dataSource.filterPredicate =
        (data: RichMember, filter: string) => parseFullName(data.user).toLowerCase().includes(filter.toLowerCase()) ||
          data.id.toString(10).includes(filter);
      this.dataSource.filter = this.filter;

      this.dataSource.sort = this.sort;
      this.dataSource.sortingDataAccessor = (richMember, property) => {
        switch (property) {
          case 'fullName':
            if (richMember.user.lastName) {
              return richMember.user.lastName.toLocaleLowerCase();
            } else {
              return parseFullName(richMember.user);
            }
          case 'email':
            return parseEmail(richMember);
          case 'organization':
            return parseOrganization(richMember);
          default:
            return richMember[property];
        }
      };
      this.dataSource.sortData = (data,sort) => {
        const active = sort.active;
        const direction = sort.direction;

        if (!active || direction === '') { return data; }

        return data.sort((a, b) => {
          const valueA = this.dataSource.sortingDataAccessor(a, active);
          const valueB = this.dataSource.sortingDataAccessor(b, active);

          let comparatorResult = 0;
          if (valueA != null && valueB != null) {
            comparatorResult = valueA.toString().localeCompare(valueB.toString(), 'cs');
          } else if (valueA != null) {
            comparatorResult = 1;
          } else if (valueB != null) {
            comparatorResult = -1;
          }
          return comparatorResult * (direction === 'asc' ? 1 : -1);
        });
      }

      this.dataSource.paginator = this.paginator;
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.displayedColumns = this.displayedColumns.filter(x => !this.hideColumns.includes(x));
    this.dataSource = new MatTableDataSource<RichMember>(this.members);
    this.setDataSource();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
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
          this.updateTable.emit(true);
        }
      });
    }
  }

  pageChanged(event: PageEvent) {
    this.page.emit(event);
  }
}
