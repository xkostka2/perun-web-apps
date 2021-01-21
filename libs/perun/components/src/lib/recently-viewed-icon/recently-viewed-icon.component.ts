import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'perun-web-apps-recently-viewed-icon',
  templateUrl: './recently-viewed-icon.component.html',
  styleUrls: ['./recently-viewed-icon.component.css']
})
export class RecentlyViewedIconComponent implements OnChanges {

  constructor() { }

  @Input()
  recentIds: number[];

  @Input()
  id: number;

  ngOnChanges(changes: SimpleChanges) {
  }

}
