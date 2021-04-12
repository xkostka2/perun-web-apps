import { Pipe, PipeTransform } from '@angular/core';
import { RichMember } from '@perun-web-apps/perun/openapi';
import { parseMemberStatus } from '@perun-web-apps/perun/utils';

@Pipe({
  name: 'memberStatusTooltip'
})
export class MemberStatusTooltipPipe implements PipeTransform {

  transform(member: RichMember, showGroupStatuses: boolean): string {
    let memberExpiration = null;
    let groupExpiration = null;

    if(member.memberAttributes !== null){
      memberExpiration = member.memberAttributes.find(att => att.friendlyName === 'membershipExpiration');
      groupExpiration = member.memberAttributes.find(att => att.friendlyName === 'groupMembershipExpiration');
    }

    let res = '';
    if(showGroupStatuses) {
      res = `\n Group status: ${parseMemberStatus(member.groupStatus)}, Expiration: ${groupExpiration && groupExpiration.value ? groupExpiration.value as unknown as string : 'never'}`
    } else {
      res = `Status: ${parseMemberStatus(member.status, member.groupStatus)}
             Vo status: ${parseMemberStatus(member.status)}, Expiration: ${memberExpiration && memberExpiration.value ? memberExpiration.value as unknown as string : 'never'}`;
    }
    return res;
  }

}
