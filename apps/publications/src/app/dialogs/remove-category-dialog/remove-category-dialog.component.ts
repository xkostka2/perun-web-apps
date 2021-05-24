import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { CabinetManagerService, Category} from '@perun-web-apps/perun/openapi';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'perun-web-apps-remove-category-dialog',
  templateUrl: './remove-category-dialog.component.html',
  styleUrls: ['./remove-category-dialog.component.scss']
})
export class RemoveCategoryDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<RemoveCategoryDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Category[],
              private notificator: NotificatorService,
              private translate: TranslateService,
              private cabinetManagerService: CabinetManagerService) { }

  loading: boolean;
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<Category>;
  categories: Category[] = [];

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<Category>(this.data);
    this.categories = this.data;
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.loading = true;
    if(this.categories.length){
      this.cabinetManagerService.deleteCategory(this.categories.pop().id).subscribe(()=>{
        this.onSubmit();
      }, ()=> this.loading = false);
    }else {
      this.translate.get('DIALOGS.REMOVE_CATEGORY.SUCCESS').subscribe(successMessage => {
        this.loading = false;
        this.notificator.showSuccess(successMessage);
        this.dialogRef.close(true);
      });
    }

  }

}
