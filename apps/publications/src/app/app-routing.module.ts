import {NgModule} from '@angular/core';
import {NoPreloading, RouterModule, Routes} from '@angular/router';
import { AllPublicationsPageComponent } from './pages/all-publications-page/all-publications-page.component';
import { MyPublicationsPageComponent } from './pages/my-publications-page/my-publications-page.component';
import { CreatePublicationPageComponent } from './pages/create-publication-page/create-publication-page.component';
import { AuthorsPageComponent } from './pages/authors-page/authors-page.component';
import { CategoriesPageComponent } from './pages/categories-page/categories-page.component';
import { PublicationSystemsPageComponent } from './pages/publication-systems-page/publication-systems-page.component';
import { AuthorDetailComponent } from './pages/author-detail/author-detail.component';
import { PublicationDetailComponent } from './pages/publication-detail/publication-detail.component';
import { LoginScreenComponent } from '@perun-web-apps/perun/login';

const routes: Routes = [
  {
    path: '',
    redirectTo:'all-publications',
    pathMatch:'full'
  },
  {
    path: 'login',
    component: LoginScreenComponent
  },
  {
    path: 'all-publications',
    component: AllPublicationsPageComponent
  },
  {
    path: 'my-publications',
    component: MyPublicationsPageComponent
  },
  {
    path: 'create-publication',
    component: CreatePublicationPageComponent
  },
  {
    path: 'authors',
    component: AuthorsPageComponent
  },
  {
    path: 'authors/:authorId',
    component: AuthorDetailComponent,
  },
  {
    path: 'authors/:authorId/publication/:publicationId',
    component: PublicationDetailComponent
  },
  {
    path: 'all-publications/:publicationId',
    component: PublicationDetailComponent
  },
  {
    path: 'my-publications/:publicationId',
    component: PublicationDetailComponent
  },
  {
    path: 'categories',
    component: CategoriesPageComponent
  },
  {
    path: 'publication-systems',
    component: PublicationSystemsPageComponent
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: NoPreloading,
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
