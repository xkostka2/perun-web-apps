import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { CabinetManagerService} from '@perun-web-apps/perun/openapi';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'perun-web-apps-add-category-dialog',
  templateUrl: './add-category-dialog.component.html',
  styleUrls: ['./add-category-dialog.component.scss']
})
export class AddCategoryDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<AddCategoryDialogComponent>,
    private notificator: NotificatorService,
    private cabinetManagerService: CabinetManagerService,
    private translate: TranslateService
  ) {
    translate.get('DIALOGS.ADD_CATEGORY.SUCCESS').subscribe(value => this.successMessage = value);
  }

  successMessage: string;
  loading: boolean;

  nameCtrl: FormControl;
  rankCtrl: FormControl;

  ngOnInit() {
    this.nameCtrl = new FormControl(null, [Validators.required, Validators.pattern('^[\\w.-]+( [\\w.-]+)*$'), Validators.maxLength(128)]);
    this.rankCtrl = new FormControl(null, [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9])?$')]);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.loading = true;
    // @ts-ignore
    this.cabinetManagerService.createCategoryCat({category: {name: this.nameCtrl.value, rank: this.rankCtrl.value}}).subscribe(() => {
    // this.cabinetManagerService.createCategoryNR({name: this.nameCtrl.value, rank: this.rankCtrl.value}).subscribe(vo => {
      this.notificator.showSuccess(this.successMessage);
      this.loading = false;
      this.dialogRef.close(true);
    }, () => this.loading = false);
  }

}
