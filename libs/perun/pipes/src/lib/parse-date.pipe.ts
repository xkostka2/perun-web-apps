import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'parseDate'
})
export class ParseDatePipe implements PipeTransform {

  transform(value: string, showTime?: boolean): string {
    if(!value || value.toLowerCase() === 'never'){
      return 'never';
    }
    return formatDate(value.replace(" ", "T"), `d.M.yyyy ${showTime ? 'H:mm:ss': ''}`, 'en');
  }

}
