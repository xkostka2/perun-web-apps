import { NgModule } from '@angular/core';
import { TableWrapperComponent } from './table-wrapper/table-wrapper.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TableOptionsComponent } from './table-options/table-options.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';


@NgModule({
  imports: [
    MatPaginatorModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
    CommonModule

  ],
  declarations: [
    TableWrapperComponent,
    TableOptionsComponent
  ],
  exports: [
    TableWrapperComponent,
    TableOptionsComponent
  ],
  providers: [
  ]
})
export class PerunUtilsModule {
}
