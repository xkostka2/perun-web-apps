import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TasksManagerService } from '@perun-web-apps/perun/openapi';

export interface DeleteTaskDialogCData {
  theme: string;
  taskId: number;
}

@Component({
  selector: 'app-delete-task-dialog',
  templateUrl: './delete-task-dialog.component.html',
  styleUrls: ['./delete-task-dialog.component.scss']
})
export class DeleteTaskDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<DeleteTaskDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DeleteTaskDialogCData,
              private tasksManager: TasksManagerService,
              private translate: TranslateService,
              private notificator: NotificatorService,
              ) { }

  loading = false;
  theme: string;
  taskId: number;

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.taskId = this.data.taskId;
  }

  remove() {
    this.loading = true;
    this.tasksManager.deleteTask({ task: this.taskId }).subscribe(() => {
      this.translate.get('DIALOGS.DELETE_TASK.SUCCESS').subscribe(successMessage => {
        this.notificator.showSuccess(successMessage);
        this.dialogRef.close(true);
      });
    }, () => this.loading = false);
  }

  cancel() {
    this.dialogRef.close(false);
  }

}
