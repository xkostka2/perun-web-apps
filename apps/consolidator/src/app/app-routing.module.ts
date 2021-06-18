import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { WelcomePageComponent } from './pages/welcome-page/welcome-page.component';
import { NewIdentityPageComponent } from './pages/new-identity-page/new-identity-page.component';
import { ConsolidatePageComponent } from './pages/consolidate-page/consolidate-page.component';

const routes: Routes = [
  {
    path: '',
    component: WelcomePageComponent
  },
  {
    path: 'identities',
    component: HomePageComponent
  },
  {
    path: 'identityAuth',
    component: NewIdentityPageComponent
  },
  {
    path: 'consolidate',
    component: ConsolidatePageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
    relativeLinkResolution: 'legacy'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
