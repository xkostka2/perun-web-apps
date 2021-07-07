import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StoreService } from '@perun-web-apps/perun/services';

@Pipe({
  name: 'customTranslate'
})
export class CustomTranslatePipe implements PipeTransform {

  constructor(private translate: TranslateService,
              private storage: StoreService) {
  }

  transform(value: string, lang='en'): any {
    const customLabelElements = this.storage.get('custom_labels');
    if(customLabelElements){
      const keys = Object.keys(customLabelElements);
      for (const key of keys) {
        const element = this.storage.get('custom_labels', key);
        if (element.label === value) {
          return element[lang];
        }
      }
    }
    return value;
  }
}
