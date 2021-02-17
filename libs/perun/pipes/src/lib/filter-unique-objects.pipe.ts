import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterUniqueObjects'
})
export class FilterUniqueObjectsPipe implements PipeTransform {

  /**
   *  Returns array of unique objects according to one of their attribute, that also match the filter
   */
  transform(destinations: any[], filter: string, paramName: string): any[] {
    return destinations.filter(d => d[paramName].includes(filter)).filter(
      (dest, i, arr) => arr.findIndex(d => d[paramName] === dest[paramName]) === i
    );
  }

}
