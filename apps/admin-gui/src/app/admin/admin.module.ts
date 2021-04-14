import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import {SharedModule} from '../shared/shared.module';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AdminOverviewComponent } from './pages/admin-page/admin-overview/admin-overview.component';
import { AdminAttributesComponent } from './pages/admin-page/admin-attributes/admin-attributes.component';
import { AdminVisualizerComponent } from './pages/admin-page/admin-visualizer/admin-visualizer.component';
import {
  VisualizerAttrModulesComponent
} from './pages/admin-page/admin-visualizer/visualizer-attr-modules/visualizer-attr-modules.component';
import { VisualizerOverviewComponent } from './pages/admin-page/admin-visualizer/visualizer-overview/visualizer-overview.component';
import {
  UserDestinationRelationshipComponent
} from './pages/admin-page/admin-visualizer/user-destination-relationship/user-destination-relationship.component';
import {
  UserDestinationGraphComponent
} from './pages/admin-page/admin-visualizer/user-destination-relationship/user-destination-graph/user-destination-graph.component';
import { AdminUsersComponent } from './pages/admin-page/admin-users/admin-users.component';
import { AdminUserDetailPageComponent } from './pages/admin-user-detail-page/admin-user-detail-page.component';
import { UiAlertsModule } from '@perun-web-apps/ui/alerts';
import { AdminExtSourcesComponent } from './pages/admin-page/admin-ext-sources/admin-ext-sources.component';
import { PerunSharedComponentsModule } from '@perun-web-apps/perun/components';
import { PerunPipesModule } from '@perun-web-apps/perun/pipes';
import { AdminServicesComponent } from './pages/admin-page/admin-services/admin-services.component';
import { ServiceDetailPageComponent } from './pages/admin-page/admin-services/service-detail-page/service-detail-page.component';
import { ServiceOverviewComponent } from './pages/admin-page/admin-services/service-detail-page/service-overview/service-overview.component';
import { ServiceRequiredAttributesComponent } from './pages/admin-page/admin-services/service-detail-page/service-required-attributes/service-required-attributes.component';
import { UsersModule } from '../users/users.module';
import { ServiceDestinationsComponent } from './pages/admin-page/admin-services/service-detail-page/service-destinations/service-destinations.component';
import { AdminOwnersComponent } from './pages/admin-page/admin-owners/admin-owners.component';

@NgModule({
  declarations: [
    AdminPageComponent,
    AdminOverviewComponent,
    AdminAttributesComponent,
    AdminVisualizerComponent,
    VisualizerAttrModulesComponent,
    VisualizerOverviewComponent,
    UserDestinationRelationshipComponent,
    UserDestinationGraphComponent,
    AdminUsersComponent,
    AdminUserDetailPageComponent,
    AdminExtSourcesComponent,
    AdminServicesComponent,
    ServiceDetailPageComponent,
    ServiceOverviewComponent,
    ServiceRequiredAttributesComponent,
    ServiceDestinationsComponent,
    AdminOwnersComponent
  ],
  imports: [
    NgxGraphModule,
    NgxChartsModule,
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    UiAlertsModule,
    PerunSharedComponentsModule,
    PerunPipesModule,
    UsersModule
  ]
})
export class AdminModule { }
