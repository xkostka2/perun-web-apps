import { Pipe, PipeTransform } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
  name: 'applicationFormWidgetDescription'
})
export class ApplicationFormWidgetDescriptionPipe implements PipeTransform {

  private returnData = '';

  constructor(private translateService: TranslateService) { }

  transform(value: any, ...args: any[]): any {
    switch (value) {
      case 'HEADING': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.HEADER').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'FROM_FEDERATION_HIDDEN': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.FROM_FEDERATION_HIDDEN').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'HTML_COMMENT': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.HTML_COMMENT').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'TEXTFIELD': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.TEXTFIELD').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'FROM_FEDERATION_SHOW': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.FROM_FEDERATION_SHOW').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'VALIDATED_EMAIL': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.VALIDATED_EMAIL').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'USERNAME': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.USERNAME').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'PASSWORD': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.PASSWORD').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'SELECTIONBOX': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.SELECTIONBOX').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'TEXTAREA': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.TEXTAREA').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'COMBOBOX': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.COMBOBOX').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'CHECKBOX': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.CHECKBOX').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'SUBMIT_BUTTON': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.SUBMIT_BUTTON').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'RADIO': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.RADIO').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'TIMEZONE': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.TIMEZONE').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'AUTO_SUBMIT_BUTTON': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.AUTO_SUBMIT_BUTTON').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'EMBEDDED_GROUP_APPLICATION': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.WIDGET_DESCRIPTION.EMBEDDED_GROUP_APPLICATION').subscribe(text => {
          this.returnData = text;
        });
        break;
      }
      default: {
        return value;
      }
    }
    return this.returnData;
  }

}
