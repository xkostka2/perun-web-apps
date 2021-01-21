import {Pipe, PipeTransform} from '@angular/core';
import { parseTechnicalOwnersNames } from '@perun-web-apps/perun/utils';

@Pipe({
  name: 'technicalOwners'
})
export class TechnicalOwnersPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return parseTechnicalOwnersNames(value);
  }
}
