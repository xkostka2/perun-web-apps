import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FacilitiesManagerService,
  Facility, ResourcesManagerService,
  ServicesManagerService,
  ServiceState,
  TasksManagerService
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import {
  TABLE_FACILITY_SERVICES_STATUS_LIST,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { DeleteTaskResultDialogComponent } from '../../../../shared/components/dialogs/delete-task-result-dialog/delete-task-result-dialog.component';
import { DeleteServiceFromFacilityComponent } from '../../../../shared/components/dialogs/delete-service-from-facility/delete-service-from-facility.component';
import { DeleteTaskDialogComponent } from '../../../../shared/components/dialogs/delete-task-dialog/delete-task-dialog.component';

@Component({
  selector: 'app-facility-service-status',
  templateUrl: './facility-service-status.component.html',
  styleUrls: ['./facility-service-status.component.scss']
})
export class FacilityServiceStatusComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private tasksManager: TasksManagerService,
              private tableConfigService: TableConfigService,
              private servicesManager: ServicesManagerService,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private authResolver: GuiAuthResolver,
              private facilityManager: FacilitiesManagerService,
              private resourcesManager: ResourcesManagerService,
              private dialog: MatDialog) {
    translate.get('FACILITY_DETAIL.SERVICES_STATUS.SUCCESS_FORCE_PROPAGATION').subscribe(value => this.successFPMessage = value);
    translate.get('FACILITY_DETAIL.SERVICES_STATUS.SUCCESS_ALLOW').subscribe(value => this.successAllowMessage = value);
    translate.get('FACILITY_DETAIL.SERVICES_STATUS.SUCCESS_BLOCK').subscribe(value => this.successBlockMessage = value);
    translate.get('FACILITY_DETAIL.SERVICES_STATUS.SUCCESS_DELETE').subscribe(value => this.successDeleteMessage = value);
    translate.get('FACILITY_DETAIL.SERVICES_STATUS.ALREADY_DELETED').subscribe(value => this.allreadyDeletedMessage = value);
  }

  facilityId: number;
  facility: Facility;
  servicesStates: ServiceState[] = [];

  selected = new SelectionModel<ServiceState>(true, []);
  filterValue = '';
  loading: boolean;
  pageSize: number;

  tableId = TABLE_FACILITY_SERVICES_STATUS_LIST;

  successFPMessage: string;
  successAllowMessage: string;
  successBlockMessage: string;
  successDeleteMessage: string;
  allreadyDeletedMessage: string;

  disableAllowButton = true;
  disableBlockButton = true;
  disableRemoveButton = true;
  taskIsNull: boolean;
  taskId: number;

  propagationAuth: boolean;
  allowAuth: boolean;
  blockAuth: boolean;
  deleteAuth: boolean;
  routeAuth: boolean;

  ngOnInit(): void {
    this.loading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);

    this.route.parent.params.subscribe(params => {
      this.facilityId = parseInt(params['facilityId'], 10);
      this.facility = {
        id: this.facilityId,
        beanName: 'Facility'
      };
      this.refreshTable();
    });
  }

  forcePropagation() {
    for (const ss of this.selected.selected) {
      this.servicesManager.forceServicePropagation(ss.service.id, ss.facility.id).subscribe(() => {
        this.refreshTable();
        this.notificator.showSuccess(this.successFPMessage);
      });
    }
  }

  allow() {
    for (const ss of this.selected.selected) {
      this.servicesManager.unblockServiceOnFacility(ss.service.id, ss.facility.id).subscribe(() => {
        this.refreshTable();
        this.notificator.showSuccess(this.successAllowMessage);
      });
    }
  }

  block() {
    for (const ss of this.selected.selected) {
      this.servicesManager.blockServiceOnFacility(ss.service.id, ss.facility.id).subscribe(() => {
        this.refreshTable();
        this.notificator.showSuccess(this.successBlockMessage);
      });
    }
  }

  removeTaskResults() {
    this.tasksManager.getTaskResultsForGUIByTask(this.selected.selected[0].task.id).subscribe(taskResults => {
      const config = getDefaultDialogConfig();
      config.width = '600px';
      config.data = {
        theme: 'facility-theme',
        taskResults: taskResults
      };
      this.dialog.open(DeleteTaskResultDialogComponent, config);
    });
  }

  removeServiceFromFacility() {
    this.facilityManager.getAssignedResourcesByAssignedServiceForFacility(this.selected.selected[0].facility.id, this.selected.selected[0].service.id).subscribe(resources => {
      const config = getDefaultDialogConfig();
      config.width = '600px';
      this.taskId = this.taskIsNull ? null : this.selected.selected[0].task.id;

      if (resources.length === 0) {
        config.data = {
          theme: 'facility-theme',
          taskId: this.taskId
        };
        const dialogRef = this.dialog.open(DeleteTaskDialogComponent, config);

        dialogRef.afterClosed().subscribe(result => {
          if(result){
            this.disableRemoveButton = true;
            this.refreshTable();
          }
        });
      } else {
        this.resourcesManager.getRichResourcesByIds(resources.map(resource => resource.id)).subscribe(richResources => {
          config.data = {
            theme: 'facility-theme',
            taskId: this.taskId,
            serviceId: this.selected.selected[0].service.id,
            facilityId: this.selected.selected[0].facility.id,
            resource: richResources
          };
          const dialogRef = this.dialog.open(DeleteServiceFromFacilityComponent, config);

          dialogRef.afterClosed().subscribe(result => {
            if(result){
              this.disableRemoveButton = true;
              this.refreshTable();
            }
          });
        });
      }
    });
  }

  refreshTable() {
    this.loading = true;
    this.tasksManager.getFacilityServicesState(this.facilityId).subscribe(states => {
      this.servicesStates = states;
      this.selected.clear();
      this.setAuthRights();
      this.loading = false;
    });
  }

  setAuthRights(){
    this.propagationAuth = this.authResolver.isAuthorized('forceServicePropagation_Facility_Service_policy', [this.facility]);
    this.blockAuth = this.authResolver.isAuthorized('blockServiceOnFacility_Service_Facility_policy', [this.facility]);
    this.allowAuth = this.authResolver.isAuthorized('unblockServiceOnFacility_Service_Facility_policy', [this.facility]);
    this.deleteAuth = this.authResolver.isAuthorized('deleteTask_Task_policy', [this.facility]);
    this.routeAuth = this.authResolver.isAuthorized('getTaskResultsByTask_int_policy', [this.facility]);
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  selectionChanged() {
    this.disableBlockButton = true;
    this.disableAllowButton = true;
    this.disableRemoveButton = this.selected.selected.length !== 1;

    if (!this.disableRemoveButton) {
      this.taskIsNull = this.selected.selected[0].task === null;
    }

    for (const ss of this.selected.selected) {
      if (ss.blockedOnFacility) {
        this.disableAllowButton = false;
      } else {
        this.disableBlockButton = false;
      }
    }
  }
}
