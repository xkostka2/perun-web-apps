import { Component, OnInit } from '@angular/core';
import {
  Member,
  MembersManagerService,
  PerunBean,
  ResourcesManagerService,
  RichResource
} from '@perun-web-apps/perun/openapi';
import { MatDialog} from '@angular/material/dialog';
import {
  TABLE_MEMBER_RESOURCE_LIST,
  TableConfigService } from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AddMemberToResourceDialogComponent } from '../../../../shared/components/dialogs/add-member-to-resource-dialog/add-member-to-resource-dialog.component';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-member-resources',
  templateUrl: './member-resources.component.html',
  styleUrls: ['./member-resources.component.scss']
})
export class MemberResourcesComponent implements OnInit {

  constructor(private dialog: MatDialog,
              private tableConfigService: TableConfigService,
              private memberManager: MembersManagerService,
              private resourceManager: ResourcesManagerService,
              private route: ActivatedRoute,
              private authResolver: GuiAuthResolver) { }


  member: Member;
  resources: RichResource[] = [];

  filterValue: String = "";
  loading = false;
  displayedColumns: String[] = ['id','role', 'name', 'vo', 'facility', 'tags', 'description'];

  pageSize: number;
  tableId = TABLE_MEMBER_RESOURCE_LIST;

  routeAuth: boolean;
  addAuth: boolean;

  ngOnInit(): void {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);

    this.route.parent.params.subscribe( parentParams => {
      const memberId = parentParams['memberId'];

      this.memberManager.getMemberById(memberId).subscribe(member => {
        this.member = member;
        this.refreshTable();
      });
    });
  }

  addResource(){
    const config  = getDefaultDialogConfig();
    config.width = '1200px';
    config.data = {
      memberId: this.member.id,
      voId: this.member.voId,
      theme: 'member-theme'
    };

    const dialogRef = this.dialog.open(AddMemberToResourceDialogComponent, config);

    dialogRef.afterClosed().subscribe( result => {
      if(result){
        this.refreshTable();
      }
    });
  }

  refreshTable() {
    this.loading = true;
    this.resourceManager.getAssignedRichResourcesWithMember(this.member.id).subscribe(resources => {
      this.resources = resources;
      this.setAuthRights();
      this.loading = false;
    });
  }

  setAuthRights(){
    const vo: PerunBean = {
      id: this.member.voId,
      beanName: 'Vo'
    };

    this.addAuth = this.authResolver.isAuthorized('getRichResources_Vo_policy', [vo]) &&
      this.authResolver.isAuthorized('addMembers_Group_List<Member>_policy', [vo]);

    if(this.resources.length !== 0){
      this.routeAuth = this.authResolver.isAuthorized('getResourceById_int_policy', [vo, this.resources[0]]);
    }
  }

  applyFilter(filterValue: String){
    this.filterValue = filterValue;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

}
