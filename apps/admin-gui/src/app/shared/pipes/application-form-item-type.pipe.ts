import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
  name: 'applicationFormItemType'
})
export class ApplicationFormItemTypePipe implements PipeTransform {

  private returnData = '';

  constructor(private translateService: TranslateService) { }

  transform(value: any, ...args: any[]): any {
    switch (value) {
      case 'HEADING': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.HEADER').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'FROM_FEDERATION_HIDDEN': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.FROM_FEDERATION_HIDDEN').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'HTML_COMMENT': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.HTML_COMMENT').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'TEXTFIELD': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.TEXTFIELD').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'FROM_FEDERATION_SHOW': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.FROM_FEDERATION_SHOW').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'VALIDATED_EMAIL': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.VALIDATED_EMAIL').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'USERNAME': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.USERNAME').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'PASSWORD': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.PASSWORD').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'SELECTIONBOX': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.SELECTIONBOX').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'TEXTAREA': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.TEXTAREA').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'COMBOBOX': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.COMBOBOX').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'CHECKBOX': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.CHECKBOX').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'SUBMIT_BUTTON': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.SUBMIT_BUTTON').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'RADIO': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.RADIO').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'TIMEZONE': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.TIMEZONE').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'AUTO_SUBMIT_BUTTON': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.AUTO_SUBMIT_BUTTON').subscribe( text => {
          this.returnData = text;
        });
        break;
      }
      case 'EMBEDDED_GROUP_APPLICATION': {
        this.translateService.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.TYPES.EMBEDDED_GROUP_APPLICATION').subscribe(text => {
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
