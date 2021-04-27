import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {NotificatorService} from '@perun-web-apps/perun/services';
import { ApplicationFormItem, Type } from '@perun-web-apps/perun/openapi';
import { createNewApplicationFormItem } from '@perun-web-apps/perun/utils';
import { FormControl, Validators } from '@angular/forms';

export interface AddApplicationFormItemDialogComponentData {
  applicationFormItems: ApplicationFormItem[];
  fakeId: number;
}

@Component({
  selector: 'app-add-application-form-item-dialog',
  templateUrl: './add-application-form-item-dialog.component.html',
  styleUrls: ['./add-application-form-item-dialog.component.scss']
})
export class AddApplicationFormItemDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<AddApplicationFormItemDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: AddApplicationFormItemDialogComponentData,
              private translateService: TranslateService,
              private notificationService: NotificatorService) { }

  items: string[] = [];
  selectedItem: string;
  selectedWidget = 'HEADING';
  widgets = ['HEADING', 'FROM_FEDERATION_HIDDEN', 'HTML_COMMENT', 'TEXTFIELD', 'FROM_FEDERATION_SHOW', 'VALIDATED_EMAIL', 'USERNAME',
            'PASSWORD', 'SELECTIONBOX', 'TEXTAREA', 'COMBOBOX', 'CHECKBOX', 'SUBMIT_BUTTON', 'RADIO', 'TIMEZONE', 'AUTO_SUBMIT_BUTTON', 'EMBEDDED_GROUP_APPLICATION'];
  nameCtrl: FormControl;

  ngOnInit() {
    this.translateService.get('DIALOGS.APPLICATION_FORM_ADD_ITEM.INSERT_TO_BEGINNING').subscribe( text => {
      this.nameCtrl = new FormControl('', [Validators.required, Validators.pattern('.*[\\S]+.*'), Validators.maxLength(129)]);
      this.nameCtrl.markAllAsTouched();
      this.items.push(text);
      for (const item of this.data.applicationFormItems) {
        this.items.push(item.shortname);
      }
      this.selectedItem = text;
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }

  submit() {
      const item = this.createApplicationItem();
      this.dialogRef.close([this.data.applicationFormItems, item]);
  }

  createApplicationItem(): ApplicationFormItem {
    const newApplicationItem = createNewApplicationFormItem();
    newApplicationItem.id = this.data.fakeId;
    newApplicationItem.shortname = this.nameCtrl.value;
    newApplicationItem.type = this.selectedWidget as Type;
    for (let i = 0; i < this.items.length; i++) {
      if (this.selectedItem === this.items[i]) {
        this.data.applicationFormItems.splice(i, 0, newApplicationItem);
        return newApplicationItem;
      }
    }
  }
}


