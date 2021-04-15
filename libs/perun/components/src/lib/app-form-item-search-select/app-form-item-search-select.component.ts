import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApplicationFormItem } from '@perun-web-apps/perun/openapi';
import { TranslateService } from '@ngx-translate/core';

export const NO_FORM_ITEM: ApplicationFormItem = {};

@Component({
  selector: 'perun-web-apps-app-form-item-search-select',
  templateUrl: './app-form-item-search-select.component.html',
  styleUrls: ['./app-form-item-search-select.component.css']
})
export class AppFormItemSearchSelectComponent {

  constructor(private translate: TranslateService) { }

  @Input()
  items: ApplicationFormItem[];
  @Input()
  item: ApplicationFormItem = null;

  @Output()
  itemSelected = new EventEmitter<ApplicationFormItem>();

  nameFunction = (item: ApplicationFormItem) => {
    if (item === NO_FORM_ITEM) {
      return this.translate.instant("SHARED_LIB.PERUN.COMPONENTS.APP_FORM_ITEM_SEARCH_SELECT.NO_ITEM");
    }
    return item.shortname;
  }
  secondaryFunction = (item: ApplicationFormItem) => {
    if (item === NO_FORM_ITEM) {
      return "";
    }
    if (item.id < 0) {
      return this.translate.instant("SHARED_LIB.PERUN.COMPONENTS.APP_FORM_ITEM_SEARCH_SELECT.NEW_ITEM")
    }
    return "#" + item.id;
  }
  searchFunction = (item: ApplicationFormItem) => {
    if (item === NO_FORM_ITEM) {
      return "";
    }
    return item.shortname + item.id;
  }
}
