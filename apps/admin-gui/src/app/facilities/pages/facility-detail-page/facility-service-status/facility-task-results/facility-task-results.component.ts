import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { TABLE_TASK_RESULTS, TableConfigService } from '@perun-web-apps/config/table-config';
import { Facility, Task, TaskResult, TasksManagerService } from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { DeleteTaskResultDialogComponent } from '../../../../../shared/components/dialogs/delete-task-result-dialog/delete-task-result-dialog.component';

@Component({
  selector: 'app-facility-task-results',
  templateUrl: './facility-task-results.component.html',
  styleUrls: ['./facility-task-results.component.scss']
})
export class FacilityTaskResultsComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private tableConfigService: TableConfigService,
              private taskManager: TasksManagerService,
              private authResolver: GuiAuthResolver,
              private dialog: MatDialog) { }

  loading = false;
  filterValue = '';

  selection: SelectionModel<TaskResult> = new SelectionModel<TaskResult>(true, []);
  taskId: number;
  task: Task;
  facility: Facility;
  taskResults: TaskResult[];

  pageSize: number;
  tableId = TABLE_TASK_RESULTS;
  displayedColumns = ['select', 'id', 'destination', 'type', 'service', 'status', 'time', 'returnCode', 'standardMessage', 'errorMessage'];

  removeAuth =  false;

  ngOnInit(): void {
    this.loading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.route.parent.params.subscribe(parentParams => {
      this.facility = {
       id: parseInt(parentParams['facilityId'], 10),
       beanName: "Facility"
      };

      this.removeAuth = this.authResolver.isAuthorized('deleteTask_Task_policy', [this.facility]);
      if(!this.removeAuth){
        this.displayedColumns = ['id', 'destination', 'type', 'service', 'status', 'time', 'returnCode', 'standardMessage', 'errorMessage'];
      }

      this.route.params.subscribe(params => {
        this.taskId = params['taskId'];
        this.taskManager.getTaskById(this.taskId).subscribe(task => {
          this.task = task;
          this.refreshTable();
        });
      });
    });
  }

  refreshTable(){
    this.loading = true;
    this.taskManager.getTaskResultsForGUIByTask(this.taskId).subscribe(taskResults => {
      this.selection.clear();
      this.taskResults = taskResults;
      this.loading = false;
    });
  }

  removeTaskResult() {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      theme: 'facility-theme',
      taskResults: this.selection.selected
    };

    const dialogRef = this.dialog.open(DeleteTaskResultDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.refreshTable();
      }
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

}
