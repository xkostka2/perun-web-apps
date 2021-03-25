import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'applicationFormItemHidden'
})
export class ApplicationFormItemHiddenPipe implements PipeTransform {

  constructor(private translateService: TranslateService) { }

  transform(value: unknown, ...args: unknown[]): unknown {
    switch (value) {
      case 'ALWAYS':
      case 'NEVER':
      case 'IF_PREFILLED':
      case 'IF_EMPTY':
        return this.translateService.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.HIDDEN.' + value)
      default:
        return value
    }
  }
}
