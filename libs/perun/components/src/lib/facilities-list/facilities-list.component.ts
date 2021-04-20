import {
  ChangeDetectorRef,
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
import { EnrichedFacility} from '@perun-web-apps/perun/openapi';
import {
  customDataSourceFilterPredicate, customDataSourceSort, downloadData, getDataForExport,
  parseTechnicalOwnersNames,
  TABLE_ITEMS_COUNT_OPTIONS
} from '@perun-web-apps/perun/utils';
import { SelectionModel } from '@angular/cdk/collections';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-facilities-list',
  templateUrl: './facilities-list.component.html',
  styleUrls: ['./facilities-list.component.scss']
})
export class FacilitiesListComponent implements OnChanges {

  constructor(
    private authResolver: GuiAuthResolver,
    private cd: ChangeDetectorRef
  ) { }

  @Input()
  facilities: EnrichedFacility[];

  @Input()
  recentIds: number[];

  @Input()
  filterValue: string;

  @Input()
  pageSize = 10;

  @Input()
  displayedColumns: string[] = ['select', 'id', 'recent', 'name', 'description', 'technicalOwners', 'destinations', 'hosts'];

  @Input()
  selection: SelectionModel<EnrichedFacility>;

  @Input()
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @ViewChild(MatPaginator) set matPaginator(pg: MatPaginator) {
    this.paginator = pg;
    this.setDataSource();
    this.cd.detectChanges();
  }

  private sort: MatSort;
  private paginator: MatPaginator;

  dataSource: MatTableDataSource<EnrichedFacility>;
  disableRouting: boolean;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.setDataSource();
  }

  getDataForColumn(data: EnrichedFacility, column: string, otherThis: FacilitiesListComponent): string{
    switch (column) {
      case 'id':
        return data.facility.id.toString();
      case 'name':
        return  data.facility.name;
      case 'description':
        return data.facility.description;
      case 'technicalOwners':
        return parseTechnicalOwnersNames(data.owners);
      case 'recent':
        if (otherThis.recentIds) {
          if (otherThis.recentIds.indexOf(data.facility.id) > -1) {
            return '#'.repeat(otherThis.recentIds.indexOf(data.facility.id));
          }
        }
        return data['name'];
      case 'destinations':
        return data.destinations.map(d => d.destination).join(' ; ')
      case 'hosts':
        return data.hosts.map(d => d.hostname).join(' ; ')
      default:
        return data[column];
    }
  }

  exportData(format: string){
    downloadData(getDataForExport(this.dataSource.filteredData, this.displayedColumns, this.getDataForColumn, this), format);
  }

  setDataSource() {
    if (!this.paginator) {
      return;
    }
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource<EnrichedFacility>();
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource.filterPredicate = (data: EnrichedFacility, filter: string) => {
        return customDataSourceFilterPredicate(data, filter, this.displayedColumns, this.getDataForColumn, this)
      };
      this.dataSource.sortData = (data: EnrichedFacility[], sort: MatSort) => {
        return customDataSourceSort(data, sort, this.getDataForColumn, this);
      };
    }
    this.dataSource.filter = this.filterValue;
    this.dataSource.data = this.facilities;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: EnrichedFacility): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.facility.id + 1}`;
  }

  pageChanged(event: PageEvent) {
    this.page.emit(event);
  }
}
