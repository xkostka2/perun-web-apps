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
import { MemberLoginsPipe} from './member-logins.pipe';
import { GroupExpirationPipe } from './group-expiration.pipe';
import { MemberOrganizationPipe } from './member-organization.pipe';
import { ParseDatePipe } from './parse-date.pipe';
import { TechnicalOwnersPipe } from './technical-owners.pipe';
import { FilterUniqueObjectsPipe } from './filter-unique-objects.pipe';

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
    MemberLoginsPipe,
    MemberOrganizationPipe,
    GroupExpirationPipe,
    ParseDatePipe,
    TechnicalOwnersPipe,
    FilterUniqueObjectsPipe
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
    MemberLoginsPipe,
    GroupExpirationPipe,
    MemberOrganizationPipe,
    ParseDatePipe,
    TechnicalOwnersPipe,
    FilterUniqueObjectsPipe
  ],
  imports: [CommonModule],
})
export class PerunPipesModule {}
