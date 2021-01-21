import { Component, OnInit } from '@angular/core';
import { getRecentlyVisitedIds } from '@perun-web-apps/perun/utils';

export interface RecentItem {
  url: string;
  label: string;
  style: string;
  cssIcon: string;
  type: string;
}

@Component({
  selector: 'app-perun-web-apps-dashboard-recently-viewed-button-field',
  templateUrl: './dashboard-recently-viewed-button-field.component.html',
  styleUrls: ['./dashboard-recently-viewed-button-field.component.scss']
})
export class DashboardRecentlyViewedButtonFieldComponent implements OnInit {

  constructor() { }

  items: RecentItem[] = [];

  voId: number;

  ngOnInit() {
    const recent = getRecentlyVisitedIds('recent');
    for (const item of recent) {
      switch (item.type) {
        case 'Vo': {
          this.items.push({
            cssIcon: 'perun-vo',
            url: `/organizations/${item.id}`,
            label: item.name,
            style: 'vo-btn',
            type: 'Organization'
          });
          break;
        }
        case 'Group': {
          this.items.push({
            cssIcon: 'perun-group',
            url: `/organizations/${item.voId}/groups/${item.id}`,
            label: item.name,
            style: 'group-btn',
            type: 'Group'
          });
          break;
        }
        case 'Facility': {
          this.items.push({
            cssIcon: 'perun-facility-white',
            url: `/facilities/${item.id}`,
            label: item.name,
            style: 'facility-btn',
            type: 'Facility'
          });
          break;
        }
      }

    }
  }
}
