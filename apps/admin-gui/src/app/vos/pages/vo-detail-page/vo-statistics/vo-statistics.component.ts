import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MembersManagerService, VosManagerService } from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-vo-statistics',
  templateUrl: './vo-statistics.component.html',
  styleUrls: ['./vo-statistics.component.scss']
})
export class VoStatisticsComponent implements OnInit {

  constructor(private voService: VosManagerService,
              private memberService: MembersManagerService,
              protected route: ActivatedRoute,) { }

  loading = false;

  voId: number;

  dataSource = new MatTableDataSource<string>();
  displayedColumns = ['status', 'count'];

  statuses: string[] = ['VALID', 'INVALID', 'EXPIRED', 'DISABLED'];
  rowNames: string[] = ['Members', 'Valid', 'Invalid', 'Expired', 'Disabled'];
  membersCount: Map<string, number> = new Map<string, number>([
    ['members', 0],
    ['valid', 0],
    ['invalid', 0],
    ['expired', 0],
    ['disabled', 0]
  ]);

  ngOnInit(): void {
    this.loading = true;
    this.route.parent.params.subscribe(parentParams => {
      this.voId = parentParams['voId'];

      this.dataSource = new MatTableDataSource<string>(this.rowNames);

      this.memberService.getMembersCount(this.voId).subscribe(count => {
        this.membersCount.set('members', count);
        this.getCount(this.statuses);

      }, () => this.loading = false);
    }, () => this.loading = false);
  }

  getCount(statuses: string[]) {
    this.loading = true;
    if (statuses.length === 0) {
      this.loading = false;
      return
    }

    const status = statuses.pop();
    this.memberService.getMembersWithStatusCount(this.voId, status).subscribe(count => {
      this.membersCount.set(status.toLowerCase(), count);
      this.getCount(statuses);
    }, () => this.loading = false);
  }

}
