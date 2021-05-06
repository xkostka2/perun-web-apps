import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginScreenComponent } from './login-screen/login-screen.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoginScreenBaseComponent } from './login-screen-base/login-screen-base.component';
import { RouterModule } from '@angular/router';
import { PerunSharedComponentsModule } from '@perun-web-apps/perun/components';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    PerunSharedComponentsModule,
    TranslateModule
  ],
  declarations: [
    LoginScreenComponent,
    LoginScreenBaseComponent
  ],
  exports: [
    LoginScreenBaseComponent,
    LoginScreenComponent
  ],
})
export class PerunLoginModule {}
