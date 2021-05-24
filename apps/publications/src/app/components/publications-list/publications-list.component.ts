import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  CabinetManagerService,
  PublicationForGUI,
  RichResource
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {
  customDataSourceSort, downloadData, getDataForExport, getDefaultDialogConfig, parseFullName,
  TABLE_ITEMS_COUNT_OPTIONS
} from '@perun-web-apps/perun/utils';
import { NotificatorService, TableCheckbox } from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ShowCiteDialogComponent } from '../../dialogs/show-cite-dialog/show-cite-dialog.component';

@Component({
  selector: 'perun-web-apps-publications-list',
  templateUrl: './publications-list.component.html',
  styleUrls: ['./publications-list.component.scss']
})
export class PublicationsListComponent implements OnChanges, AfterViewInit {

  constructor(private tableCheckbox: TableCheckbox,
              private cabinetService: CabinetManagerService,
              private dialog: MatDialog,
              private notificator: NotificatorService,
              private translate: TranslateService) {
    translate.get('PUBLICATIONS_LIST.CHANGE_LOCK_SUCCESS').subscribe(value => this.changeLockMessage = value);
    translate.get('PUBLICATIONS_LIST.LOCKED').subscribe(value => this.locked = value);
    translate.get('PUBLICATIONS_LIST.UNLOCKED').subscribe(value => this.unlocked = value);
  }

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @Input()
  publications: PublicationForGUI[];
  @Input()
  selection = new SelectionModel<PublicationForGUI>(true, []);
  @Input()
  displayedColumns: string[] = ['select', 'id', 'lock', 'title', 'reportedBy', 'year', 'category', 'thankedTo', 'cite'];
  @Input()
  pageSize = 10;
  @Output()
  page = new EventEmitter<PageEvent>();
  @Input()
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;
  @Input()
  routerPath: string;

  disabledRouting = false;

  private sort: MatSort;

  dataSource: MatTableDataSource<PublicationForGUI>;

  private paginator: MatPaginator;

  changeLockMessage: string;
  locked: string;
  unlocked: string;

  @ViewChild(MatPaginator, { static: true }) set matPaginator(pg: MatPaginator) {
    this.paginator = pg;
  };

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource<PublicationForGUI>(this.publications);
    this.setDataSource();
  }

  private setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.sortData = (data: PublicationForGUI[], sort: MatSort) => {
        return customDataSourceSort(data, sort, this.getDataForColumn, this);
      };
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  getDataForColumn(data: PublicationForGUI, column: string): string {
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'lock':
        return String(data.locked);
      case 'title':
        return data.title;
      case 'reportedBy':
        let result = '';
        data.authors.forEach(a => result+= parseFullName(a) + ';');
        return result.slice(0,-1);
      case 'year':
        return data.year.toString();
      case 'category':
        return data.categoryName;
      case 'thankedTo':
        let res = '';
        data.thanks.forEach(t => res+=t.ownerName + ';');
        return res.slice(0,-1);
      default:
        return data[column];
    }
  }

  exportData(format: string){
    downloadData(getDataForExport(this.dataSource.filteredData, this.displayedColumns, this.getDataForColumn, this), format);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    return this.tableCheckbox.isAllSelected(this.selection.selected.length, '', this.pageSize, this.paginator.hasNextPage(), this.dataSource);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.tableCheckbox.masterToggle(this.isAllSelected(), this.selection, '', this.dataSource, this.sort, this.pageSize, this.paginator.pageIndex, false);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: RichResource): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  itemSelectionToggle(item: RichResource) {
    this.selection.toggle(item);
  }

  showCite(publication: PublicationForGUI) {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = publication;

    this.dialog.open(ShowCiteDialogComponent, config);
  }

  lockOrUnlockPublication(publication: PublicationForGUI) {
    this.cabinetService.lockPublications({publications: [this.createPublication(publication)], lock: !publication.locked}).subscribe(() => {
      if (publication.locked) {
        this.notificator.showSuccess(this.changeLockMessage + this.unlocked);
      } else {
        this.notificator.showSuccess(this.changeLockMessage + this.locked);
      }
      publication.locked = !publication.locked;
    });
  }

  private createPublication(publication: PublicationForGUI): any {
    return {
      id: publication.id,
      externalId: publication.externalId,
      publicationSystemId: publication.publicationSystemId,
      categoryId: publication.categoryId,
      createdBy: publication.createdBy,
      createdDate: publication.createdDate,
      doi: publication.doi,
      isbn: publication.isbn,
      locked: publication.locked,
      main: publication.main,
      rank: publication.rank,
      title: publication.title,
      year: publication.year
    }
  }
}
