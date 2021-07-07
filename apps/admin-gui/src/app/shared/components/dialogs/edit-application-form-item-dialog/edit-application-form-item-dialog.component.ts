import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import { ApplicationFormItem, AppType, Group, Type } from '@perun-web-apps/perun/openapi';
import { AttributeDefinition, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { createNewApplicationFormItem } from '@perun-web-apps/perun/utils';
import DisabledEnum = ApplicationFormItem.DisabledEnum;
import HiddenEnum = ApplicationFormItem.HiddenEnum;
import { NO_FORM_ITEM } from '@perun-web-apps/perun/components';
import { StoreService } from '@perun-web-apps/perun/services';

export interface EditApplicationFormItemDialogComponentData {
  theme: string;
  voId: number;
  group: Group;
  applicationFormItem: ApplicationFormItem;
  allItems: ApplicationFormItem[];
}

export class SelectionItem {
  value: string;
  displayName: string;

  constructor(displayName: string, value: string) {
    this.value = value;
    this.displayName = displayName;
  }
}

@Component({
  selector: 'app-edit-application-form-item-dialog',
  templateUrl: './edit-application-form-item-dialog.component.html',
  styleUrls: ['./edit-application-form-item-dialog.component.scss']
})
export class EditApplicationFormItemDialogComponent implements OnInit {

  applicationFormItem: ApplicationFormItem;
  attributeDefinitions: AttributeDefinition[];
  federationAttributes: SelectionItem[] = [];
  federationAttribute = '';
  sourceAttributes: SelectionItem[] = [];
  destinationAttributes: SelectionItem[] = [];
  options: {[key:string]:[string, string][]};
  theme: string;
  loading = false;
  hiddenValues: HiddenEnum[] = ['NEVER', 'ALWAYS', 'IF_EMPTY', 'IF_PREFILLED'];
  disabledValues: DisabledEnum[] = ['NEVER', 'ALWAYS', 'IF_EMPTY', 'IF_PREFILLED'];
  possibleDependencyItems: ApplicationFormItem[] = [];

  typesWithUpdatable: Type[] = ['VALIDATED_EMAIL', 'TEXTFIELD', 'TEXTAREA', 'CHECKBOX', 'RADIO', 'SELECTIONBOX', 'COMBOBOX', 'TIMEZONE'];
  typesWithDisabled: Type[] = ['USERNAME', 'PASSWORD', 'VALIDATED_EMAIL', 'TEXTFIELD', 'TEXTAREA', 'CHECKBOX', 'RADIO', 'SELECTIONBOX', 'COMBOBOX'];

  hiddenDependencyItem: ApplicationFormItem = null;
  disabledDependencyItem: ApplicationFormItem = null;
  private dependencyTypes: Type[] = ['PASSWORD', 'VALIDATED_EMAIL', 'TEXTFIELD', 'TEXTAREA', 'CHECKBOX', 'RADIO', 'SELECTIONBOX', 'COMBOBOX', 'USERNAME'];

  languages = ['en'];

  constructor(private dialogRef: MatDialogRef<EditApplicationFormItemDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: EditApplicationFormItemDialogComponentData,
              private attributesManager: AttributesManagerService,
              private translateService: TranslateService,
              private store: StoreService) { }

  ngOnInit() {
    this.languages = this.store.get('supportedLanguages');
    this.hiddenDependencyItem = this.data.allItems.find(item => item.id === this.data.applicationFormItem.hiddenDependencyItemId);
    if (!this.hiddenDependencyItem) {
      this.hiddenDependencyItem = NO_FORM_ITEM;
    }
    this.disabledDependencyItem = this.data.allItems.find(item => item.id === this.data.applicationFormItem.disabledDependencyItemId);
    if (!this.disabledDependencyItem) {
      this.disabledDependencyItem = NO_FORM_ITEM;
    }
    this.theme = this.data.theme;
    this.possibleDependencyItems = this.getPossibleDepItems();
    this.applicationFormItem = createNewApplicationFormItem(this.languages);
    this.copy(this.data.applicationFormItem, this.applicationFormItem);
    this.loading = true;
    this.attributesManager.getAllAttributeDefinitions().subscribe( attributeDefinitions => {
      this.attributeDefinitions = attributeDefinitions;
      this.getDestinationAndSourceAttributes();
      this.loading = false;
    }, () => this.loading = false);
    this.getFederationAttributes();
    this.getFederationAttribute();
    if (this.applicationFormItem.perunDestinationAttribute === null) {
      this.applicationFormItem.perunDestinationAttribute = '';
    }
    if (this.applicationFormItem.perunSourceAttribute === null) {
      this.applicationFormItem.perunSourceAttribute = '';
    }
    this.getOptions();
  }

  private getPossibleDepItems() {
    return [NO_FORM_ITEM].concat(this.data.allItems
        .filter(item => this.dependencyTypes.indexOf(item.type) > -1)
        .filter(item => item.id !== this.data.applicationFormItem.id)
        );
  }

  cancel() {
    this.dialogRef.close();
  }

  submit() {
    this.applicationFormItem.hiddenDependencyItemId = this.hiddenDependencyItem === NO_FORM_ITEM ? null : this.hiddenDependencyItem.id;
    this.applicationFormItem.disabledDependencyItemId = this.disabledDependencyItem === NO_FORM_ITEM ? null : this.disabledDependencyItem.id;
    this.updateOptions();
    this.copy(this.applicationFormItem, this.data.applicationFormItem);
    this.dialogRef.close(true);
  }

  onChangingType(type: AppType) {
    if (this.applicationFormItem.applicationTypes.includes(type)) {
      const index = this.applicationFormItem.applicationTypes.indexOf(type);
      this.applicationFormItem.applicationTypes.splice(index, 1);
    } else {
      this.applicationFormItem.applicationTypes.push(type);
    }
  }

  getDestinationAndSourceAttributes() {
    this.translateService.get('DIALOGS.APPLICATION_FORM_EDIT_ITEM.NO_SELECTED_ITEM').subscribe( noItem => {
      this.sourceAttributes.push(new SelectionItem(noItem, ''));
      this.destinationAttributes.push(new SelectionItem(noItem, ''));
    });

    for (const attribute of this.attributeDefinitions) {
      if (attribute.entity.toLowerCase() === 'user' || attribute.entity.toLowerCase() === 'member') {
        // add only member and user attributes
        this.sourceAttributes.push(
          new SelectionItem(attribute.friendlyName + ' (' + attribute.entity + ' / ' + this.getDefinition(attribute) + ')',
            attribute.namespace + ':' + attribute.friendlyName)
        );
        this.destinationAttributes.push(
          new SelectionItem(attribute.friendlyName + ' (' + attribute.entity + ' / ' + this.getDefinition(attribute) + ')',
            attribute.namespace + ':' + attribute.friendlyName)
        );
      } else if (attribute.entity.toLowerCase() === 'vo') {
        // source attributes can be VO too
        this.sourceAttributes.push(
          new SelectionItem(attribute.friendlyName + ' (' + attribute.entity + ' / ' + this.getDefinition(attribute) + ')',
            attribute.namespace + ':' + attribute.friendlyName)
        );
      } else if (attribute.entity.toLowerCase() === 'group' && this.data.group) {
        // if dialog is for group
        this.sourceAttributes.push(
          new SelectionItem(attribute.friendlyName + ' (' + attribute.entity + ' / ' + this.getDefinition(attribute) + ')',
            attribute.namespace + ':' + attribute.friendlyName)
        );
      }
    }
  }

  getFederationAttributes() {
    this.translateService.get('DIALOGS.APPLICATION_FORM_EDIT_ITEM.NO_SELECTED_ITEM').subscribe( noItem => {
      this.federationAttributes.push(new SelectionItem(noItem, ''));
      this.translateService.get('DIALOGS.APPLICATION_FORM_EDIT_ITEM.CUSTOM_VALUE').subscribe( custom => {
        this.federationAttributes.push(new SelectionItem(custom, 'custom'));
        this.federationAttributes.push(new SelectionItem('Display name', 'displayName'));
        this.federationAttributes.push(new SelectionItem('Common name', 'cn'));
        this.federationAttributes.push(new SelectionItem('Mail', 'mail'));
        this.federationAttributes.push(new SelectionItem('Organization', 'o'));
        this.federationAttributes.push(new SelectionItem('Level of Assurance (LoA)', 'loa'));
        this.federationAttributes.push(new SelectionItem('First name', 'givenName'));
        this.federationAttributes.push(new SelectionItem('Surname', 'sn'));
        this.federationAttributes.push(new SelectionItem('EPPN', 'eppn'));
        this.federationAttributes.push(new SelectionItem('IdP Category', 'md_entityCategory'));
        this.federationAttributes.push(new SelectionItem('IdP Affiliation', 'affiliation'));
        this.federationAttributes.push(new SelectionItem('EduPersonScopedAffiliation', 'eduPersonScopedAffiliation'));
        this.federationAttributes.push(new SelectionItem('Forwarded Affiliation from Proxy', 'forwardedScopedAffiliation'));
        this.federationAttributes.push(new SelectionItem('schacHomeOrganization', 'schacHomeOrganization'));
        this.federationAttributes.push(new SelectionItem('Login', 'uid'));
        this.federationAttributes.push(new SelectionItem('Alternative login name', 'alternativeLoginName'));
      });
    });
  }

  getFederationAttribute() {
    if (this.applicationFormItem.federationAttribute) {
      for (const attribute of this.federationAttributes) {
        if (attribute.value === this.applicationFormItem.federationAttribute) {
          this.federationAttribute = attribute.value;
          return;
        }
      }
      this.federationAttribute = 'custom';
    }
  }

  federationAttributeschanged() {
    if (this.federationAttribute !== 'custom') {
      this.applicationFormItem.federationAttribute = this.federationAttribute;
    } else {
      this.applicationFormItem.federationAttribute = '';
    }
  }

  private getDefinition(attribute: AttributeDefinition) {
    const temp = attribute.namespace.split(':');
    if (temp[4] === null ) {
      return 'null';
    }
    return temp[4];
  }

  addOption(lang: string) {
    this.options[lang].push(['', '']);
  }

  updateOption(lang: string){
    let options = '';
    if (this.options && this.options[lang]){
      for (const item of this.options[lang]) {
        if (item[0] !== '' && item[1] !== '') {
          if (options === '') {
            options = item[0] + '#' + item[1];
          } else {
            options = options + '|' + item[0] + '#' + item[1];
          }
        }
      }
    }
    this.applicationFormItem.i18n[lang].options = options;
  }

  updateOptions() {
    for (const lang of this.languages) {
      this.updateOption(lang);
    }
  }

  copy(from: ApplicationFormItem, to: ApplicationFormItem) {
    to.applicationTypes = from.applicationTypes;
    to.federationAttribute = from.federationAttribute;
    to.forDelete = from.forDelete;
    for (const lang of this.languages) {
      to.i18n[lang].errorMessage = from.i18n[lang].errorMessage;
      to.i18n[lang].help = from.i18n[lang].help;
      to.i18n[lang].label = from.i18n[lang].label;
      to.i18n[lang].options = from.i18n[lang].options;
    }
    to.id = from.id;
    to.ordnum = from.ordnum;
    to.perunDestinationAttribute = from.perunDestinationAttribute;
    to.perunSourceAttribute = from.perunSourceAttribute;
    to.regex = from.regex;
    to.required = from.required;
    to.shortname = from.shortname;
    to.type = from.type;
    to.updatable = from.updatable;
    to.disabled = from.disabled;
    to.hidden = from.hidden;
    to.disabledDependencyItemId = from.disabledDependencyItemId;
    to.hiddenDependencyItemId = from.hiddenDependencyItemId;
  }

  sortOptionsAZ(lang: string) {
    this.options[lang] = this.options[lang].sort((n1, n2) => {
      if (n1[1] > n2[1]) {
        return 1;
      }

      if (n1[1] < n2[1]) {
        return -1;
      }

      return 0;
    });
  }

  sortOptionsZA(lang: string) {
    this.options[lang] = this.options[lang].sort((n1, n2) => {
      if (n1[1] > n2[1]) {
        return -1;
      }

      if (n1[1] < n2[1]) {
        return 1;
      }

      return 0;
    });
  }

  private getOptions() {
    for (const lang of this.languages) {
      if (this.applicationFormItem.i18n[lang].options) {
        const temp = this.applicationFormItem.i18n[lang].options.split('|');
        for (const item of temp) {
          const line = item.split('#');
          this.options[lang].push([line[0], line[1]]);
        }
      }
    }
  }

  isApplicationFormItemOfType(types: string[]):boolean {
    return types.indexOf(this.applicationFormItem.type) > -1;
  }
}
