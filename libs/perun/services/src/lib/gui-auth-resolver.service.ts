import { Injectable } from '@angular/core';
import { PerunBean, PerunPolicy, PerunPrincipal, RoleManagementRules} from '@perun-web-apps/perun/openapi';
import { Role } from '@perun-web-apps/perun/models';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';

@Injectable({
  providedIn: 'root'
})
export class GuiAuthResolver {

  constructor(private authzSevice: AuthzResolverService) {
  }

  private principal: PerunPrincipal;
  private perunPolicies: PerunPolicy[];
  private allRolesManagementRules: RoleManagementRules[];

  private principalRoles: Set<Role> = new Set<Role>();

  private editableFacilities: number[] = [];
  private editableVos: number[] = [];
  private members: number[] = [];
  private user: number;
  private editableGroups: number[] = [];
  private observableVos: number[] = [];
  private hasGroupInTheseVos: number[] = [];

  init(principal: PerunPrincipal): void {
    this.principal = principal;
    this.initData(principal);
  }

  setPerunPolicies(policies: PerunPolicy[]): void {
    this.perunPolicies =  policies;
  }

  getPerunPolicies(): PerunPolicy[] {
    return this.perunPolicies;
  }

  isAuthorized(policy: string, objects: PerunBean[]): boolean {
    if (this.principal.roles === null) {
      return false;
    }

    const allPolicies: PerunPolicy[] = this.fetchPolicyWithAllIncludedPolicies(policy);
    // console.log('all policies');
    // console.log(allPolicies);
    let policyRoles: Array<{ [key: string]: string; }> = [];
    for (const policyItem of allPolicies){
      policyRoles = policyRoles.concat(policyItem.perunRoles);
    }
    // console.log('pollicy roles');
    // console.log(policyRoles);

    //Fetch super objects like Vo for group etc.
    const mapOfBeans: { [key: string]: number[]; } = this.fetchAllRelatedObjects(objects);
    // console.log('this is map of beans');
    // console.log(mapOfBeans);

    return this.resolveAuthorization(policyRoles, mapOfBeans);
  }

  private resolveAuthorization(policyRoles:Array<{ [key: string]: string; }>, mapOfBeans: { [key: string]: number[]; }) : boolean {
    //Traverse through outer role list which works like logical OR
    for (const roleArray of policyRoles) {
      let authorized = true;
      //Traverse through inner role list which works like logical AND
      for (const role of Object.keys(roleArray)) {
        const roleObject = roleArray[role];
        if (roleObject === null) {
          if (!this.principalRoles.has(role as Role)) authorized = false;
        } else if (!mapOfBeans[roleObject]) authorized = false;
        else {
          for (const objectId of mapOfBeans[roleObject]) {
            if (!this.principalHasRole(role, roleObject, objectId)) {
              authorized = false;
              break;
            }
          }
        }
        if (!authorized) break;
      }
      if (authorized) return true;
    }
    return false;
  }

  private fetchAllRelatedObjects(objects: any[]): {[key: string]: number[];} {
    const mapOfBeans: { [key: string]: number[]; } = {};

    for (const object of objects) {
      let convertedBeanName = object.beanName;
      if (object.beanName.startsWith('Rich')) {
        convertedBeanName = object.beanName.substring(4);
      }
      if (!mapOfBeans[convertedBeanName]) {
        mapOfBeans[convertedBeanName] = [object.id];
      } else {
        mapOfBeans[convertedBeanName].push(object.id);
      }
      switch (convertedBeanName) {
        case 'Member': {
          if (!mapOfBeans['User']) {
            mapOfBeans['User'] = [object.userId];
          } else {
            mapOfBeans['User'].push(object.userId);
          }
          if (!mapOfBeans['Vo']) {
            mapOfBeans['Vo'] = [object.voId];
          } else {
            mapOfBeans['Vo'].push(object.voId);
          }
          break;
        }
        case 'Group': {
          if (!mapOfBeans['Vo']) {
            mapOfBeans['Vo'] = [object.voId];
          } else {
            mapOfBeans['Vo'].push(object.voId);
          }
          break;
        }
        case 'Resource': {
          if (!mapOfBeans['Facility']) {
            mapOfBeans['Facility'] = [object.facilityId];
          } else {
            mapOfBeans['Facility'].push(object.facilityId);
          }
          if (!mapOfBeans['Vo']) {
            mapOfBeans['Vo'] = [object.voId];
          } else {
            mapOfBeans['Vo'].push(object.voId);
          }
          break;
        }
        case 'ResourceTag': {
          if (!mapOfBeans['Vo']) {
            mapOfBeans['Vo'] = [object.voId];
          } else {
            mapOfBeans['Vo'].push(object.voId);
          }
          break;
        }
        default:
          break;
      }
    }
    return mapOfBeans;
  }

  public principalHasRole(role: string, perunBeanName: string, id: number): boolean {
    let convertedBeanName = perunBeanName;
    if (perunBeanName.startsWith('Rich')) {
      convertedBeanName = perunBeanName.substring(4);
    }
    if (this.principal.roles[role]) {
      //console.log(this.principal.roles[role]);
      if (this.principal.roles[role][convertedBeanName]) {
        return this.principal.roles[role][convertedBeanName].includes(Number(id.toString()));
      }
    }
    return false;
  }

  private fetchPolicyWithAllIncludedPolicies(policyName: string): PerunPolicy[] {
    const allIncludedPolicies: Map<string, PerunPolicy> = new Map();
    let policiesToCheck: string[] = [];
    policiesToCheck.push(policyName);

    while (policiesToCheck.length !== 0) {
      const policy = policiesToCheck.shift();
      if (allIncludedPolicies.has(policy)) {
        console.log("Policy {} creates a cycle in the included policies of the policy {}", policy, policyName);
        continue;
      }
      const policyToCheck = this.getPerunPolicy(policy);
      if (!policyToCheck) return [];
      allIncludedPolicies.set(policy, policyToCheck);
      policiesToCheck = policiesToCheck.concat(policyToCheck.includePolicies);
    }

    const includedPolicies = [];
    for (const value of allIncludedPolicies.values()) {
      includedPolicies.push(value);
    }

    return includedPolicies;
  }

  private getPerunPolicy(policyName: string): PerunPolicy {
    for (const policy of this.perunPolicies) {
      if (policy.policyName === policyName) {
        return policy;
      }
    }
    console.log('policy with name' + policyName + 'was not found');
    return null;
  }

  public canManageFacilities(): boolean {
    return this.hasAtLeasOne(Role.PERUNADMIN, Role.FACILITYADMIN, Role.FACILITIYOBSERVER);
  }

  public isPerunAdmin(): boolean {
    return this.principalRoles.has(Role.PERUNADMIN);
  }

  public isVoAdmin(): boolean {
    return this.hasAtLeasOne(Role.PERUNADMIN, Role.VOADMIN);
  }

  public isThisVoAdminOrObserver(id: number): boolean {
    return (this.editableVos.includes(id) || this.observableVos.includes(id) || this.principalRoles.has(Role.PERUNADMIN));
  }

  public isThisVoAdmin(id: number): boolean {
    return (this.editableVos.includes(id) || this.principalRoles.has(Role.PERUNADMIN));
  }

  public isGroupAdmin(): boolean {
    return this.hasAtLeasOne(Role.PERUNADMIN, Role.GROUPADMIN);
  }

  public isOnlySponsor(): boolean {
    return this.hasAtLeasOne(Role.SPONSOR);
  }

  public isThisGroupAdmin(id: number): boolean {
    return (this.editableGroups.includes(id) || this.principalRoles.has(Role.PERUNADMIN));
  }

  public isGroupAdminInThisVo(id: number): boolean {
    return (this.hasGroupInTheseVos.includes(id));
  }

  public isFacilityAdmin(): boolean {
    return this.hasAtLeasOne(Role.PERUNADMIN, Role.FACILITYADMIN);
  }

  public isThisFacilityAdmin(id: number): boolean {
    return (this.editableFacilities.includes(id) || this.principalRoles.has(Role.PERUNADMIN));
  }

  public isResourceAdmin(): boolean {
    return this.hasAtLeasOne(Role.PERUNADMIN, Role.RESOURCEADMIN);
  }

  public isTopGroupCreator(): boolean {
    return this.hasAtLeasOne(Role.PERUNADMIN, Role.TOPGROUPCREATOR);
  }
  public isTopGroupCreatorOnly(): boolean {
    return this.hasAtLeasOne(Role.TOPGROUPCREATOR);
  }

  public isCabinetAdmin(): boolean {
    return this.hasAtLeasOne(Role.PERUNADMIN, Role.CABINETADMIN);
  }

  isVoObserver(): boolean {
    return (this.hasAtLeasOne(Role.PERUNADMIN, Role.VOOBSERVER));
  }

  isThisVoObserver(id: number): boolean {
    return (this.principalRoles.has(Role.PERUNADMIN) || this.observableVos.includes(id));
  }

  public getMemberIds(): number[] {
    return this.members;
  }

  public loadRolesManagementRules(): Promise<void>  {
    return new Promise((resolve, reject) => {
      this.authzSevice.getAllRolesManagementRules().subscribe( allRules => {
        this.allRolesManagementRules = allRules;
        resolve();
      }, error => reject(error));
    });
  }

  public assignAvailableRoles(availableRoles: string[], primaryObject: string) {
    this.allRolesManagementRules.forEach(rule => {
      if(rule.primaryObject === primaryObject) {
        availableRoles.push(rule.roleName);
      }
    });
    availableRoles.sort();
    if(primaryObject === "Vo")
      this.voCustomSort(availableRoles);
  }

  public isManagerPagePrivileged(primaryObject: PerunBean): boolean {
    const availableRoles = [];
    let beanName = primaryObject.beanName;
    if (beanName.startsWith('Rich')) {
      beanName = beanName.substr(4);
    }

    this.assignAvailableRoles(availableRoles, beanName);
    const rolesPrivileges = new Map<string, any>();
    this.getRolesAuthorization(availableRoles, primaryObject, rolesPrivileges);
    for (const privilege of rolesPrivileges.values()) {
     if (privilege.readAuth || privilege.manageAuth) {
       return true;
     }
    }

    return false;
  }

  public getRolesAuthorization(availableRoles: string[], primaryObject: PerunBean, availableRolesPrivileges){
    for (const role of availableRoles) {
      let privilegedReadRoles: Array<{ [key: string]: string; }> = [];
      let privilegedManageRoles: Array<{ [key: string]: string; }> = [];
      let modes = [];
      for (const rule of this.allRolesManagementRules){
        if (rule.roleName === role){
          privilegedReadRoles = privilegedReadRoles.concat(rule.privilegedRolesToRead);
          privilegedManageRoles = privilegedManageRoles.concat(rule.privilegedRolesToManage);

          for (const entity of Object.keys(rule.entitiesToManage)){
            if (entity === "User"){
              modes = [entity].concat(modes);
            } else {
              modes = modes.concat(entity);
            }
          }

          break;
        }
      }

      const mapOfBeans: { [key: string]: number[]; } = this.fetchAllRelatedObjects([primaryObject]);
      const readAuth = this.resolveAuthorization(privilegedReadRoles, mapOfBeans);
      const manageAuth = this.resolveAuthorization(privilegedManageRoles, mapOfBeans);
      availableRolesPrivileges.set(role, {readAuth: readAuth, manageAuth: manageAuth, modes: modes});
    }
  }

  /**
   * Makes specific sort for selector (select role) in VO due to UX
   *
   * @param availableRoles is array of available roles for VO
   */
  private voCustomSort(availableRoles: string[]) {
    for(let i = 0; i < availableRoles.length; i++){
      if (availableRoles[i] === 'VOADMIN') {
        availableRoles.unshift(availableRoles[i]);
        availableRoles.splice(i+1, 1);
      } else if (availableRoles[i] === 'VOOBSERVER') {
        availableRoles.splice(1, 0, availableRoles[i]);
        availableRoles.splice(i+1, 1);
      }
    }
  }

  /**
   * Initialises principal data which are used for later verification
   *
   * @param principal given principal
   */
  private initData(principal: PerunPrincipal) {
    this.user = principal.user.id;
    for (const [key, value] of Object.entries(this.principal.roles)) {
      if (principal.roles.hasOwnProperty(key)) {
        this.principalRoles.add(<Role>key);
      }
      for (const [keyInner, valueInner] of Object.entries(value)) {
        switch (key) {
          case Role.VOADMIN: {
            this.editableVos = <number[]>valueInner;
            break;
          }
          case Role.FACILITYADMIN: {
            this.editableFacilities = <number[]>valueInner;
            break;
          }
          case Role.GROUPADMIN: {
            if (keyInner === 'Group') {
              this.editableGroups = <number[]>valueInner;
            }
            if (keyInner === 'Vo') {
              this.hasGroupInTheseVos = <number[]>valueInner;
            }
            break;
          }
          case Role.SELF: {
            if (keyInner === 'Member') {
              this.members = <number[]>valueInner;
            }
            break;
          }
          case Role.VOOBSERVER: {
            this.observableVos = <number[]>valueInner;
            break;
          }
        }
      }
    }
  }

  /**
   * Returns true if the principal has at least one of the given roles.
   * Otherwise, returns false
   *
   * @param roles specified roles
   */
  private hasAtLeasOne(...roles: Role[]): boolean {
    for (const role of roles) {
      if (this.principalRoles.has(role)) {
        return true;
      }
    }
    return false;
  }

  public getPrimaryObjectOfRole(role: string): string {
    for (const rule of this.allRolesManagementRules) {
      if (rule.roleName === role) {
        return rule.primaryObject;
      }
    }
    return '';
  }
}
