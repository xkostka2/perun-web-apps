import { Component, Inject, OnInit } from '@angular/core';
import { ExtSource, ExtSourcesManagerService } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TableConfigService } from '@perun-web-apps/config/table-config';
import { TranslateService } from '@ngx-translate/core';

export interface RemoveExtSourceDialogData {
  voId: number;
  groupId?: number;
  theme: string;
  extSources: ExtSource[];
}

@Component({
  selector: 'app-remove-ext-source-dialog',
  templateUrl: './remove-ext-source-dialog.component.html',
  styleUrls: ['./remove-ext-source-dialog.component.scss']
})
export class RemoveExtSourceDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<RemoveExtSourceDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: RemoveExtSourceDialogData,
              private extSourceService: ExtSourcesManagerService,
              private notificator: NotificatorService,
              private tableConfigService: TableConfigService,
              private translate: TranslateService) { }

  theme: string;
  extSources: ExtSource[] = [];
  displayedColumns: string[] = ['id', 'name'];
  loading = false;

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.extSources = this.data.extSources;
  }

  removeVoExtSource() {
    if (this.extSources.length === 0){
      this.translate.get('DIALOGS.REMOVE_EXT_SOURCES.SUCCESS_REMOVED').subscribe(successMessage => {
        this.notificator.showSuccess(successMessage);
        this.dialogRef.close(true);
      });
      return;
    }

    const extSource = this.extSources.pop();
    this.extSourceService.removeExtSourceWithVoSource(this.data.voId, extSource.id).subscribe(_ => {
      this.onRemove();
    }, () => this.loading = false);
  }

  removeGroupExtSource() {
    if (this.extSources.length === 0){
      this.translate.get('DIALOGS.REMOVE_EXT_SOURCES.SUCCESS_REMOVED').subscribe(successMessage => {
        this.notificator.showSuccess(successMessage);
        this.dialogRef.close(true);
      });
      return;
    }

    const extSource = this.extSources.pop();
    this.extSourceService.removeExtSourceWithGroupSource(this.data.groupId, extSource.id).subscribe(_ => {
      this.onRemove();
    }, () => this.loading = false);
  }

  onRemove() {
    this.loading = true;
    if (this.data.groupId) {
      this.removeGroupExtSource();
    } else {
      this.removeVoExtSource();
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
