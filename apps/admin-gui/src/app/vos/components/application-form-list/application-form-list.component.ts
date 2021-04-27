import {Component, Input, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {
  DeleteApplicationFormItemDialogComponent
} from '../../../shared/components/dialogs/delete-application-form-item-dialog/delete-application-form-item-dialog.component';
import {NotificatorService} from '@perun-web-apps/perun/services';
import {TranslateService} from '@ngx-translate/core';
import {
  EditApplicationFormItemDialogComponent
} from '../../../shared/components/dialogs/edit-application-form-item-dialog/edit-application-form-item-dialog.component';
import { ApplicationForm, ApplicationFormItem } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-application-form-list',
  templateUrl: './application-form-list.component.html',
  styleUrls: ['./application-form-list.component.scss']
})
export class ApplicationFormListComponent implements OnChanges {

  constructor(private dialog: MatDialog,
              private notificator: NotificatorService,
              private router: Router,
              private translate: TranslateService) { }

  @Input()
  loading: boolean;

  @Input()
  applicationForm: ApplicationForm;

  @Input()
  applicationFormItems: ApplicationFormItem[] = [];

  @Input()
  theme: string;

  @Input()
  displayedColumns: string[] = ['drag', 'shortname', 'type', 'preview', 'managegroups', 'edit', 'delete'];

  @Output()
  applicationFormItemsChange = new EventEmitter<ApplicationFormItem[]>();

  itemsChanged: number[] = [];

  dataSource = this.applicationFormItems;
  @ViewChild('table') table: MatTable<ApplicationFormItem>;

  mapForCombobox: Map<number, string> = new Map();
  dragDisabled = true;

  ngOnChanges(changes: SimpleChanges) {
    this.dataSource = this.applicationFormItems;

  }

  edit(applicationFormItem: ApplicationFormItem) {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.height = '600px';
    config.data = {
      voId: this.applicationForm.vo.id,
      group: this.applicationForm.group,
      applicationFormItem: applicationFormItem,
      theme: this.theme,
      allItems: this.applicationFormItems
    };

    const editDialog = this.dialog.open(EditApplicationFormItemDialogComponent, config);
    editDialog.afterClosed().subscribe((success) => {
      if (success) {
        this.itemsChanged.push(applicationFormItem.id);
        this.applicationFormItemsChange.emit();
      }
    });
  }

  delete(applicationFormItem: ApplicationFormItem) {
    const config = getDefaultDialogConfig();
    config.width = '500px';

    const dialog = this.dialog.open(DeleteApplicationFormItemDialogComponent, config);
    dialog.afterClosed().subscribe(deleteItem => {
      if (deleteItem) {
        applicationFormItem.forDelete = true;
        if (applicationFormItem.id === 0) {
          this.applicationFormItems.splice(this.applicationFormItems.indexOf(applicationFormItem), 1);
          this.table.renderRows();
        }
        this.applicationFormItemsChange.emit();
      }
    });
  }

  drop(event: CdkDragDrop<ApplicationFormItem[]>) {
    this.dragDisabled = true;
    const prevIndex = this.applicationFormItems.indexOf(event.item.data);
    moveItemInArray(this.applicationFormItems, prevIndex, event.currentIndex);
    this.itemsChanged.push(this.applicationFormItems[event.currentIndex].id);
    this.applicationFormItemsChange.emit();
    this.table.renderRows();
  }

  getLocalizedOptions(applicationFormItem: ApplicationFormItem): string[] {
    if (applicationFormItem.i18n[this.translate.getDefaultLang()]) {
      const options = applicationFormItem.i18n[this.translate.getDefaultLang()].options;
      if (options !== null && options !== '') {
        const labels: string[] = [];
        for (const item of options.split('|')) {
          labels.push(item.split('#')[1]);
        }
        return labels;
      }
    }
    return [];
  }

  getLocalizedLabel(applicationFormItem: ApplicationFormItem): string {
    if (applicationFormItem.i18n[this.translate.getDefaultLang()]) {
      return applicationFormItem.i18n[this.translate.getDefaultLang()].label;
    }
    return applicationFormItem.shortname;
  }

  restore(applicationFormItem: ApplicationFormItem) {
    applicationFormItem.forDelete = false;
  }

  openManagingGroups(applicationFormItem: ApplicationFormItem) {
    this.router.navigate(['/organizations', this.applicationForm.vo.id, 'settings', 'applicationForm', 'manageGroups']);
  }
}
