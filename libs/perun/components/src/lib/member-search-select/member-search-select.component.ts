import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RichMember } from '@perun-web-apps/perun/openapi';
import { parseFullName } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-member-search-select',
  templateUrl: './member-search-select.component.html',
  styleUrls: ['./member-search-select.component.css']
})
export class MemberSearchSelectComponent {

  constructor() { }

  @Input()
  members: RichMember[];

  @Output()
  memberSelected = new EventEmitter<RichMember>();
  memberFullNameFunction = (member: RichMember) => parseFullName(member.user);
}
