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
import { Vo } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_ITEMS_COUNT_OPTIONS } from '@perun-web-apps/perun/utils';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-vo-select-table',
  templateUrl: './vo-select-table.component.html',
  styleUrls: ['./vo-select-table.component.scss']
})
export class VoSelectTableComponent implements OnChanges, AfterViewInit {

  constructor(private authResolver: GuiAuthResolver) { }

  @Input()
  vos: Vo[] = [];

  @Input()
  recentIds: number[];

  @Input()
  filterValue: string;

  @Input()
  selection: SelectionModel<Vo>;

  @Input()
  displayedColumns: string[];

  @Input()
  pageSize = 10;

  @Input()
  disableRouting = false;

  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  private sort: MatSort;

  dataSource: MatTableDataSource<Vo>;
  exporting = false;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.dataSource = new MatTableDataSource<Vo>(this.vos);
    this.setDataSource();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.filterPredicate = (data: Vo, filter: string) => {
        filter = filter.toLowerCase();
        const dataStr = (data.id.toString() + data.name + data.shortName).toLowerCase();
        return dataStr.indexOf(filter) !== -1;
      };
      this.dataSource.filter = this.filterValue;
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'id': {
            return +item.id;
          }
          case 'shortName' : {
            return item.shortName.toLocaleLowerCase();
          }
          case 'name' : {
            return item.name.toLocaleLowerCase();
          }
          default: return item[property];
        }
      };
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  checkboxLabel(row?: Vo): string {
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }
}
