import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Vo } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-vo-search-select',
  templateUrl: './vo-search-select.component.html',
  styleUrls: ['./vo-search-select.component.css']
})
export class VoSearchSelectComponent {

  constructor() { }

  @Input()
  vos: Vo[];

  @Output()
  voSelected = new EventEmitter<Vo>();

  nameFunction = (vo: Vo) => vo.name;
  shortNameFunction = (vo: Vo) => vo.shortName;
  searchFunction = (vo: Vo) => vo.name + vo.shortName + vo.id;
}
