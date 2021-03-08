import { Component, OnInit } from '@angular/core';
import { CabinetManagerService, Category} from '@perun-web-apps/perun/openapi';
import { PageEvent } from '@angular/material/paginator';
import { TABLE_GROUP_RESOURCES_LIST, TableConfigService } from '@perun-web-apps/config/table-config';
import { SelectionModel } from '@angular/cdk/collections';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AddCategoryDialogComponent } from '../../components/add-category-dialog/add-category-dialog.component';
import { RemoveCategoryDialogComponent } from '../../components/remove-category-dialog/remove-category-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'perun-web-apps-categories-page',
  templateUrl: './categories-page.component.html',
  styleUrls: ['./categories-page.component.scss']
})
export class CategoriesPageComponent implements OnInit {

  constructor(private cabinetManagerService: CabinetManagerService,
              private tableConfigService: TableConfigService,
              private dialog: MatDialog,
              private guiAuthResolver: GuiAuthResolver) {
  }

  categories: Category[] = [];
  selected = new SelectionModel<Category>(true, []);
  loading: boolean;
  filterValue = '';
  pageSize: number;
  tableId = TABLE_GROUP_RESOURCES_LIST;

  removeAuth: boolean;
  addAuth: boolean;

  ngOnInit() {
    this.setAuth();
    this.refreshTable();
  }

  setAuth() {
    this.removeAuth = this.guiAuthResolver.isAuthorized('deleteCategory_Category_policy', []);
    this.addAuth = this.guiAuthResolver.isAuthorized('createCategory_Category_policy', []);
  }

  refreshTable() {
    this.loading = true;
    this.cabinetManagerService.getCategories().subscribe(categories => {
      this.categories = categories;
      this.loading = false;
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  addCategory() {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {};

    const dialogRef = this.dialog.open(AddCategoryDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  removeCategory() {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = this.selected.selected;

    const dialogRef = this.dialog.open(RemoveCategoryDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selected.clear();
        this.refreshTable();
      }
    });
  }

}
