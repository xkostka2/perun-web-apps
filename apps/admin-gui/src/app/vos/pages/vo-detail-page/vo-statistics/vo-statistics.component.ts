import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { VosManagerService } from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-vo-statistics',
  templateUrl: './vo-statistics.component.html',
  styleUrls: ['./vo-statistics.component.scss']
})
export class VoStatisticsComponent implements OnInit {

  constructor(private voService: VosManagerService,
              protected route: ActivatedRoute,) { }

  loading = false;

  voId: number;

  dataSource = new MatTableDataSource<string>();
  displayedColumns = ['status', 'count'];

  rowNames: string[] = ['Members', 'Valid', 'Invalid', 'Expired', 'Disabled'];
  allMembersCount: number;
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

      this.voService.getVoMembersCountsByStatus(this.voId).subscribe(numOfMembersByStatus => {
        this.allMembersCount = 0;

        for (const status of Object.keys(numOfMembersByStatus)) {
          this.membersCount.set(status.toLowerCase(), numOfMembersByStatus[status]);
          this.allMembersCount += numOfMembersByStatus[status];
        }

        this.membersCount.set('members', this.allMembersCount);
        this.loading = false;
      }, () => this.loading = false);
    }, () => this.loading = false);
  }

}
