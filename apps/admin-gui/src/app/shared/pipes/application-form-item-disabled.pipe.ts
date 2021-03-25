import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'applicationFormItemDisabled'
})
export class ApplicationFormItemDisabledPipe implements PipeTransform {

  constructor(private translateService: TranslateService) { }

  transform(value: unknown, ...args: unknown[]): unknown {
    switch (value) {
      case 'ALWAYS':
      case 'NEVER':
      case 'IF_PREFILLED':
      case 'IF_EMPTY':
        return this.translateService.instant('VO_DETAIL.SETTINGS.APPLICATION_FORM.DISABLED.' + value)
      default:
        return value
    }
  }
}
