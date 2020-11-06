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
import { MemberWithSponsors } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { getDefaultDialogConfig, parseFullName, TABLE_ITEMS_COUNT_OPTIONS } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import {  EditMemberSponsorsDialogComponent } from '../dialogs/edit-member-sponsors-dialog/edit-member-sponsors-dialog.component';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-sponsored-members-list',
  templateUrl: './sponsored-members-list.component.html',
  styleUrls: ['./sponsored-members-list.component.scss']
})
export class SponsoredMembersListComponent implements OnChanges, AfterViewInit {

  constructor(private dialog: MatDialog,
              private authResolver: GuiAuthResolver) { }

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

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property){
          case "id":
            if(item.member){
              return item.member.id;
            }
            break;
          case "name":
            if (item.member.user.lastName) {
              return item.member.user.lastName.toLowerCase();
            } else {
              return parseFullName(item.member.user);
            }
          default: return item[property];
        }
      };
      this.dataSource.sort = this.sort;

      this.dataSource.filterPredicate = (data: MemberWithSponsors, filter) => {
        const dataAsStr = data.member.id.toString() + parseFullName(data.member.user);
        return dataAsStr.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
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
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.refreshTable.emit();
      }
    });
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

  checkboxLabel(row?: MemberWithSponsors): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.member.id + 1}`;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

}
