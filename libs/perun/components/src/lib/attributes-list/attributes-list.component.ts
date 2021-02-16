import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges, Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {AttributeValueComponent} from './attribute-value/attribute-value.component';
import { Attribute} from '@perun-web-apps/perun/openapi';
import {
  customDataSourceFilterPredicate, customDataSourceSort,
  filterCoreAttributes,
  isVirtualAttribute,
  TABLE_ITEMS_COUNT_OPTIONS
} from '@perun-web-apps/perun/utils';
import { GuiAuthResolver, TableCheckbox } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-attributes-list',
  templateUrl: './attributes-list.component.html',
  styleUrls: ['./attributes-list.component.scss']
})
export class AttributesListComponent implements OnChanges, AfterViewInit {

  constructor(private authResolver: GuiAuthResolver,
              private tableCheckbox: TableCheckbox) {
  }

  @ViewChild(MatSort, {static: true}) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @ViewChildren(AttributeValueComponent)
  items: QueryList<AttributeValueComponent>;

  private paginator: MatPaginator;

  @ViewChild(MatPaginator, { static: true }) set matPaginator(pg: MatPaginator) {
    this.paginator = pg;
  };

  @Input()
  attributes: Attribute[] = [];

  @Input()
  selection = new SelectionModel<Attribute>(true, []);

  private sort: MatSort;

  displayedColumns: string[] = ['select', 'id', 'displayName', 'value', 'description'];
  dataSource: MatTableDataSource<Attribute>;

  // set this true when used in dialog window
  @Input()
  inDialog = false;

  @Input()
  filterValue = '';

  @Input()
  pageSize = 10;

  @Output()
  page = new EventEmitter<PageEvent>();

  @Input()
  readonly = false;

  @Input()
  hiddenColumns: string[] = [];

  exporting = false;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.dataSource = new MatTableDataSource<Attribute>(filterCoreAttributes(this.attributes));
    this.setDataSource();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  getDataForColumn(data: Attribute, column: string): string{
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'displayName':
        return data.displayName;
      case 'description':
        return  data.description;
      default:
        return '';
    }
  }

  setDataSource() {
    this.displayedColumns = this.displayedColumns.filter(x => !this.hiddenColumns.includes(x));
    if (!!this.dataSource) {
      this.dataSource.filterPredicate = (data: Attribute, filter: string) => {
        return customDataSourceFilterPredicate(data, filter, this.displayedColumns, this.getDataForColumn, this)
      };
      this.dataSource.sortData = (data: Attribute[], sort: MatSort) => {
        return customDataSourceSort(data, sort, this.getDataForColumn, this);
      };
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource.filter = this.filterValue;
    }
  }

  isAllSelected() {
    return this.tableCheckbox.isAllSelectedWithDisabledCheckbox(this.selection.selected.length, this.filterValue, this.pageSize, this.paginator.hasNextPage(), this.paginator.pageIndex, this.dataSource, this.sort, this.canBeSelected);
  }

  masterToggle() {
    this.tableCheckbox.masterToggle(this.isAllSelected(), this.selection, this.filterValue, this.dataSource, this.sort, this.pageSize, this.paginator.pageIndex, true, this.canBeSelected);
  }

  checkboxLabel(row?: Attribute): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  updateMapAttributes() {
    for (const item of this.items.toArray()) {
      if (item.attribute.type === 'java.util.LinkedHashMap') {
        item.updateMapAttribute();
      }
    }
  }

  onValueChange(attribute: Attribute) {
    if(this.canBeSelected(attribute)){
      this.selection.select(attribute);
    }
  }

  canBeSelected(attribute: Attribute): boolean{
    return !isVirtualAttribute(attribute) && attribute.writable;
  }

  pageChanged(event: PageEvent) {
    this.page.emit(event);
  }
}
