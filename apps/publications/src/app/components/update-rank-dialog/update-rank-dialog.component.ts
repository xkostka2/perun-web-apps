import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { CabinetManagerService, Category } from '@perun-web-apps/perun/openapi';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'perun-web-apps-update-rank-dialog',
  templateUrl: './update-rank-dialog.component.html',
  styleUrls: ['./update-rank-dialog.component.scss']
})
export class UpdateRankDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<UpdateRankDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Category,
    private notificator: NotificatorService,
    private cabinetManagerService: CabinetManagerService,
    private translate: TranslateService
  ) {
    translate.get('DIALOGS.UPDATE_RANK.SUCCESS').subscribe(value => this.successMessage = value);
  }

  successMessage: string;
  loading: boolean;
  categoryName = '';
  rankCtrl: FormControl;

  ngOnInit() {
    this.categoryName = this.data.name;
    this.rankCtrl = new FormControl(this.data.rank, [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9])?$')]);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.loading = true;
    this.data.rank = this.rankCtrl.value;
    this.cabinetManagerService.updateCategory({category: this.data}).subscribe(() => {
      this.notificator.showSuccess(this.successMessage);
      this.loading = false;
      this.dialogRef.close(true);
    }, () => this.loading = false);
  }
}
