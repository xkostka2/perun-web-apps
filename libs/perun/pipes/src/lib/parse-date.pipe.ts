import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'parseDate'
})
export class ParseDatePipe implements PipeTransform {

  transform(value: string): string {
    if(!value || value.toLowerCase() === 'never'){
      return value;
    }
    return formatDate(value, 'd.M.yyyy', 'en');
  }

}
