import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Category} from '@perun-web-apps/perun/openapi';
import {
  customDataSourceFilterPredicate,
  customDataSourceSort, getDefaultDialogConfig,
  TABLE_ITEMS_COUNT_OPTIONS
} from '@perun-web-apps/perun/utils';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { GuiAuthResolver, TableCheckbox } from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';
import { UpdateRankDialogComponent } from '../../dialogs/update-rank-dialog/update-rank-dialog.component';

@Component({
  selector: 'perun-web-apps-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss']
})
export class CategoriesListComponent implements AfterViewInit, OnChanges {

  constructor(private guiAuthResolver: GuiAuthResolver,
              private tableCheckbox: TableCheckbox,
              private dialog: MatDialog) { }

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @Input()
  categories: Category[] = [];
  @Input()
  selection = new SelectionModel<Category>(true, []);
  @Input()
  filterValue: string;
  @Input()
  pageSize = 10;
  @Input()
  displayedColumns: string[] = ['select', 'id', 'name', 'rank'];
  @Input()
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @Output()
  refreshTable = new EventEmitter<void>();

  private sort: MatSort;

  dataSource: MatTableDataSource<Category>;

  exporting = false;

  private paginator: MatPaginator;

  @ViewChild(MatPaginator, { static: true }) set matPaginator(pg: MatPaginator) {
    this.paginator = pg;
  };

  ngOnChanges() {
    this.dataSource = new MatTableDataSource<Category>(this.categories);
    this.setDataSource();
    this.dataSource.filter = this.filterValue;
  }

  getDataForColumn(data: Category, column: string): string{
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'name':
        return  data.name;
      case 'rank':
        return data.rank.toString();
      default:
        return data[column];
    }
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.filterPredicate = (data: Category, filter: string) => {
        return customDataSourceFilterPredicate(data, filter, this.displayedColumns, this.getDataForColumn, this)
      };
      this.dataSource.sortData = (data: Category[], sort: MatSort) => {
        return customDataSourceSort(data, sort, this.getDataForColumn, this);
      };
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    return this.tableCheckbox.isAllSelected(this.selection.selected.length, this.filterValue, this.pageSize, this.paginator.hasNextPage(), this.dataSource);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.tableCheckbox.masterToggle(this.isAllSelected(), this.selection, this.filterValue, this.dataSource, this.sort, this.pageSize, this.paginator.pageIndex, false);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Category): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  itemSelectionToggle(item: Category) {
    this.selection.toggle(item);
  }

  updateCategory(category) {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = category;

    const dialogRef = this.dialog.open(UpdateRankDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable.emit();
      }
    });
  }
}
