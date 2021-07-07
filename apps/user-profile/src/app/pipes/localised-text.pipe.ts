import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localisedText',
})
export class LocalisedTextPipe implements PipeTransform {

  transform(element: any, lang:string, type: string): string {
    return element[`${type}_${lang}`];
  }

}
