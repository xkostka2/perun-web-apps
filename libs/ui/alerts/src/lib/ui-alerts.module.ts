import { NgModule } from '@angular/core';
import { AlertComponent } from './alert/alert.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@NgModule({
  exports: [
    AlertComponent
  ],
  imports: [
    MatIconModule,
    CommonModule
  ],
  declarations: [
    AlertComponent
  ]
})
export class UiAlertsModule {
}
