import { Component, HostBinding, OnInit } from '@angular/core';
import {
  AuthzResolverService, FacilitiesManagerService, Facility,
  Group, Member, MembersManagerService,
  PerunPrincipal, Resource, ResourcesManagerService, RichResource, User,
  UsersManagerService,
  Vo,
  VosManagerService
} from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.scss']
})
export class UserRolesComponent implements OnInit {

  @HostBinding('class.router-component') true;
  currentIds: any[] = [];

  userId: number;

  roles: Map<string, Map<string, Array<number>>> = new Map<string, Map<string, Array<number>>>();
  principal: PerunPrincipal;

  isGroupAdmin: boolean;
  isVoAdmin: boolean;
  isResourceAdmin: boolean;
  isFacilityAdmin: boolean;
  isTopGroupCreator: boolean;
  hasSponsorship: boolean;
  isSponsor: boolean;
  isResourceSelfService: boolean;
  isVoObserver: boolean;

  roleFilter = ['SELF', 'GROUPADMIN', 'VOADMIN', 'RESOURCEADMIN', 'FACILITYADMIN', 'TOPGROUPCREATOR', 'SPONSORSHIP', 'SPONSOR', 'RESOURCESELFSERVICE', 'VOOBSERVER'];
  roleNames: string[] = [];
  groups: Group[] = [];
  vos: Vo[] = [];
  facilities: Facility[] = [];
  users: User[] = [];
  resources: RichResource[] = [];
  members: Member[] = [];
  outerLoading: boolean;
  loading: boolean;

  constructor(private authzResolverService: AuthzResolverService,
              private usersManagerService: UsersManagerService,
              private vosManagerService: VosManagerService,
              private facilitiesManagerService: FacilitiesManagerService,
              private resourcesManagerService: ResourcesManagerService,
              private membersManagerService: MembersManagerService,
              private route: ActivatedRoute,
              private store: StoreService) {
  }

  ngOnInit() {
    this.outerLoading = true;
    this.route.parent.params.subscribe(params => {
      if (params['userId']) {
        this.userId = params['userId'];
        this.authzResolverService.getUserRoleNames(this.userId).subscribe(roleNames => {
          this.roleNames = roleNames.map(elem => elem.toUpperCase());
          this.authzResolverService.getUserRoles(this.userId).subscribe(roles => {
            this.prepareRoles(roles);
          });
        });
      } else {
        this.principal = this.store.getPerunPrincipal();
        this.userId = this.principal.userId;
        this.roleNames = Object.keys(this.principal.roles);
        this.prepareRoles(this.principal.roles);
      }
    });
  }

  private prepareRoles(roles: { [p: string]: { [p: string]: Array<number> } }) {
    this.roleNames.forEach(roleName => {
      const innerMap = new Map<string, Array<number>>();
      const innerRoles = Object.keys(roles[roleName]);

      innerRoles.forEach(innerRole => {
        innerMap.set(innerRole, roles[roleName][innerRole]);
      });
      switch (roleName) {
        case 'GROUPADMIN':
          this.isGroupAdmin = true;
          break;
        case 'VOADMIN':
          this.isVoAdmin = true;
          break;
        case 'RESOURCEADMIN':
          this.isResourceAdmin = true;
          break;
        case 'FACILITYADMIN':
          this.isFacilityAdmin = true;
          break;
        case 'TOPGROUPCREATOR':
          this.isTopGroupCreator = true;
          break;
        case 'SPONSORSHIP':
          this.hasSponsorship = true;
          break;
        case 'SPONSOR':
          this.isSponsor = true;
          break;
        case 'RESOURCESELFSERVICE':
          this.isResourceSelfService = true;
          break;
        case 'VOOBSERVER':
          this.isVoObserver = true;
          break;
      }

      this.roles.set(roleName, innerMap);
    });
    this.roleNames = this.roleNames.filter(role => !this.roleFilter.includes(role));
    this.outerLoading = false;
  }

  getGroupsAndVos() {
    this.loading = true;
    this.groups = [];
    this.usersManagerService.getGroupsWhereUserIsAdmin(this.userId).subscribe(groups => {
      this.groups = groups;
      const voIds = [...new Set(this.groups.map(group => group.voId))];
      this.getVos(voIds);
    });
  }

  getVos(voIds: number[]) {
    this.loading = true;
    this.vos = [];
    voIds.forEach(id => {
      this.vosManagerService.getVoById(id).subscribe(vo => {
        this.vos.push(vo);
        if (this.vos.length === voIds.length) {
          this.loading = false;
        }
      });
    });
  }

  getInnerKeys(role: string) {
    if (this.roles.get(role)) {
      const it = this.roles.get(role).entries();
      const result = [];
      let val = it.next().value;
      while (val) {
        result.push(val);
        val = it.next().value;
      }
      this.currentIds = result;
    } else {
      this.currentIds = [];
    }
  }

  getAdminVos() {
    this.loading = true;
    this.vos = [];
    this.usersManagerService.getVosWhereUserIsAdmin(this.userId).subscribe(vos => {
      this.vos = vos;
      this.loading = false;
    });
  }

  getAdminFacilities() {
    this.loading = true;
    this.facilities = [];
    this.facilitiesManagerService.getFacilitiesWhereUserIsAdmin(this.userId).subscribe(facilities => {
      this.facilities = facilities;
      this.loading = false;
    });
  }

  getSelfData() {
    this.loading = true;
    this.vos = [];
    this.users = [];
    this.usersManagerService.getVosWhereUserIsMember(this.userId).subscribe(vos => {
      this.vos = vos;

      const ids = this.roles.get('SELF').get('User');
      if (!ids) {
        this.loading = false;
      } else {
        ids.forEach(id => {
          this.usersManagerService.getUserById(id).subscribe(user => {
            this.users.push(user);
            if (this.users.length === ids.length) {
              this.loading = false;
            }
          });
        });
      }

    });
  }

  getResourcesData(role: string) {
    this.loading = true;
    const resourceIds = this.roles.get(role).get('Resource');
    this.vos = [];
    this.facilities = [];
    this.resources = [];
    resourceIds.forEach(id => {
      this.resourcesManagerService.getRichResourceById(id).subscribe(resource => {
        this.resources.push(resource);
        if (!this.vos.find(item => item.id === resource.voId)) {
          this.vos.push(resource.vo);
        }
        if (!this.facilities.find(item => item.id === resource.facilityId)) {
          this.facilities.push(resource.facility);
        }
        if (resourceIds.length === this.resources.length) {
          this.loading = false;
        }
      });
    });
  }


  getMembers() {
    this.loading = true;
    const memberIds = this.roles.get('SPONSORSHIP').get('Member');
    this.members = [];
    memberIds.forEach(id => {
      this.membersManagerService.getRichMember(id).subscribe(member => {
        this.members.push(member);
        if(this.members.length === memberIds.length){
          this.loading = false;
        }
      });
    });
  }

  getObserverVos() {
    this.loading = true;
    this.vos = [];
    const voIds = this.roles.get('VOOBSERVER').get('Vo');
    voIds.forEach(id => {
      this.vosManagerService.getVoById(id).subscribe(vo => {
        this.vos.push(vo);
        if (this.vos.length === voIds.length){
          this.loading = false;
        }
      })
    })
  }
}
