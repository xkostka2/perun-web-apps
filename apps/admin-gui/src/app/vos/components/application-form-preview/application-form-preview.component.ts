import {Component, HostBinding, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { ApplicationFormItem } from '@perun-web-apps/perun/openapi';
import { TranslateService } from '@ngx-translate/core';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-application-form-preview',
  templateUrl: './application-form-preview.component.html',
  styleUrls: ['./application-form-preview.component.scss']
})
export class ApplicationFormPreviewComponent implements OnInit {

  @HostBinding('class.router-component') true;

  loading = true;
  applicationFormItems: ApplicationFormItem[] = [];
  currentLanguage = 'en';
  languages = ['en']
  initialPage = true;
  mapForCombobox: Map<number, string> = new Map();

  constructor(protected route: ActivatedRoute,
              private translate: TranslateService,
              private store: StoreService) { }

  ngOnInit() {
    this.languages = this.store.get('supportedLanguages')
    this.route.queryParamMap.subscribe( params => {
      this.applicationFormItems = JSON.parse(params.get('applicationFormItems'));
      this.loading = false;
    });
  }

  switchToInitial() {
    this.initialPage = true;
  }

  switchToExtension() {
    this.initialPage = false;
  }

  getLocalizedOptions(applicationFormItem: ApplicationFormItem): string[] {
    if (applicationFormItem.i18n[this.currentLanguage]) {
      const options = applicationFormItem.i18n[this.currentLanguage].options;
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

  isValid(applicationFormItem: ApplicationFormItem) {
    if (applicationFormItem.forDelete) {
      return false;
    }
    for (const type of applicationFormItem.applicationTypes) {
      if (type === 'INITIAL' && this.initialPage) {
        return true;
      }
      if (type === 'EXTENSION' && !this.initialPage) {
        return true;
      }
    }
    return false;
  }

  disabledTooltip(item: ApplicationFormItem): string {
    let messStart: string;
    let dep: string;
    let messEnd: string;
    switch (item.disabled) {
      case 'ALWAYS':
        return this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.PREVIEW_PAGE.DISABLED_HIDDEN_ICON.ALWAYS_DISABLED');
      case 'IF_PREFILLED':
        messStart = this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.PREVIEW_PAGE.DISABLED_HIDDEN_ICON.DISABLED_WHEN');
        dep =  item.hiddenDependencyItemId === null ? "" : this.applicationFormItems.find(i => i.id === item.disabledDependencyItemId).shortname;
        messEnd = this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.PREVIEW_PAGE.DISABLED_HIDDEN_ICON.IS_PREFILLED');
        return `${messStart} ${dep} ${messEnd}`;
      case 'IF_EMPTY':
        messStart = this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.PREVIEW_PAGE.DISABLED_HIDDEN_ICON.DISABLED_WHEN');
        dep =  item.hiddenDependencyItemId === null ? "" : this.applicationFormItems.find(i => i.id === item.disabledDependencyItemId).shortname;
        messEnd = this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.PREVIEW_PAGE.DISABLED_HIDDEN_ICON.IS_EMPTY');
        return `${messStart} ${dep} ${messEnd}`;
      default:
        return "";
    }
  }

  hiddenTooltip(item: ApplicationFormItem): string {
    let messStart: string;
    let dep: string;
    let messEnd: string;
    switch (item.hidden) {
      case 'ALWAYS':
        return this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.PREVIEW_PAGE.DISABLED_HIDDEN_ICON.ALWAYS_HIDDEN');
      case 'IF_PREFILLED':
        messStart = this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.PREVIEW_PAGE.DISABLED_HIDDEN_ICON.HIDDEN_WHEN');
        dep = item.hiddenDependencyItemId === null ? "" : this.applicationFormItems.find(i => i.id === item.hiddenDependencyItemId).shortname;
        messEnd = this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.PREVIEW_PAGE.DISABLED_HIDDEN_ICON.IS_PREFILLED');
        return `${messStart} ${dep} ${messEnd}`;
      case 'IF_EMPTY':
        messStart = this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.PREVIEW_PAGE.DISABLED_HIDDEN_ICON.HIDDEN_WHEN');
        dep = item.hiddenDependencyItemId === null ? "" : this.applicationFormItems.find(i => i.id === item.hiddenDependencyItemId).shortname;
        messEnd = this.translate.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.PREVIEW_PAGE.DISABLED_HIDDEN_ICON.IS_EMPTY');
        return `${messStart} ${dep} ${messEnd}`;
      default:
        return "";
    }
  }

  getLocalizedLabel(applicationFormItem: ApplicationFormItem): string {
    if (applicationFormItem.i18n[this.currentLanguage] && applicationFormItem.i18n[this.currentLanguage].label) {
      return applicationFormItem.i18n[this.currentLanguage].label;
    }
    return applicationFormItem.shortname;
  }

  getLocalizedHint(applicationFormItem: ApplicationFormItem) {
    if (applicationFormItem.i18n[this.currentLanguage]) {
      return applicationFormItem.i18n[this.currentLanguage].help;
    }
    return '';
  }
}
