import { Component, Input, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
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
export class ApplicationFormListComponent implements OnInit, OnChanges {

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
  displayedColumns: string[] = ['drag', 'shortname', 'type', 'disabled', 'hidden', 'preview', 'managegroups', 'edit', 'delete'];

  @Output()
  applicationFormItemsChange = new EventEmitter<ApplicationFormItem[]>();

  itemsChanged: number[] = [];

  dataSource = this.applicationFormItems;
  @ViewChild('table') table: MatTable<ApplicationFormItem>;

  mapForCombobox: Map<number, string> = new Map();
  dragDisabled = true;

  // labels and tooltips
  ifEmpty: string;
  ifPrefilled: string;
  alwaysDisabled: string;
  alwaysHidden: string;
  isDisabledIf: string;
  isHiddenIf: string;
  isEmpty: string;
  isPrefilled: string;

  ngOnInit() {
    // labels for hidden and disabled icons
    this.ifEmpty = this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.DISABLED_HIDDEN_ICON.IF_EMPTY');
    this.ifPrefilled = this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.DISABLED_HIDDEN_ICON.IF_PREFILLED');

    // tooltips for hidden and disabled icons
    this.alwaysDisabled = this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.DISABLED_HIDDEN_ICON.ALWAYS_DISABLED_HINT');
    this.alwaysHidden = this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.DISABLED_HIDDEN_ICON.ALWAYS_HIDDEN_HINT')
    this.isDisabledIf = this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.DISABLED_HIDDEN_ICON.DISABLED_IF_HINT');
    this.isHiddenIf = this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.DISABLED_HIDDEN_ICON.HIDDEN_IF_HINT');
    this.isEmpty = this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.DISABLED_HIDDEN_ICON.IS_EMPTY_HINT');
    this.isPrefilled = this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.DISABLED_HIDDEN_ICON.IS_PREFILLED_HINT');
  }

  ngOnChanges(changes: SimpleChanges) {
    this.dataSource = this.applicationFormItems;

  }

  disabledHiddenDependency(item: ApplicationFormItem, dependency: string, dependencyItemId: number): string {
    let message = "";
    if (dependency === "IF_EMPTY" || dependency === "IF_PREFILLED") {
      const dep = dependencyItemId === null ? "" : this.applicationFormItems.find(i => i.id === dependencyItemId).shortname;
      message = dependency === "IF_EMPTY" ? `(${this.ifEmpty} ${dep})` : `(${this.ifPrefilled} ${dep})`;
    }
    return message;
  }

  disabledTooltip(item: ApplicationFormItem): string {
    let dep: string;
    switch (item.disabled) {
      case 'ALWAYS':
        return this.alwaysDisabled;
      case 'IF_EMPTY':
        dep = item.disabledDependencyItemId === null ? "" : this.applicationFormItems.find(i => i.id === item.disabledDependencyItemId).shortname;
        return `${this.isDisabledIf} ${dep} ${this.isEmpty}`;
      case 'IF_PREFILLED':
        dep = item.disabledDependencyItemId === null ? "" : this.applicationFormItems.find(i => i.id === item.disabledDependencyItemId).shortname;
        return `${this.isDisabledIf} ${dep} ${this.isPrefilled}`;
    }
  }

  hiddenTooltip(item: ApplicationFormItem): string {
    let dep: string;
    switch (item.hidden) {
      case 'ALWAYS':
        return this.alwaysHidden;
      case 'IF_EMPTY':
        dep = item.hiddenDependencyItemId === null ? "" : this.applicationFormItems.find(i => i.id === item.hiddenDependencyItemId).shortname;
        return `${this.isHiddenIf} ${dep} ${this.isEmpty}`;
      case 'IF_PREFILLED':
        dep = item.hiddenDependencyItemId === null ? "" : this.applicationFormItems.find(i => i.id === item.hiddenDependencyItemId).shortname;
        return `${this.isHiddenIf} ${dep} ${this.isPrefilled}`;
    }
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
