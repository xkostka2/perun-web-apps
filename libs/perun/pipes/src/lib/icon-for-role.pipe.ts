import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iconForRole'
})
export class IconForRolePipe implements PipeTransform {

  transform(role: string): string {
    if(role === 'VO ADMIN'){
      return 'perun-vo-black'
    }
    if(role === 'FACILITY ADMIN'){
      return 'perun-facility-black'
    }
    if(role.includes(',')){
      return 'settings-blue'
    }
    if(role.toLowerCase().includes('resource')){
      return 'perun-resource-black'
    }
    if(role.toLowerCase().includes('group')){
      return 'perun-group-black'
    }
    return 'perun-user'
  }

}
