import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FacilitiesManagerService,
  Facility,
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
              private authResolver: GuiAuthResolver) {
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
  disableDeleteTaskButton = true;

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

  delete() {
    for (const ss of this.selected.selected) {
      if (ss.task !== null) {
        this.tasksManager.deleteTask({ task: ss.task.id }).subscribe(() => {
          this.refreshTable();
          this.notificator.showSuccess(this.successDeleteMessage);
        });
      } else {
        this.notificator.showSuccess(this.allreadyDeletedMessage);
      }
    }
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
    this.disableDeleteTaskButton = true;

    for (const ss of this.selected.selected) {
      if (ss.blockedOnFacility) {
        this.disableAllowButton = false;
      } else {
        this.disableBlockButton = false;
      }
      if (ss.task) {
        this.disableDeleteTaskButton = false;
      }
    }
  }
}
