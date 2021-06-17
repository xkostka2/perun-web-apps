import {Component, HostBinding, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {SelectionModel} from '@angular/cdk/collections';
import {TranslateService} from '@ngx-translate/core';
import {
  DeleteNotificationDialogComponent
} from '../../../../../shared/components/dialogs/delete-notification-dialog/delete-notification-dialog.component';
import { GuiAuthResolver, NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import {
  EditEmailFooterDialogComponent
} from '../../../../../shared/components/dialogs/edit-email-footer-dialog/edit-email-footer-dialog.component';
import {
  AddEditNotificationDialogComponent
} from '../../../../../shared/components/dialogs/add-edit-notification-dialog/add-edit-notification-dialog.component';
import {
  NotificationsCopyMailsDialogComponent
} from '../../../../../shared/components/dialogs/notifications-copy-mails-dialog/notifications-copy-mails-dialog.component';
import {
  ApplicationForm,
  ApplicationMail,
  RegistrarManagerService,
  VosManagerService,
  Vo
} from '@perun-web-apps/perun/openapi';
import { createNewApplicationMail, getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import {
  TABLE_VO_SETTINGS_NOTIFICATIONS,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-vo-settings-notifications',
  templateUrl: './vo-settings-notifications.component.html',
  styleUrls: ['./vo-settings-notifications.component.scss']
})
export class VoSettingsNotificationsComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(
    private route: ActivatedRoute,
    private registrarService: RegistrarManagerService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private tableConfigService: TableConfigService,
    private notificator: NotificatorService,
    private authResolver: GuiAuthResolver,
    private voService: VosManagerService,
    private store: StoreService) {
  }

  loading = false;
  voId: number;
  vo: Vo;
  applicationForm: ApplicationForm;
  applicationMails: ApplicationMail[] = [];
  selection = new SelectionModel<ApplicationMail>(true, []);
  pageSize: number;
  tableId = TABLE_VO_SETTINGS_NOTIFICATIONS;
  displayedColumns: String[] = [];

  addAuth: boolean;
  removeAuth: boolean;
  copyAuth: boolean;


  ngOnInit() {
    this.loading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.route.parent.parent.params.subscribe(params => {
      this.voId = params['voId'];
      this.registrarService.getVoApplicationForm(this.voId).subscribe( form => {
        this.applicationForm = form;
        this.registrarService.getApplicationMailsForVo(this.voId).subscribe( mails => {
          this.applicationMails = mails;
          this.voService.getVoById(this.voId).subscribe(vo => {
            this.vo = vo;
            this.setAuthRights();
            this.loading = false;
          });
        });
      });
    });
  }

  setAuthRights() {
    this.addAuth = this.authResolver.isAuthorized('vo-addMail_ApplicationForm_ApplicationMail_policy', [this.vo]);
    this.removeAuth = this.authResolver.isAuthorized('vo-deleteMailById_ApplicationForm_Integer_policy', [this.vo]);
    this.copyAuth = this.authResolver.isAuthorized('copyMailsFromVoToVo_Vo_Vo_policy', [this.vo]);

    this.displayedColumns = this.removeAuth ? ['select', 'id', 'mailType', 'appType', 'send'] : [ 'id', 'mailType', 'appType', 'send'];
  }

  add() {
    const supportedLangs = this.store.get('supportedLanguages');
    const applicationMail: ApplicationMail = createNewApplicationMail(supportedLangs);
    applicationMail.formId = this.applicationForm.id;

    const config = getDefaultDialogConfig();
    config.width = '1400px';
    config.height = '700px';
    config.data = { theme: 'vo-theme', voId: this.voId, createMailNotification: true, applicationMail: applicationMail, applicationMails: this.applicationMails};

    const dialog = this.dialog.open(AddEditNotificationDialogComponent, config);
    dialog.afterClosed().subscribe( success => {
      if (success) {
        this.translate.get('VO_DETAIL.SETTINGS.NOTIFICATIONS.ADD_SUCCESS').subscribe( text => {
          this.notificator.showSuccess(text);
        });
        this.selection.clear();
        this.updateTable();
      }
    });
  }

  remove() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {voId: this.voId, mails: this.selection.selected, theme: 'vo-theme'};

    const dialog = this.dialog.open(DeleteNotificationDialogComponent, config);
    dialog.afterClosed().subscribe( success => {
      if (success) {
        this.translate.get('VO_DETAIL.SETTINGS.NOTIFICATIONS.DELETE_SUCCESS').subscribe( text => {
          this.notificator.showSuccess(text);
        });
        this.selection.clear();
        this.updateTable();
      }
    });
  }

  copy() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {voId: this.voId, theme: 'vo-theme'};

    const dialog = this.dialog.open(NotificationsCopyMailsDialogComponent, config);
    dialog.afterClosed().subscribe( copyFrom => {
      if (copyFrom) {
        this.selection.clear();
        this.updateTable();
      }
    });
  }

  updateTable() {
    this.loading = true;
    this.registrarService.getApplicationMailsForVo(this.voId).subscribe( mails => {
      this.applicationMails = mails;
      this.loading = false;
    });
  }

  changeEmailFooter() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {voId: this.voId, theme: 'vo-theme'};

    this.dialog.open(EditEmailFooterDialogComponent, config);
  }

  changeSelection(selection: SelectionModel<ApplicationMail>) {
    this.selection = selection;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
