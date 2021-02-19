import {Component, HostBinding, OnInit} from '@angular/core';
import {SideMenuService} from '../../../../../core/services/common/side-menu.service';
import {ActivatedRoute} from '@angular/router';
import {MenuItem} from '@perun-web-apps/perun/models';
import { Member, MembersManagerService, Vo, VosManagerService } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-member-settings-overview',
  templateUrl: './member-settings-overview.component.html',
  styleUrls: ['./member-settings-overview.component.scss']
})
export class MemberSettingsOverviewComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(
    private sideMenuService: SideMenuService,
    private voService: VosManagerService,
    private memberManager: MembersManagerService,
    protected route: ActivatedRoute,
  ) {
  }

  items: MenuItem[] = [];
  vo: Vo;
  member: Member;
  loading = false;

  ngOnInit() {
    this.loading = true;
    this.route.parent.parent.params.subscribe(grandParentParams => {
      const voId = grandParentParams['voId'];
      const memberId = grandParentParams['memberId'];
      this.memberManager.getMemberById(memberId).subscribe(member => {
        this.member = member;

        this.voService.getVoById(voId).subscribe(vo => {
          this.vo = vo;

          this.initItems();
          this.loading = false;
        }, () => this.loading = false);
      }, () => this.loading = false);
    });
  }

  private initItems() {
    this.items = [];

  }
}
