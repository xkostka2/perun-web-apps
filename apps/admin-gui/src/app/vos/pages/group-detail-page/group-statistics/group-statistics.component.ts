import { Component, OnInit } from '@angular/core';
import {  GroupsManagerService } from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-group-statistics',
  templateUrl: './group-statistics.component.html',
  styleUrls: ['./group-statistics.component.scss']
})
export class GroupStatisticsComponent implements OnInit {

  constructor( private route: ActivatedRoute,
               private groupService: GroupsManagerService) { }

  loading = false;

  groupId: number;

  voStatusCountsRowNames: string[] = ['Members', 'Valid', 'Invalid', 'Expired', 'Disabled'];
  membersCountsByVoStatus: Map<string, number> = new Map<string, number>();

  groupStatusCountsRowNames: string[] = ['Members', 'Valid', 'Expired'];
  membersCountsByGroupStatus: Map<string, number> = new Map<string, number>();

  ngOnInit(): void {
    this.loading = true;
    this.route.parent.params.subscribe(params => {
      this.groupId = params['groupId'];

        this.groupService.getGroupMembersCount(this.groupId).subscribe(count => {
          this.membersCountsByVoStatus.set('members', count);
          this.membersCountsByGroupStatus.set('members', count);

          this.groupService.getGroupMembersCountsByVoStatus(this.groupId).subscribe(statsVo => {
            Object.entries(statsVo).forEach(([status, countVo]) =>
              this.membersCountsByVoStatus.set(status.toLowerCase(), countVo)
            );
            this.groupService.getGroupMembersCountsByGroupStatus(this.groupId).subscribe(statsGroup => {
              Object.entries(statsGroup).forEach(([status, countGroup]) =>
                this.membersCountsByGroupStatus.set(status.toLowerCase(), countGroup)
              );
              this.loading = false;
            }, () => this.loading = false);
          }, () => this.loading = false);
          }, () => this.loading = false);
        }, () => this.loading = false);
  }
}
