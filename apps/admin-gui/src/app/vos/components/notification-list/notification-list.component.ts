import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import {
  AddEditNotificationDialogComponent
} from '../../../shared/components/dialogs/add-edit-notification-dialog/add-edit-notification-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { ApplicationMail, RegistrarManagerService } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig, TABLE_ITEMS_COUNT_OPTIONS } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnChanges, AfterViewInit {

  constructor(
    private registrarService: RegistrarManagerService,
    private translate: TranslateService,
    private notificator: NotificatorService,
    private dialog: MatDialog,
    private authResolver: GuiAuthResolver) {
  }

  @Input()
  applicationMails: ApplicationMail[];

  @Input()
  voId: number;

  @Input()
  groupId: number;

  @Input()
  displayedColumns: string[] = ['select', 'id', 'mailType', 'appType', 'send'];

  @Input()
  disableSend = false;

  dataSource: MatTableDataSource<ApplicationMail>;

  @Input()
  selection = new SelectionModel<ApplicationMail>(true, []);
  @Input()
  pageSize = 10;
  @Input()
  theme: string;

  @Output()
  selectionChange = new EventEmitter<SelectionModel<ApplicationMail>>();
  @Output()
  page: EventEmitter<PageEvent> = new EventEmitter();

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  private sort: MatSort;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  ngOnChanges() {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.dataSource = new MatTableDataSource<ApplicationMail>(this.applicationMails);
    this.setDataSource();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
    this.selectionChange.emit(this.selection);
  }

  checkboxLabel(row?: ApplicationMail): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  changeSending(applicationMail: ApplicationMail) {
    if (applicationMail.send) {
      this.registrarService.setSendingEnabled({ mails: [applicationMail], enabled: false }).subscribe(() => {
        applicationMail.send = false;
      });
    } else {
      this.registrarService.setSendingEnabled({ mails: [applicationMail], enabled: true }).subscribe(() => {
        applicationMail.send = true;
      });
    }
  }

  openApplicationMailDetail(applicationMail: ApplicationMail) {
    const config = getDefaultDialogConfig();
    config.width = '1400px';
    config.height = '700px';
    config.data = {
      theme: this.theme,
      voId: this.voId,
      groupId: this.groupId,
      createMailNotification: false,
      applicationMail: applicationMail
    };

    const dialog = this.dialog.open(AddEditNotificationDialogComponent, config);
    dialog.afterClosed().subscribe(success => {
      if (success) {
        this.translate.get('VO_DETAIL.SETTINGS.NOTIFICATIONS.EDIT_SUCCESS').subscribe(text => {
          this.notificator.showSuccess(text);
        });
        this.selection.clear();
        this.selectionChange.emit(this.selection);
        this.update();
      }
    });
  }

  getMailType(applicationMail: ApplicationMail): string {
    let value = '';
    // @ts-ignore
    if (applicationMail.mailType === undefined || applicationMail.mailType === null || applicationMail.mailType === '') {
      value = '';
    } else {
      this.translate.get('VO_DETAIL.SETTINGS.NOTIFICATIONS.MAIL_TYPE_' + applicationMail.mailType).subscribe(text => {
        value = text;
      });
    }
    return value;
  }

  update() {
    if (this.groupId) {
      this.registrarService.getApplicationMailsForGroup(this.groupId).subscribe(mails => {
        this.updateTable(mails);
      });
    } else {
      this.registrarService.getApplicationMailsForVo(this.voId).subscribe(mails => {
        this.updateTable(mails);
      });
    }
  }

  toggle(row: any) {
    this.selection.toggle(row);
    this.selectionChange.emit(this.selection);
  }

  updateTable(mails: ApplicationMail[]) {
    this.applicationMails = mails;
    this.dataSource = new MatTableDataSource<ApplicationMail>(this.applicationMails);
    this.setDataSource();
  }

  private setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }
}
