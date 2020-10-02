import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highestRole'
})
export class HighestRolePipe implements PipeTransform {

  transform(entityId: number, entities: ('Vo' | 'Facility' | 'User' | 'Member' | 'Group' | 'Resource')[], rolesObject: { [p: string]: { [p: string]: Array<number> } }): string {
    const roleNames = Object.keys(rolesObject);
    const roles = [];
    for(const entity of entities){
      roleNames.forEach(role=>{
        if(rolesObject[role][entity] && rolesObject[role][entity].includes(entityId)){
          roles.push(role);
        }
      });
    }
    if(roles.includes('VOADMIN')){
      return 'VO ADMIN'
    }
    if (roles.includes('FACILITYADMIN')){
      return 'FACILITY ADMIN'
    }
    if (!roles.length){
      return 'MEMBER';
    }
    return roles.join(', ');
  }

}
