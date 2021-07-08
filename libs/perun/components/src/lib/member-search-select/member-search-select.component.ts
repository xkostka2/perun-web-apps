import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RichMember } from '@perun-web-apps/perun/openapi';
import { compareFnUser, parseFullName } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-member-search-select',
  templateUrl: './member-search-select.component.html',
  styleUrls: ['./member-search-select.component.css']
})
export class MemberSearchSelectComponent implements OnInit{

  constructor() { }

  @Input()
  members: RichMember[];

  @Output()
  memberSelected = new EventEmitter<RichMember>();
  memberFullNameFunction = (member: RichMember) => parseFullName(member.user);

  ngOnInit(): void {
    this.members = this.members.sort(compareFnUser);
  }
}
