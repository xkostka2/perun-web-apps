import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceTagsToStringPipe } from './resource-tags-to-string.pipe';
import { IsVirtualAttributePipe } from './is-virtual-attribute.pipe';
import { UserFullNamePipe } from './user-full-name.pipe';
import { ParseLastAccessPipe } from './parse-last-access.pipe';
import { GetMailFromAttributesPipe } from './get-mail-from-attributes.pipe';
import { CustomTranslatePipe } from './custom-translate.pipe';
import { GroupSyncIconPipe } from './group-sync-icon.pipe';
import { GroupSyncToolTipPipe } from './group-sync-tool-tip.pipe';
import { GroupSyncIconColorPipe } from './group-sync-icon-color.pipe';
import { GetResourceRoutePipe } from './get-resource-route.pipe';
import { ServiceStateBlockedToStringPipe } from './service-state-blocked-to-string.pipe';
import { MemberStatusIconColorPipe } from './member-status-icon-color.pipe';
import { MemberStatusIconPipe } from './member-status-icon.pipe';
import { MemberStatusTooltipPipe } from './member-status-tooltip.pipe';
import { MemberEmailPipe } from './member-email.pipe';
import { HighestRolePipe } from './highest-role.pipe';
import { IconForRolePipe } from './icon-for-role.pipe';

@NgModule({
  declarations: [
    ResourceTagsToStringPipe,
    IsVirtualAttributePipe,
    UserFullNamePipe,
    ParseLastAccessPipe,
    GetMailFromAttributesPipe,
    CustomTranslatePipe,
    GroupSyncIconPipe,
    GroupSyncToolTipPipe,
    GroupSyncIconColorPipe,
    GetResourceRoutePipe,
    GroupSyncIconColorPipe,
    ServiceStateBlockedToStringPipe,
    MemberStatusIconColorPipe,
    MemberStatusIconPipe,
    MemberStatusTooltipPipe,
    MemberEmailPipe,
    HighestRolePipe,
    IconForRolePipe
  ],
  exports: [
    ResourceTagsToStringPipe,
    IsVirtualAttributePipe,
    UserFullNamePipe,
    ParseLastAccessPipe,
    GetMailFromAttributesPipe,
    CustomTranslatePipe,
    GroupSyncIconPipe,
    GroupSyncToolTipPipe,
    GroupSyncIconColorPipe,
    GetResourceRoutePipe,
    GroupSyncIconColorPipe,
    ServiceStateBlockedToStringPipe,
    MemberStatusIconColorPipe,
    MemberStatusIconPipe,
    MemberStatusTooltipPipe,
    MemberEmailPipe,
    HighestRolePipe,
    IconForRolePipe
  ],
  imports: [CommonModule],
})
export class PerunPipesModule {}
