import {Component, HostBinding, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { Application, RegistrarManagerService, Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { PageEvent } from '@angular/material/paginator';
import {
  TABLE_VO_APPLICATIONS_DETAILED, TABLE_VO_APPLICATIONS_NORMAL,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-vo-applications',
  templateUrl: './vo-applications.component.html',
  styleUrls: ['./vo-applications.component.scss']
})
export class VoApplicationsComponent implements OnInit {

  static id = 'VoApplicationsComponent';

  @HostBinding('class.router-component') true;

  constructor(private voService: VosManagerService,
              private registrarManager: RegistrarManagerService,
              private tableConfigService: TableConfigService,
              protected route: ActivatedRoute) { }

  state = 'pending';
  loading = false;
  applications: Application[] = [];
  vo: Vo;
  displayedColumns: string[] = ['id', 'createdAt', 'type', 'state', 'user', 'group', 'modifiedBy'];
  firstSearchDone: boolean;
  filterValue = '';
  showAllDetails = false;
  detailPageSize: number;
  pageSize: number;
  detailTableId = TABLE_VO_APPLICATIONS_DETAILED;
  tableId = TABLE_VO_APPLICATIONS_NORMAL;

  startDate: FormControl;
  endDate: FormControl;
  checked = false;

  ngOnInit() {
    this.detailPageSize = this.tableConfigService.getTablePageSize(this.detailTableId);
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);

    this.loading = true;
    this.route.parent.params.subscribe(parentParams => {
      const voId = parentParams['voId'];
      this.voService.getVoById(voId).subscribe(vo => {
        this.vo = vo;
        this.setData(['NEW', 'VERIFIED']);
      });
      this.startDate = new FormControl(formatDate(this.yearAgo(),'yyyy-MM-dd','en-GB'));
      this.endDate = new FormControl(formatDate(new Date(),'yyyy-MM-dd','en-GB'));
    });
  }


  setData(state: string[]) {
    this.registrarManager.getApplicationsForVo(this.vo.id, state, formatDate(this.startDate.value, 'yyyy-MM-dd','en-GB'), formatDate(this.endDate.value, 'yyyy-MM-dd','en-GB')).subscribe(applications => {
      if(this.checked === false) {
        this.applications = applications.filter(application => application.group === null);
      } else {
        this.applications = applications;
      }
      this.loading = false;
    });
  }

  select() {
    this.loading = true;
    switch (this.state) {
      case 'approved': {
        this.setData(['APPROVED']);
        break;
      }
      case 'rejected': {
        this.setData(['REJECTED']);
        break;
      }
      case 'wfmv': {
        this.setData(['NEW']);
        break;
      }
      case 'submited': {
        this.setData(['VERIFIED']);
        break;
      }
      case 'pending': {
        this.setData(['NEW', 'VERIFIED']);
        break;
      }
      case 'all': {
        this.setData(null);
        break;
      }
      default: {
        break;
      }
    }
  }

  yearAgo() {
    const date = new Date();
    const year = date.getFullYear() - 1;
    const month = date.getMonth();
    const day = date.getDate();
    return new Date(year, month, day);
  }

  showGroupApplications(event) {
    this.checked = event.checked;
    this.select();
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  detailPageChanged(event: PageEvent) {
    this.detailPageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.detailTableId, event.pageSize);
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
