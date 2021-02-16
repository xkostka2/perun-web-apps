import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


import { AttributesManagerService } from './api/attributesManager.service';
import { AuditMessagesManagerService } from './api/auditMessagesManager.service';
import { AuthzResolverService } from './api/authzResolver.service';
import { CabinetManagerService } from './api/cabinetManager.service';
import { DatabaseManagerService } from './api/databaseManager.service';
import { ExtSourcesManagerService } from './api/extSourcesManager.service';
import { FacilitiesManagerService } from './api/facilitiesManager.service';
import { FacilitiesManagerByFacilityNameService } from './api/facilitiesManagerByFacilityName.service';
import { GroupsManagerService } from './api/groupsManager.service';
import { MembersManagerService } from './api/membersManager.service';
import { OwnersManagerService } from './api/ownersManager.service';
import { RTMessagesManagerService } from './api/rTMessagesManager.service';
import { RegistrarManagerService } from './api/registrarManager.service';
import { ResourcesManagerService } from './api/resourcesManager.service';
import { ServicesManagerService } from './api/servicesManager.service';
import { TasksManagerService } from './api/tasksManager.service';
import { UsersManagerService } from './api/usersManager.service';
import { UtilsService } from './api/utils.service';
import { VosManagerService } from './api/vosManager.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: [
    AttributesManagerService,
    AuditMessagesManagerService,
    AuthzResolverService,
    CabinetManagerService,
    DatabaseManagerService,
    ExtSourcesManagerService,
    FacilitiesManagerService,
    FacilitiesManagerByFacilityNameService,
    GroupsManagerService,
    MembersManagerService,
    OwnersManagerService,
    RTMessagesManagerService,
    RegistrarManagerService,
    ResourcesManagerService,
    ServicesManagerService,
    TasksManagerService,
    UsersManagerService,
    UtilsService,
    VosManagerService ]
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders<any> {
        return {
            ngModule: ApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
